export const convertSecondsToMinute = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60)
	const extraSeconds = Math.floor(seconds % 60)
	const minutesText = minutes < 10 ? '0' + minutes : minutes.toString()
	const extraSecondsText = extraSeconds < 10 ? '0' + extraSeconds : extraSeconds
	return `${minutesText}:${extraSecondsText}`
}

export const isDailyFinished = (todayFinished: string): boolean => {
	return (
		todayFinished === new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
	)
}
