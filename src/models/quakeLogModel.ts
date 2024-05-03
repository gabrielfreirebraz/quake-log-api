import fs from 'fs'
import path from 'path'
import readline from 'readline'
import axios, { AxiosResponse } from 'axios'
import { IGameMatch, IGameReport, IPlayerRanking, IRanking } from '../@types'
import { isEmptyObject, sortObjectByKey, sortObjectByValue } from '../utils/object'
import { processDataFromFile } from '../services/logReportService'


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








///////////////////// ---------------------------------------------------------------------------------------------------------

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

    calculatePlayerScore(playerStats: { kdRatio: number; totalKills: number; }, weightFactor: number = 10): number {
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

        const logReport: IGameReport = isEmptyObject(this.reportArray) ? await processDataFromFile() : this.reportArray;
        
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
}