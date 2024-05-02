import fs from 'fs'
import readline from 'readline'
import axios from 'axios'
import { IGameMatch, IGameReport, IPlayerRanking, IRanking } from '../@types'
import { isEmptyObject, sortObjectByKey, sortObjectByValue } from '../utils/object'


interface PlayerStats {
    kdRatio: number;
    totalKills: number;
}

export class QuakeLogModel {

    protected reportArray: IGameReport = {}

    calculatePlayerScoreAll({ playerRanking }: IPlayerRanking): IRanking<number> {
        const scores: { [player: string]: number } = {};

        Object.keys(playerRanking.kills).forEach(player => {
            const totalKills = playerRanking.kills[player];
            const kdRatio = playerRanking.kd_ratio[player];
            const score = this.calculatePlayerScore({kdRatio, totalKills});
            scores[player] = score;
        });

        return sortObjectByValue(scores);
    }

    calculatePlayerScore(playerStats: PlayerStats, weightFactor: number = 10): number {
        return parseFloat(((playerStats.kdRatio * weightFactor) + playerStats.totalKills).toFixed(2));
    }
    
    calculateStandardEfficiency(games: IGameReport): IRanking<number> {
        const playerStats: { [key: string]: { totalKills: number; totalDeaths: number } } = {};
        const playerEfficiency: IRanking<number> = {};
    
        // Agregando kills e deaths de todas as partidas
        Object.values(games).forEach(game => {
            game.players.forEach(player => {
                if (!playerStats[player]) {
                    playerStats[player] = { totalKills: 0, totalDeaths: 0 };
                }
                playerStats[player].totalKills += Math.max(game.kills[player] || 0, 0); // Considera kills negativas como zero
                playerStats[player].totalDeaths += game.deaths[player] || 0;
            });
        });
    
        // Calculando a eficiência para cada jogador
        Object.keys(playerStats).forEach(player => {
            const { totalKills, totalDeaths } = playerStats[player];
            if (totalDeaths > 0) {
                playerEfficiency[player] = parseFloat((totalKills / totalDeaths).toFixed(2)); // Resultado como número
            } else {
                playerEfficiency[player] = totalKills > 0 ? parseFloat(totalKills.toFixed(2)) : 0; // Se não houver mortes, retorna kills como número ou 0
            }
        });
        
        const sortedPlayers = sortObjectByValue(playerEfficiency);
    
        return sortedPlayers;
    }

    rankPlayersByDeaths(games: IGameReport): IRanking<number> {
        const deathStats: IRanking<number> = {};
      
        // Aggregate deaths for each player across all games
        Object.values(games).forEach(game => {
          game.players.forEach(player => {
            if (!deathStats[player]) {
              deathStats[player] = 0; // Initialize if not already present
            }
            const deaths = game.deaths[player] ?? 0;
            deathStats[player] += deaths; // Sum up deaths
          });
        });
      
        // Sort the entries by deaths in ascending order and rebuild the object
        const sortedPlayers = Object.entries(deathStats)
          .sort((a, b) => a[1] - b[1])
          .reduce<{ [player: string]: number }>((obj, [player, deaths]) => {
            obj[player] = deaths;
            return obj;
          }, {});
      
        return sortedPlayers;
    }

    async playerRanking<T>(): Promise<IPlayerRanking> {

        const logReport: IGameReport = isEmptyObject(this.reportArray) ? await this.logReport() : this.reportArray;
        
        return new Promise<IPlayerRanking>((resolve, reject) => {

            const ranking: IPlayerRanking = { playerRanking: { "kills": {}, "deaths": {}, "kd_ratio": {}, "player_score": {} } };
            let playerRankingKills = ranking['playerRanking']['kills'];

            for (const i in logReport) {

                const game = logReport[i]
                const kills = game.kills;

                for (const player in kills) {

                    if (!(player in playerRankingKills) ) {
                        playerRankingKills[player] = 0;    
                    }
                    playerRankingKills[player] += kills[player];
                }
            }

            ranking['playerRanking']['kills'] = sortObjectByValue(playerRankingKills);              
            ranking['playerRanking']['deaths'] = this.rankPlayersByDeaths(logReport);
            ranking['playerRanking']['kd_ratio'] = this.calculateStandardEfficiency(logReport);
            ranking['playerRanking']['player_score'] = this.calculatePlayerScoreAll(ranking);

            resolve(ranking);
        });
    }

    calculateEfficiency(game: IGameMatch): Record<string, number> {
        game.kd_ratio = {}; // Inicializa a nova propriedade no objeto do jogo
        game.players.forEach(player => {
            const kills = Math.max(game.kills[player], 0); // Ajusta kills negativas para zero
            const deaths = game.deaths[player];
    
            if (deaths > 0) {
                game.kd_ratio[player] = parseFloat((kills / deaths).toFixed(2)); // Resultado com duas casas decimais
            } else {
                // Se não houver mortes, ainda usamos kills como referência para desempenho
                game.kd_ratio[player] = parseFloat(kills.toFixed(2)); // Direto como número de kills, mesmo que zero
            }
        });
        const sortedValues = sortObjectByKey(game.kd_ratio);
        return sortedValues;
    }

    async logReport(): Promise<IGameReport> {
        const url = 'https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log'
        const responseLogs = await axios.get(url, { responseType: 'stream' })

        return new Promise<IGameReport>((resolve, reject) => {

            // Cria uma stream de escrita para o arquivo local
            const writerStream = fs.createWriteStream('qgames.log', { encoding: 'utf8' });

            // Pipa os dados da resposta para o arquivo local
            responseLogs.data.pipe(writerStream);

            // Manipula eventos
            writerStream.on('finish', () => {

                console.log('Arquivo baixado com sucesso.');
                const file = 'qgames.log'

                // Cria uma interface de leitura de linha
                const leitor = readline.createInterface({
                    input: fs.createReadStream(file, { encoding: 'utf8' }),
                    //output: process.stdout
                });
                
                /**
                 * InitGame: loop para nome do game (prop 1)
                 * Kill: loop com sum para pegar as mortes (prop 2)
                 * ClientUserinfoChanged: loop para pegar nomes dos participantes dentro do game (prop 3)
                 * Kill: loop para pegar total de personagens que determinado personagem matou (prop 4)
                 */

                // Manipula o evento 'line', que é acionado quando uma nova linha é lida
                let lineNumber = 0; // Initialize line number counter

                const matchHistoryArray: any[][] = [];
                let eachMatchArray: any = [];
                
                leitor.on('line', (log) => {

                    if (log.includes('ShutdownGame')) {
                        matchHistoryArray.push(eachMatchArray)
                        eachMatchArray = [];
                    } 
                    else if (!log.includes('InitGame')) {

                        eachMatchArray.push(log);      
                    }                        
                    lineNumber++;
                });
                
                // Event 'close', act when a read file has done
                leitor.on('close', () => {
                    console.log('Leitura do arquivo concluída.');

                    for (let i = 0; i < matchHistoryArray.length; i++) {
                        
                        /**
                            Additional notes:

                            When <world> kill a player, that player loses -1 kill score.
                            Since <world> is not a player, it should not appear in the list of players or in the dictionary of kills.
                            The counter total_kills includes player and world deaths.
                         */

                        const sessionLogsArray = matchHistoryArray[i];
                        let players: string[] = [];
                        let kills: Record<string, number> = {};
                        let deaths: Record<string, number> = {};
                        let total_kills: number = 0;
                        let kd_ratio: Record<string, number> = {};
                        let player_score: Record<string, number> = {};

                        
                        for (let i = 0; i < sessionLogsArray.length; i++) {
                            const log = sessionLogsArray[i].trimStart(); 

                            // SET PLAYER NAME
                            if (log.includes('ClientUserinfoChanged')) {                            
                                
                                // Regular expression to extract player name
                                const regex = /n\\([^\\]+)/; 
                                const match = log.match(regex);

                                // check match and get player name
                                const playerName = match ? match[1] : null; 

                                // add player name in array                                
                                players.push(playerName)
                            }

                            // SET TOTAL KILLS && KILLERS && DEADS
                            if (log.includes('Kill')) {

                                // Regular expression to extract the player name who has killed another player
                                const killerMatch = log.match(/Kill: (\d+) (\d+) \d+: (.+?) killed/);
                                const killerName = killerMatch ? killerMatch[3] : null;

                                // Regular expression to extract the player name who has died
                                const deadMatch = log.match(/killed\s+(.*?)\s+by/);
                                const deadName = deadMatch ? deadMatch[1] : null;

                                
                                if (killerName === '<world>') {
                                    
                                    // When <world> kill a player, that player loses -1 kill score.
                                    if (typeof kills[`${deadName}`] === 'undefined') {
                                        kills[`${deadName}`] = -1;
                                    } else {
                                        kills[`${deadName}`]--;
                                    }

                                } else {
                                    if (typeof kills[`${killerName}`] === 'undefined') {
                                        kills[`${killerName}`] = 1;
                                    } else {
                                        kills[`${killerName}`]++;
                                    }                                    
                                }    
                                
                                if (typeof deaths[`${deadName}`] === 'undefined') {
                                    deaths[`${deadName}`] = 1;
                                } else {
                                    deaths[`${deadName}`]++;
                                }
                                
                                total_kills++;
                            }
                        }

                        // remove duplicates values of players name
                        players = [...new Set(players)];

                        // Preencher o array de kills com jogadores ausentes e valor 0
                        players.forEach(player => {
                            if (!(player in kills)) {
                                kills[player] = 0;
                            }
                            if (!(player in deaths)) {
                                deaths[player] = 0;
                            }
                        });



                        kills  = sortObjectByKey(kills);
                        deaths = sortObjectByKey(deaths);

                        // mount report array group
                        this.reportArray[`game_${i+1}`] = { total_kills, players, kills, deaths, kd_ratio, player_score };

                        // 
                        kd_ratio = this.calculateEfficiency(this.reportArray[`game_${i+1}`]);

                        this.reportArray[`game_${i+1}`].kd_ratio = kd_ratio;



                        // calc score
                        for (const player in kd_ratio) {
                            const kd_ratioByPlayer = kd_ratio[player];
                            const total_killsByPlayers = kills[player] >= 0 ? kills[player] : 0;

                            player_score[player] = this.calculatePlayerScore({ kdRatio: kd_ratioByPlayer, totalKills: total_killsByPlayers });
                        }
                        player_score = sortObjectByKey(player_score);
                        
                        this.reportArray[`game_${i+1}`].player_score = player_score;
                    }

                    resolve(this.reportArray);
                });

                leitor.on('error', (err) => {
                    // Lida com erros durante a leitura do arquivo
                    console.error('Erro ao ler o arquivo:', err);
                    reject(err);
                });            
            });
    
            writerStream.on('error', (err) => {
                // Lida com erros durante a leitura do arquivo
                console.error('Erro ao escrever o arquivo:', err);
                reject(err);
            });
        });
    }
}