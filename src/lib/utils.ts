export const convertSecondsToMinute = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const extraSeconds = Math.floor(seconds % 60);
	const minutesText = minutes < 10 ? '0' + minutes : minutes.toString();
	const extraSecondsText = extraSeconds < 10 ? '0' + extraSeconds : extraSeconds;
	return `${minutesText}:${extraSecondsText}`;
};
