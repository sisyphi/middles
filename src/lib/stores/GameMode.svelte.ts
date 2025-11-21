export type GameMode = 'daily' | 'random' | 'survival'

export let gameMode = $state<{ value: GameMode }>({ value: 'daily' })
