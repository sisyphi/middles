import letterPairDataJson from '$lib/server/data/letterPairData.json';

type LetterPairData = { firstLetter: string; lastLetter: string; count: number; words: string[] };

const letterPairData = letterPairDataJson as LetterPairData[];

const MINIMUM_WORD_COUNT = 100;
const availableLetterPairData = letterPairData.filter((lpd) => lpd.count >= MINIMUM_WORD_COUNT);

const generateLetterPairSequence = (
	date: Date,
	sequenceLength: number,
	letterPairData: LetterPairData[]
) => {
	// const year = date.getFullYear();
	// const month = date.getMonth();
	const dayOfMonth = date.getDate();
	const dayOfWeek = date.getDay();

	const origin = new Date('02/20/2025');
	origin.setHours(0);
	origin.setMinutes(0);
	origin.setSeconds(0);
	origin.setMilliseconds(0);

	let timeDiff = date.getTime() - origin.getTime();

	let dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

	let letterPairSequence = [];

	let ctr = 0;
	while (ctr < sequenceLength) {
		const base = dayDiff;
		const skip = dayOfMonth;
		const multi = dayOfWeek;
		const idx = (base + ctr * skip * multi) % letterPairData.length;
		letterPairSequence.push({
			first: letterPairData[idx].firstLetter,
			last: letterPairData[idx].lastLetter
		});
		ctr++;
	}
	return letterPairSequence;
};

const getLetterPairDataFromSequence = (
	letterPairSequence: { first: string; last: string }[],
	letterPairData: LetterPairData[]
) => {
	let sequenceLetterPairData: LetterPairData[] = [];
	for (let lps of letterPairSequence) {
		const foundLPD = letterPairData.find(
			(lp) => lp.firstLetter == lps.first && lp.lastLetter == lps.last
		);
		if (foundLPD) sequenceLetterPairData.push(foundLPD);
	}
	return sequenceLetterPairData;
};

const today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);

const LETTER_PAIR_SEQUENCE_LEN = 5;
const todayLetterPairSequence = generateLetterPairSequence(
	today,
	LETTER_PAIR_SEQUENCE_LEN,
	availableLetterPairData
);

const todayLetterPairData: LetterPairData[] = getLetterPairDataFromSequence(
	todayLetterPairSequence,
	availableLetterPairData
);

export const load = ({}) => {
	return {
		todayLetterPairData,
		letterPairData
	};
};
