import {
	createDailySequence,
	createPairMap,
	createPairs,
	createValidPairs,
} from '$lib/server/init'
import { getDailyPairData, getValidationMapTxt } from '$lib/server/pair'
import { convertJsonStrToMap } from '$lib/utils/file'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const pairs = createPairs()
	const pairMap = createPairMap()
	const dailySeq = createDailySequence()
	const validPairs = createValidPairs()

	return {
		pairs,
		pairMap,
		dailySeq,
		validPairs,
	}
}
