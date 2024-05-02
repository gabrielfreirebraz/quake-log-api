
// type TypePercentage = `${number}%` | `${string}%`;

interface IRanking<T> {
    [player: string]: T
}
interface IPlayerRanking {
    playerRanking: Record<string, IRanking>
}
interface IGameMatch {
    total_kills: number,
    players: Array<string>,
    kills: Record<string, number>,
    deaths: Record<string, number>,
    kd_ratio: Record<string, number>,
    player_score: Record<string, number>
}
interface IGameReport<T = IGameMatch> { 
    [key: string]: T
}

export { IGameReport, IPlayerRanking, IRanking, IGameMatch }