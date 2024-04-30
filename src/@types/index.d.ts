
type TypePercentage = `${number}%`;

interface IRanking {
    // [player: string]: number | TypePercentage
    [player: string]: number
}
interface IPlayerRanking {
    playerRanking: Record<string, IRanking>
}
interface IGameMatch {
    total_kills: number,
    players: Array<string>,
    kills: Record<string, number>,
    deaths: Record<string, number>
}

// IGameReport
export interface IGameReport<T = IGameMatch> { 
    [key: string]: T
}

// IGameRanking
export interface IGameRanking {
    playerRanking: Record<string, IGameRankingKills>
}