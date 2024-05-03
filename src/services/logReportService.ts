import axios, { AxiosResponse } from "axios";
import fs from 'fs'
import readline from 'readline'
import { Stream } from 'stream';
import { IGameMatch, IGameReport } from "../@types";
import { writeStreamLogFile, readerStreamLogFile } from "../models/quakeLogModel";
import { sortObjectByKey, sortObjectByValue } from "../utils/object";


const processDataReport = async () => {
    const writerStream: fs.WriteStream = await downloadFile();

    const reportArr = await handleStream_DownloadLog_and_CreateReport(writerStream);

    return reportArr;
}

const loadExternalFile = async (endpointFile: string): Promise<AxiosResponse<Stream>> => {
    return await axios.get<Stream>(endpointFile, { responseType: 'stream' })
}

const downloadFile = async (): Promise<fs.WriteStream> => {
    const responseLogs: AxiosResponse<Stream> = await loadExternalFile('https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log');
    const modelWriterStream: fs.WriteStream = writeStreamLogFile('../logs/qgames.log');

    responseLogs.data.pipe(modelWriterStream);

    return modelWriterStream;
}

const handleStream_DownloadLog_and_CreateReport = async (stream: fs.WriteStream): Promise<IGameReport> => {
    return new Promise<IGameReport>((resolve, reject) => {

        stream.on('finish', () => {
            console.log('Downloaded file.');

            const modelReaderStream: readline.Interface = readerStreamLogFile('../logs/qgames.log');

            handleStream_CreateReport(
                modelReaderStream,
                (result: any) => resolve(result),
                (error: any) => reject(error)
            );
            // const reportArr = handleStreamToCreateReport();
            // resolve(reportArr);
        });
        stream.on('error', (err) => {
            console.error('Error to write in file:', err);
            reject(err);
        });
    });
}

const handleStream_CreateReport = (readerStream: readline.Interface, successCallback: any, errorCallback: any) => {

    let lineNumber = 0;

    const logsGroupByMatchArr: string[][] = [];
    let eachMatchGroupArr: string[] = [];

    // ---------
    readerStream.on('line', (log: string) => {

        if (log.includes('ShutdownGame')) {
            logsGroupByMatchArr.push(eachMatchGroupArr)
            eachMatchGroupArr = [];
        } 
        else if (!log.includes('InitGame')) {

            eachMatchGroupArr.push(log);      
        }                        
        lineNumber++;
    });

    // ---------
    readerStream.on('close', () => {
        console.log('Read file ohas done.');

        let reportArr: IGameReport = {}

        for (let i = 0; i < logsGroupByMatchArr.length; i++) {
            
            /**
                Additional notes:

                When <world> kill a player, that player loses -1 kill score.
                Since <world> is not a player, it should not appear in the list of players or in the dictionary of kills.
                The counter total_kills includes player and world deaths.
            */

            const sessionLogsArray = logsGroupByMatchArr[i];
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
                    const playerName = match ? match[1] : "undefinedPlayer"; 

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

            kills  = sortObjectByValue(kills);
            deaths = sortObjectByValue(deaths, true);

            // mount report array group
            reportArr[`game_${i+1}`] = { total_kills, players, kills, deaths, kd_ratio, player_score };

            // 
            kd_ratio = calculateEfficiencyKDRatio(reportArr[`game_${i+1}`]);

            reportArr[`game_${i+1}`].kd_ratio = kd_ratio;



            // calc score
            for (const player in kd_ratio) {
                const kd_ratioByPlayer = kd_ratio[player];
                const total_killsByPlayers = kills[player] >= 0 ? kills[player] : 0;

                player_score[player] = calculatePlayerScore({ kdRatio: kd_ratioByPlayer, totalKills: total_killsByPlayers });
            }
            player_score = sortObjectByValue(player_score);
            
            reportArr[`game_${i+1}`].player_score = player_score;
        }

        successCallback(reportArr);
    });

    // ---------
    readerStream.on('error', (err) => {
        console.error('Read file error:', err);
        errorCallback(err);
    });  
}

const calculatePlayerScore = (playerStats: { kdRatio: number; totalKills: number; }, weightFactor: number = 10): number => {
    return parseFloat(((playerStats.kdRatio * weightFactor) + playerStats.totalKills).toFixed(2));
}

const calculateEfficiencyKDRatio = (game: IGameMatch): Record<string, number> => {
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
    const sortedValues = sortObjectByValue(game.kd_ratio);
    return sortedValues;
}

export { processDataReport }


