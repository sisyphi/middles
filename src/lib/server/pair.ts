import pairMapTxt from '$lib/server/data/pairMap.txt?raw'
import dailySeqTxt from '$lib/server/data/dailySeq.txt?raw'
import validPairsTxt from '$lib/server/data/validPairs.txt?raw'
import { getDaysSinceOrigin, PLUS_ONE_EPOCH_DATE } from '$lib/utils/datetime'
import { convertJsonStrToMap } from '$lib/utils/file'

export const MINIMUM_WORD_COUNT = 400

export type LetterPair = {
	pair: { firstLetter: string; lastLetter: string }
	words: string[]
}

export function getValidationMapTxt() {
	return pairMapTxt
}

export function getDailyPairData(timeZone: string = 'Etc/UTC') {
	const dailySeq = dailySeqTxt.split('\n')
	const validPairs = validPairsTxt.split('\n')

	const dailyIdx =
		getDaysSinceOrigin(PLUS_ONE_EPOCH_DATE, timeZone) % dailySeq.length

	const idxs = dailySeq[dailyIdx].split(',').map(idx => Number(idx))
	const dailyPairs = idxs.map(idx => validPairs[idx])

	console.log(
		`getDailyPairData dailyIdx=${dailyIdx} dailyPairs=[${dailyPairs}]`
	)

	return dailyPairs
}

export function getValidPairs() {
	return validPairsTxt.split('\n')
}
