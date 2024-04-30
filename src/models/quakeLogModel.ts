import fs from 'fs'
import readline from 'readline'
import axios from 'axios'
import { IGameMatch, IGameReport, IPlayerRanking } from '../@types'
import { isEmptyObject, sortObjectByKey, sortObjectByValue } from '../utils/object'



export class QuakeLogModel {

    protected reportArray: IGameReport = {}


    async playerRanking<T>(): Promise<IPlayerRanking> {

        const logReport: IGameReport = isEmptyObject(this.reportArray) ? await this.logReport() : this.reportArray;
        
        return new Promise<IPlayerRanking>((resolve, reject) => {

            const ranking: IPlayerRanking = { playerRanking: { "kills": {} } };
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
              
            resolve(ranking);
        });
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
                        this.reportArray[`game_${i+1}`] = { total_kills, players, kills, deaths };
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