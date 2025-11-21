import pairMapTxt from '$lib/server/data/pairMap.txt?raw'
import { convertJsonStrToMap } from '$lib/utils/file'

const pairMap = convertJsonStrToMap(pairMapTxt)

export function getPairMap() {
	return pairMap
}
