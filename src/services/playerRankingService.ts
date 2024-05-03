import { IGameReport, IPlayerRanking, IRanking } from "../@types";
import { sortObjectByValue } from "../utils/object";
import { processDataReport } from "./logReportService";



const calculatePlayerScore = ({ playerRanking }: IPlayerRanking): IRanking<number> => {
    const scores: { [player: string]: number } = {};

    Object.keys(playerRanking.kills).forEach(player => {
        const totalKills = playerRanking.kills[player];
        const kdRatio = playerRanking.kd_ratio[player];
        const score = calculatePlayerScoreFormula({kdRatio, totalKills});
        scores[player] = score;
    });

    return sortObjectByValue(scores);
}

const calculatePlayerScoreFormula = (playerStats: { kdRatio: number; totalKills: number; }, weightFactor: number = 10): number => {
    return parseFloat(((playerStats.kdRatio * weightFactor) + playerStats.totalKills).toFixed(2));
}
    
const calculateEfficiencyKDRatio = (games: IGameReport): IRanking<number> => {
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

const rankPlayersByDeaths = (games: IGameReport): IRanking<number> => {
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

const rankPlayersByKills = (games: IGameReport): IRanking<number> => {
    const killStats: IRanking<number> = {};

    for (const i in games) {

        const game = games[i]
        const kills = game.kills;

        for (const player in kills) {

            if (!(player in killStats) ) {
                killStats[player] = 0;    
            }
            killStats[player] += kills[player];
        }
    }
    const sortedPlayers = sortObjectByValue(killStats);   

    return sortedPlayers;
}

const processPlayerRanking = async (): Promise<IPlayerRanking> => {

    const logReport: IGameReport = await processDataReport();
    
    return new Promise<IPlayerRanking>((resolve, reject) => {

        const ranking: IPlayerRanking = { playerRanking: { "kills": {}, "deaths": {}, "kd_ratio": {}, "player_score": {} } };

        ranking['playerRanking']['kills'] = rankPlayersByKills(logReport);              
        ranking['playerRanking']['deaths'] = rankPlayersByDeaths(logReport);
        ranking['playerRanking']['kd_ratio'] = calculateEfficiencyKDRatio(logReport);
        ranking['playerRanking']['player_score'] = calculatePlayerScore(ranking);

        resolve(ranking);
    });
}


export { processPlayerRanking }