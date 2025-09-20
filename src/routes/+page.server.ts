import { GAME_WINNING_SCORE, MINIMUM_WORD_COUNT, ORIGIN_DATE } from '$lib/constants';
import letterPairDataJson from '$lib/server/data/letterPairData.json';

type LetterPairData = {
	pair: { firstLetter: string; lastLetter: string };
	count: number;
	words: string[];
};

export const prerender = true;

const letterPairData = letterPairDataJson as LetterPairData[];

const availableLetterPairData = letterPairData.filter((lpd) => lpd.count >= MINIMUM_WORD_COUNT);

const generateLetterPairSequence = (
	date: Date,
	sequenceLength: number,
	letterPairData: LetterPairData[]
) => {
	const dayOfMonth = date.getDate();
	const dayOfWeek = date.getDay() + 1;

	let timeDiff = date.getTime() - ORIGIN_DATE.getTime();

	let dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

	let letterPairSequence = [];

	let ctr = 0;
	while (ctr < sequenceLength) {
		const base = dayDiff;
		const skip = dayOfMonth;
		const multi = dayOfWeek;
		const idx = (base + ctr * skip * multi) % letterPairData.length;
		letterPairSequence.push({
			first: letterPairData[idx].pair.firstLetter,
			last: letterPairData[idx].pair.lastLetter
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
			(lp) => lp.pair.firstLetter == lps.first && lp.pair.lastLetter == lps.last
		);
		if (foundLPD) sequenceLetterPairData.push(foundLPD);
	}
	return sequenceLetterPairData;
};

let today = new Date();
let tomorrow = new Date(today);
tomorrow.setDate(today.getDate());
tomorrow.setHours(0);
tomorrow.setMinutes(0);
tomorrow.setSeconds(0);
tomorrow.setMilliseconds(0);

const todayLetterPairSequence = generateLetterPairSequence(
	tomorrow,
	GAME_WINNING_SCORE + 1,
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
