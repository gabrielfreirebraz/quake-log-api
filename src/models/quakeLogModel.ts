import fs from 'fs'
import path from 'path'
import readline from 'readline'

export const writeStreamLogFile = (filePath: string): fs.WriteStream => {
    const fullPath = path.join(__dirname, filePath);
    return fs.createWriteStream(fullPath, { encoding: 'utf8' });
}

export const readerStreamLogFile = (filePath: string): readline.Interface => {
    const fullPath = path.join(__dirname, filePath);
    return readline.createInterface({
        input: fs.createReadStream(fullPath, { encoding: 'utf8' }),
        //output: process.stdout    
    });
}