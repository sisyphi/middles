export function downloadTxt(txt: string, name: string) {
	const blob = new Blob([txt], { type: 'text/plain' })

	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = name + '.txt'
	a.click()

	URL.revokeObjectURL(url)
}

export function convertMapToJsonStr(map: Map<string, Set<string>>) {
	const mapAsArray: [string, string[]][] = Array.from(
		map.entries(),
		([key, set]) => [key, Array.from(set)]
	)

	const jsonStr = JSON.stringify(mapAsArray)

	return jsonStr
}

export function convertJsonStrToMap(jsonStr: string): Map<string, Set<string>> {
	let arr: [string, string[]][] = JSON.parse(jsonStr)

	const map = new Map<string, Set<string>>()

	arr.forEach(([key, values]) => {
		map.set(key, new Set(values))
	})

	return map
}
