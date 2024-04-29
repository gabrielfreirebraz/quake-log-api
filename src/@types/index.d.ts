
interface IGameMatch {
    total_kills: number,
    players: Array<string>,
    kills: Record<string, number>,
    deaths: Record<string, number>
}
// interface IGameMatches<T = Record<string, Array<string> | number | Record<string,number>>, K = Record<string, T>> { 
export interface IGameReport<T = IGameMatch> { 
    [key: string]: T
}