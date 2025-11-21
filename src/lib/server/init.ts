import lettersTxt from '$lib/server/data/letters.txt?raw'
import pairsTxt from '$lib/server/data/pairs.txt?raw'
import masterWordsTxt from '$lib/server/data/masterWords.txt?raw'
import pairMapTxt from '$lib/server/data/pairMap.txt?raw'
import validPairsTxt from '$lib/server/data/validPairs.txt?raw'
import { convertJsonStrToMap } from '$lib/utils/file'
import { GAME_WINNING_SCORE, MAX_REROLL_COUNT } from '$lib/utils/game'

export const MINIMUM_WORD_COUNT = 500

export function createPairs() {
	const letters = lettersTxt.split('\n').map(l => l.trim())
	let pairs: string[] = []

	letters.forEach(l1 => {
		letters.forEach(l2 => {
			if (l1.trim().length !== 1 || l2.trim().length !== 1) return
			pairs.push(`${l1}${l2}`)
		})
	})

	return pairs.join('\n')
}

export function createPairMap() {
	const pairs = pairsTxt.split('\n').map(p => p.trim())
	const masterWords = masterWordsTxt.split('\n').map(w => w.trim())

	const wordBuckets: Map<string, string[]> = new Map()

	for (const w of masterWords) {
		if (w.length < 2) continue

		const key = w[0] + w[w.length - 1]

		const entry = wordBuckets.get(key)
		if (entry === undefined) wordBuckets.set(key, [w])
		else entry.push(w)
	}

	const validationMap = new Map<string, Set<string>>()

	for (const p of pairs) {
		const key = p[0] + p[1]
		const matchingWords = wordBuckets.get(key) || []
		if (matchingWords.length > 0) {
			validationMap.set(p, new Set(matchingWords))
		}
	}

	for (const [key, value] of validationMap) {
		if (value.size < MINIMUM_WORD_COUNT) validationMap.delete(key)
	}

	return validationMap
}

export function createValidPairs() {
	const pairMap = convertJsonStrToMap(pairMapTxt)

	return Array.from(pairMap.keys()).join('\n')
}

export function createDailySequence() {
	const validPairs = validPairsTxt.split('\n')

	const pairLen = validPairs.length
	const numRows = 1000
	const seqLen = GAME_WINNING_SCORE + MAX_REROLL_COUNT

	let seq = []

	for (let ctr = 0; ctr < numRows; ctr++) {
		const numbers = Array.from({ length: seqLen }, () =>
			Math.floor(Math.random() * pairLen)
		)
		seq.push(numbers.join(','))
	}

	return seq.join('\n')
}
