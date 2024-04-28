interface IGames {
    matchs_game: Record<string, IGameRecord> | null,
}

interface IGameRecord {
    total_kills: number,
    players: Array<string>,
    kills: Record<string, number>
}