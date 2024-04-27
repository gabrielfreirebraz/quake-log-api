import fs from 'fs'
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

            // Crie uma stream de leitura do arquivo de log
            const readerStream = fs.createReadStream('qgames.log', { encoding: 'utf8' });

            // Manipule eventos da stream
            readerStream.on('data', (chunk: any) => {
                // Trata cada pedaço (chunk) de dados conforme eles são lidos
                console.log(chunk);
                console.log('leu tudo')
            });
        });
  
        writerStream.on('error', (err) => {
            // Lida com erros durante a leitura do arquivo
            console.error('Erro ao escrever o arquivo:', err);
        });

        writerStream.on('end', () => {
            // Finaliza a leitura do arquivo
            console.log('Leitura do arquivo concluída.');
        });
    }
}