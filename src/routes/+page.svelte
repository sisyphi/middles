<script lang="ts">
	// import dictTxt from '$lib/data/dictionary.txt?raw';
	// import lettersTxt from '$lib/data/letters.txt?raw';

	// const dict = dictTxt.split('\n');
	// const letters = lettersTxt.split('\n');

	// const letterPairData = [];
	// for (const f of letters) {
	// 	for (const l of letters) {
	// 		const words = dict.filter((w) => w[0] == f && w[w.length - 1] == l);
	// 		letterPairData.push({
	// 			pair: { firstLetter: f, lastLetter: l },
	// 			count: words.length,
	// 			words: words
	// 		});
	// 	}
	// }

	// console.log(JSON.stringify(letterPairData));

	import letterPairData from '$lib/data/letterPairData.json';

	const MINIMUM_WORD_COUNT = 100;
	const availableLetterPairsData = letterPairData.filter((lpd) => lpd.count >= MINIMUM_WORD_COUNT);

	let randIdx = $state(Math.floor(Math.random() * availableLetterPairsData.length));
	let chosenLetterPairData = $derived.by(() => {
		let chosenLetterPairData = availableLetterPairsData[randIdx];
		console.log(chosenLetterPairData.words);
		return chosenLetterPairData;
	});

	let middleLettersInputRef: HTMLInputElement | undefined = $state();
	let middleLetters = $state('');

	const handleReroll = () => {
		middleLetters = '';
		randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
		if (middleLettersInputRef) middleLettersInputRef.focus();
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const guess = (
			chosenLetterPairData.firstLetter +
			middleLetters +
			chosenLetterPairData.lastLetter
		).toUpperCase();

		if (chosenLetterPairData.words.includes(guess)) {
			score += 1;
			handleReroll();
		} else {
			middleLetters = '';
		}
	};

	let seconds = $state(0);
	let isGameWon = $state(false);
	const GAME_WINNING_SCORE = 5;

	setInterval(() => {
		if (!isGameWon) seconds += 0.1;
	}, 100);

	$effect(() => {
		if (score == GAME_WINNING_SCORE) isGameWon = true;
	});

	let score = $state(0);

	const convertSecondsToMinute = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const extraSeconds = Math.floor(seconds % 60);
		const minutesText = minutes < 10 ? '0' + minutes : minutes.toString();
		const extraSecondsText = extraSeconds < 10 ? '0' + extraSeconds : extraSeconds;
		return `${minutesText}:${extraSecondsText}`;
	};

	const handleResetGame = () => {
		isGameWon = false;
	};
</script>

{#if !isGameWon}
	<form onsubmit={handleSubmit} class="mx-auto flex w-4xl flex-col items-center justify-center">
		<div class="flex flex-row justify-center">
			<div>{chosenLetterPairData.firstLetter}</div>
			<input
				bind:this={middleLettersInputRef}
				bind:value={middleLetters}
				type="text"
				class={'text-center uppercase'}
			/>
			<div>{chosenLetterPairData.lastLetter}</div>
		</div>
		<div class="text-center">
			{chosenLetterPairData!.firstLetter +
				middleLetters.toUpperCase() +
				chosenLetterPairData!.lastLetter}
		</div>
		<button type="submit" class="hover:cursor-pointer">submit</button>
		<button type="reset" class="hover:cursor-pointer" onclick={handleReroll}> reroll </button>
		<div class="text-center">{convertSecondsToMinute(seconds)}</div>
		<div class="text-center">{score}</div>
		<!-- <div class="text-center">{chosenLetterPairData.count}</div> -->
		<!-- <div class="w-full text-center text-wrap break-words">{chosenLetterPairData.words}</div> -->
	</form>
{:else}
	<div class="mx-auto flex w-4xl flex-col items-center justify-center">
		<div class="text-center">Yay you won with a time of {convertSecondsToMinute(seconds)}!</div>
		<button type="reset" onclick={handleResetGame} class="hover: cursor-pointer">play again?</button
		>
	</div>
{/if}
