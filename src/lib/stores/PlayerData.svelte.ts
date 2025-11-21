import { MAX_REROLL_COUNT, MAX_SECONDS, type Answer } from '$lib/utils/game'

export type PlayerData = {
	todayFinished: string
	todayAnswers: Answer[]
	todayPairIdx: number
	todaySecondsLeft: number
	todayRerollCount: number
	todayWordScore: number
	todayTimeScore: number
	wordHighscore: number
	timeHighscore: number
	showBreakdown: boolean
}

export const EMPTY_PLAYER_DATA: PlayerData = {
	todayFinished: new Date(0).toISOString(),
	todayAnswers: [],
	todayPairIdx: 0,
	todaySecondsLeft: MAX_SECONDS,
	todayRerollCount: MAX_REROLL_COUNT,
	todayWordScore: 0,
	todayTimeScore: 0,
	wordHighscore: 0,
	timeHighscore: 0,
	showBreakdown: false,
}

export let playerData: PlayerData = $state(EMPTY_PLAYER_DATA)

export function getLocalPlayerData(): PlayerData {
	const playerDataJson = localStorage.getItem('middlesPlayerData')

	return playerDataJson ? JSON.parse(playerDataJson) : EMPTY_PLAYER_DATA
}

export function setLocalPlayerData(data: PlayerData) {
	localStorage.setItem('middlesPlayerData', JSON.stringify(data))
}

export function initPlayerData() {
	playerData.todayFinished = getLocalPlayerData().todayFinished
	Object.assign(playerData, getLocalPlayerData())
}

export function dailyResetPlayerData(data: PlayerData) {
	data.todayAnswers = []
	data.todayPairIdx = 0
	data.todaySecondsLeft = MAX_SECONDS
	data.todayRerollCount = MAX_REROLL_COUNT
	data.todayWordScore = 0
	data.todayTimeScore = 0
}
