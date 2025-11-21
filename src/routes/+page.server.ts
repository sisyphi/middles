import {
	getDailyPairData,
	getValidationMapTxt,
	getValidPairs,
} from '$lib/server/pair'
import { convertJsonStrToMap } from '$lib/utils/file'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies }) => {
	const timeZone = cookies.get('timeZone') || 'Etc/UTC'

	const validationMap = convertJsonStrToMap(getValidationMapTxt())
	const dailyPairs = getDailyPairData(timeZone)
	const validPairs = getValidPairs()

	return {
		validationMap,
		dailyPairs,
		validPairs,
	}
}
