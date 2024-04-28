import fs from 'fs'
import readline from 'readline'
import axios from 'axios'

export class QuakeLogModel {

    //private games: IGames | null = null;

    // example
    // private game_1 = {
    //     "total_kills": 45,
    //     "players": ["Dono da bola", "Isgalamido", "Zeh"],
    //     "kills": {
    //       "Dono da bola": 5,
    //       "Isgalamido": 18,
    //       "Zeh": 20
    //       }
    // }

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
            //let matchGameNumber = 1;
            //var fistLine: string | null | string[] = null;


            const arrReport: any[][] = [];
            let arrMatchGame: any = [];
            
            leitor.on('line', (row) => {

                //if (lineNumber === 1) { 

                    const arrRow = row.split(' ').filter(Boolean); // split without empty or undefined elements
                    const eventTimestamp = arrRow[0]
                    const eventName = arrRow[1]

                    if (eventName === 'ShutdownGame:') {
                        arrReport.push(arrMatchGame)
                        arrMatchGame = [];
                        //console.log('finish game '+matchGameNumber)
                        //matchGameNumber++;
                    } 
                    else if (eventName !== 'InitGame:') {

                        arrMatchGame.push(row);
                    }    
                    
                    //fistLine = arrRow; 
                //}

                //console.log(lineNumber)
                //console.log('Linha lida:', line);

                lineNumber++;
            });
            
            // Manipula o evento 'close', que é acionado quando a leitura do arquivo é concluída
            leitor.on('close', () => {
                console.log('Leitura do arquivo concluída.');
                console.log(arrReport)

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