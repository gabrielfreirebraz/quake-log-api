import fs from 'fs'
import readline from 'readline'
import axios from 'axios'
import { IGameMatches } from '../@types'



export class QuakeLogModel {

    public reportArray: IGameMatches = {}


    async parseFile(): Promise<IGameMatches> {
        const url = 'https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log'
        const responseLogs = await axios.get(url, { responseType: 'stream' })

        return new Promise<IGameMatches>((resolve, reject) => {

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
                
                leitor.on('line', (row) => {

                    const arrRow = row.split(' ').filter(Boolean); // split without empty or undefined elements
                    const eventTimestamp = arrRow[0]
                    const eventName = arrRow[1]

                    if (eventName === 'ShutdownGame:') {
                        matchHistoryArray.push(eachMatchArray)
                        eachMatchArray = [];
                    } 
                    else if (eventName !== 'InitGame:') {

                        eachMatchArray.push(row);      
                    }                        
                    lineNumber++;
                });
                
                // Manipula o evento 'close', que é acionado quando a leitura do arquivo é concluída
                leitor.on('close', () => {
                    console.log('Leitura do arquivo concluída.');

                    for (let i = 0; i < matchHistoryArray.length; i++) {
                        
                        // let gameReportArray: IGameMatches = {
                        //                 "game1": {
                        //                     "total_kills": 45,
                        //                     "players": ["Dono da bola", "Isgalamido", "Zeh"],
                        //                     "kills": {
                        //                         "Dono da bola": 5,
                        //                         "Isgalamido": 18,
                        //                         "Zeh": 20
                        //                     }
                        //                 },
                        //                 "game2": {
                        //                     "total_kills": 45,
                        //                     "players": ["Dono da bola", "Isgalamido", "Zeh"],
                        //                     "kills": {
                        //                         "Dono da bola": 5,
                        //                         "Isgalamido": 18,
                        //                         "Zeh": 20
                        //                     }
                        //                 }
                        // };
                        const sessionLogsArray = matchHistoryArray[i];
                        let players: string[] = [];
                        let kills: Record<string, number> = {};
                        let total_kills: number = 0;

                        
                        for (let i = 0; i < sessionLogsArray.length; i++) {
                            const log = sessionLogsArray[i].trimStart(); 
                            const arr_row = log.split(' ') // PAY ATTENTION: only keys 0,1,2 works without troubles
                            const eventName = arr_row[1].substring(0, arr_row[1].length - 1)

                            // SET PLAYER NAME
                            if (eventName === 'ClientUserinfoChanged') {                            
                                
                                // Regular expression to extract player name
                                const regex = /n\\([^\\]+)/; 
                                const match = log.match(regex);

                                // check match and get player name
                                const playerName = match ? match[1] : null; 

                                // add player name in array
                                players.push(playerName)
                            }

                            // SET TOTAL KILLS && KILLERS
                            if (eventName === 'Kill') {

                                // Regular expression to extract player name that is killer
                                const regex = /Kill: (\d+) (\d+) \d+: (.+?) killed/;
                                const match = log.match(regex);

                                // Verificar se houve uma correspondência e pegar o nome do jogador que matou
                                const killerName = match ? match[3] : null;

                                if (killerName !== '<world>') {
                                    
                                    if (typeof kills[`${killerName}`] === 'undefined') {
                                        kills[`${killerName}`] = 1;
                                    } else {
                                        kills[`${killerName}`]++;
                                    }
                                } else {

                                    // Usar expressão regular para extrair o nome do jogador que morreu
                                    const regex = /killed\s+(.*?)\s+by/;
                                    const match = log.match(regex);

                                    // Verificar se houve uma correspondência e pegar o nome do jogador que morreu
                                    const deadName = match ? match[1] : null;
                                    
                                    if (typeof kills[`${deadName}`] === 'undefined') {
                                        kills[`${deadName}`] = -1;
                                    } else {
                                        kills[`${deadName}`]--;
                                    }
                                }
                                total_kills++;
                            }
                        }

                        // remove duplicates values of players name
                        players = [...new Set(players)];

                        // mount report array group
                        this.reportArray[`game_${i+1}`] = { total_kills, players, kills };
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