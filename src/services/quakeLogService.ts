import axios, { AxiosResponse } from "axios";
import { Stream } from 'stream';
import fs from 'fs'
import path from 'path'
import { IGameReport } from "../@types";



const loadExternalFile = async (endpointFile: string): Promise<AxiosResponse<Stream>> => {
    return await axios.get<Stream>(endpointFile, { responseType: 'stream' })
}

const readStreamLocalFile = (filePath: string): fs.WriteStream => {
    const fullPath = path.join(__dirname, filePath);
    return fs.createWriteStream(fullPath, { encoding: 'utf8' });
}

const onEventsStreamToCreateReport = (stream: fs.WriteStream): Promise<IGameReport> => {
    return new Promise<IGameReport>((resolve, reject) => {

        stream.on('finish', () => {

            console.log('Downloaded file.');
            resolve({});
        });
        stream.on('error', (err) => {
            console.error('Error to write in file:', err);
            reject(err);
        });
    });
}

const downloadFile = async (): Promise<fs.WriteStream> => {
    const responseLogs: AxiosResponse<Stream> = await loadExternalFile('https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log');
    const writerStream: fs.WriteStream = readStreamLocalFile('../logs/qgames.log');

    responseLogs.data.pipe(writerStream);

    return writerStream;
}

const processDataFromFile = async () => {

    const writerStream: fs.WriteStream = await downloadFile();

    return await onEventsStreamToCreateReport(writerStream);
}

export { processDataFromFile }



// const processDataFromFile = async (filePath: string) => {
//     const stream = fileModel.readFileStream(filePath);
  
//     stream.on('data', (chunk: string) => {




//       // Processa cada pedaço do arquivo conforme necessário
//       console.log(chunk.toString());  // Exemplo de processamento: apenas imprimir o conteúdo
//     });


//     return new Promise((resolve, reject) => {

//       stream.on('end', () => {
//         resolve('Processamento completo');
//       });
//       stream.on('error', (error: string) => {
//         reject(error);
//       });
//     });
// };


