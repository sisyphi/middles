export function useMediaQuery(query: string) {
	let matches = false

	if (typeof window !== 'undefined') {
		const mediaQuery = window.matchMedia(query)
		matches = mediaQuery.matches

		const listener = (e: MediaQueryListEvent) => {
			matches = e.matches
		}

		mediaQuery.addEventListener('change', listener)

		return {
			get value() {
				return matches
			},
			destroy: () => mediaQuery.removeEventListener('change', listener),
		}
	}

	return { value: matches, destroy: () => {} }
}
