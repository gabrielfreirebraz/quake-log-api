interface IGames {
    game: Record<string, IGameRecord>,
}

interface IGameRecord {
    total_kills: number,
    players: Array<string>,
    kills: Record<string, number>
}