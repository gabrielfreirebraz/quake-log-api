import fs from 'fs'
import readline from 'readline'
import axios from 'axios'

export class QuakeLogModel {

    //private games: IGames | null = null;


    async parseFile() {

        const url = 'https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log'
        const responseLogs = await axios.get(url, { responseType: 'stream' })

        // Cria uma stream de escrita para o arquivo local
        const writerStream = fs.createWriteStream('qgames.log', { encoding: 'utf8' });

        // Pipa os dados da resposta para o arquivo local
        responseLogs.data.pipe(writerStream);

        // Manipula eventos
        writerStream.on('finish', () => {

            console.log('Arquivo baixado com sucesso.');
            // Agora você pode usar fs.createReadStream para ler o arquivo local

            const file = 'qgames.log'

            // Cria uma interface de leitura de linha
            const leitor = readline.createInterface({
                input: fs.createReadStream(file, { encoding: 'utf8' }),
                //output: process.stdout
            });
            
            /**
             * 
             * 
             * InitGame: loop para nome do game (prop 1)
             * Kill: loop com sum para pegar as mortes (prop 2)
             * ClientUserinfoChanged: loop para pegar nomes dos participantes dentro do game (prop 3)
             * Kill: loop para pegar total de personagens que determinado personagem matou (prop 4)
             * 
             * 
             */


            // Manipula o evento 'line', que é acionado quando uma nova linha é lida
            let lineNumber = 0; // Initialize line number counter


            const matchHistoryArray: any[][] = [];
            let eachMatchArray: any = [];
            
            leitor.on('line', (row) => {

                //if (lineNumber === 1) { 

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
                //}
                //console.log('Linha lida:', row);
                lineNumber++;
            });
            
            // Manipula o evento 'close', que é acionado quando a leitura do arquivo é concluída
            leitor.on('close', () => {
                console.log('Leitura do arquivo concluída.');
                //console.log(matchHistoryArray)

                interface IGameMatch {
                    [key: string]: number | Array<string> | Record<string,number>
                }
                // interface IGameMatches<T = Record<string, Array<string> | number | Record<string,number>>, K = Record<string, T>> { 
                interface IGameMatches<T = IGameMatch> { 
                    // gameReportArray: K
                    [key: string]: T
                }

                let gameReportArray: IGameMatches = {};

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
                    let playersNameArray: string[] = [];


                    sessionLogsArray.reduce((prevValue, currValue, currIdx) => {
                        //console.log(currValue)

                        currValue = currValue.trimStart(); 
                        const arr_row = currValue.split(' ') // PAY ATTENTION: only keys 0,1,2 works without troubles
                        const eventName = arr_row[1].substring(0, arr_row[1].length - 1)


                        if (eventName === 'Kill') {

                        }



                        // GET PLAYER NAME
                        if (eventName === 'ClientUserinfoChanged') {
                            const playerID = arr_row[2];
                            
                            // Regular expression to extract player name
                            const regex = /n\\([^\\]+)/; 
                            const match = currValue.match(regex);

                            // check match and get player name
                            const playerName = match ? match[1] : null; 
                            playersNameArray.push(playerName)
                        }

                        return prevValue + 1;
                    },0)

                    // remove duplicates values of players name
                    playersNameArray = [...new Set(playersNameArray)];

                    gameReportArray[`game_${i+1}`] = {
                                        "total_kills": 45,
                                        "players": playersNameArray,
                                        "kills": {
                                            "Dono da bola": 5,
                                            "Isgalamido": 18,
                                            "Zeh": 20
                                        }
                                    };
                }

                console.log(gameReportArray)


                // matchHistoryArray.reduce((previousValue, currentValue, currentIndex) => {

                //     const row = currentValue[0];
                //     console.log(row)
                //     return previousValue + 1;
                // },0);

                        // arrMatchGame.push(
                        //     {
                        //         "total_kills": 45, 
                        //         "players": ["Dono da bola", "Isgalamido", "Zeh"],
                        //         "kills": {
                        //             "Dono da bola": 5,
                        //             "Isgalamido": 18,
                        //             "Zeh": 20
                        //         }
                        //     });
            });

            leitor.on('error', (err) => {
                // Lida com erros durante a leitura do arquivo
                console.error('Erro ao ler o arquivo:', err);
            });
            
        });
  
        writerStream.on('error', (err) => {
            // Lida com erros durante a leitura do arquivo
            console.error('Erro ao escrever o arquivo:', err);
        });


    }
}