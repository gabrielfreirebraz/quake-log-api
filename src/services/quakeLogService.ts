import axios, { AxiosResponse } from "axios";
import { Stream } from 'stream';
import fs from 'fs'
import readline from 'readline'
import { IGameReport } from "../@types";
import { writeStreamLogFile, readerStreamLogFile } from "../models/quakeLogModel";


//-------------------------------- To download and read file
const loadExternalFile = async (endpointFile: string): Promise<AxiosResponse<Stream>> => {
    return await axios.get<Stream>(endpointFile, { responseType: 'stream' })
}

const onEventsStreamToCreateReport = (stream: fs.WriteStream): Promise<IGameReport> => {
    return new Promise<IGameReport>((resolve, reject) => {

        stream.on('finish', () => {
            console.log('Downloaded file.');

            const modelReaderStream: readline.Interface = readerStreamLogFile('../logs/qgames.log');

            buildLogLinesByMatchGroup(modelReaderStream);

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
    const modelWriterStream: fs.WriteStream = writeStreamLogFile('../logs/qgames.log');

    responseLogs.data.pipe(modelWriterStream);

    return modelWriterStream;
}

const processDataFromFile = async () => {
    const writerStream: fs.WriteStream = await downloadFile();

    return await onEventsStreamToCreateReport(writerStream);
}


//-------------------------------- Iterator lines in log file
const buildLogLinesByMatchGroup = (readerStream: readline.Interface): string[][] => {
    let lineNumber = 0;

    const matchHistoryArray: string[][] = [];
    let eachMatchArray: string[] = [];

    readerStream.on('line', (log: string) => {

        if (log.includes('ShutdownGame')) {
            matchHistoryArray.push(eachMatchArray)
            eachMatchArray = [];
        } 
        else if (!log.includes('InitGame')) {

            eachMatchArray.push(log);      
        }                        
        lineNumber++;
    });
    return matchHistoryArray;
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


