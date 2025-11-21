import { getUserTimezone } from '$lib/utils/datetime'
import type { Cookies } from '@sveltejs/kit'

export function setTimeZoneCookie(cookies: Cookies): string {
	const timeZone = getUserTimezone()

	cookies.set('timeZone', timeZone, {
		path: '/',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365,
	})

	return timeZone
}
