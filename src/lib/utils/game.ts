import { format } from 'date-fns-tz'
import { convertSecondsToMinute } from './helper'

export const MAX_SECONDS = 90
export const MAX_REROLL_COUNT = 1
export const WORD_MILESTONES = [20, 30, 40, 50]
export const TIME_MILESTONES = [0, 30, 45, 60]
export const MILESTONE_TITLES = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLAT']
export const GAME_WINNING_SCORE = 5

export type Answer = {
	word: string
	timestamp: number
}

export type GameStats = {
	answers: Answer[]
	secondsLeft: number
	rerollCount: number
	pairIdx: number
}

export type LetterPair = {
	pair: string
	count: number
	words: string[]
}

export const EMPTY_GAME_STATS = {
	answers: [],
	secondsLeft: MAX_SECONDS,
	rerollCount: MAX_REROLL_COUNT,
	pairIdx: 0,
}

export function createRandomSequence(max: number, seqLen: number): number[] {
	const numbers = Array.from({ length: seqLen }, () =>
		Math.floor(Math.random() * max)
	)

	return numbers
}

export function createRandomPairs(pairs: string[]): string[] {
	return createRandomSequence(
		pairs.length,
		GAME_WINNING_SCORE + MAX_REROLL_COUNT
	).map(idx => pairs[idx])
}

export function resetGameStats(gameStats: GameStats) {
	gameStats.answers = []
	gameStats.secondsLeft = MAX_SECONDS
	gameStats.rerollCount = MAX_REROLL_COUNT
	gameStats.pairIdx = 0
}

export function getTotalLetterCount(words: string[]): number {
	return words.map(a => a.length).reduce((acc, curr) => acc + curr, 0)
}

export function getScoreIdx(milestones: number[], value: number): number {
	let idx = 0
	while (idx < milestones.length) {
		if (value < milestones[idx]) return idx
		idx++
	}
	return idx
}

export function createShareText(
	wordScoreIdx: number,
	timeScoreIdx: number,
	answers: { word: string; timestamp: number }[],
	secondsLeft: number
): string {
	const createScoreEmojis = () => {
		if (wordScoreIdx === 4 && timeScoreIdx === 4) {
			return '🟪🟪🟪🟪🟪🟪'
		}

		const wordScoreEmojis = '🟥'.repeat(Math.min(wordScoreIdx, 3))
		const timeScoreEmojis = '🟦'.repeat(Math.min(timeScoreIdx, 3))
		const noneScoreEmojis = '⬜'.repeat(
			6 - (Math.min(wordScoreIdx, 3) + Math.min(timeScoreIdx, 3))
		)

		return `${wordScoreEmojis}${timeScoreEmojis}${noneScoreEmojis}`
	}

	const dateToday = format(new Date(), 'MMM d, yyyy')
	const finishTime = convertSecondsToMinute(MAX_SECONDS - secondsLeft)
	const wordTotal = answers
		.map(a => a.word.length)
		.reduce((acc, curr) => acc + curr, 0)

	return `Middles | ${dateToday}\n${createScoreEmojis()}\nI finished in ${finishTime} with ${wordTotal} letters`
}
