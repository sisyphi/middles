<script lang="ts">
	import dictTxt from '$lib/data/dictionary.txt?raw';
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
	import Logo from '$lib/Logo.svg';
	let bgPosition: number = $state(0);
	const xDir = Math.random() > 0.5 ? 1 : -1;
	const yDir = Math.random() > 0.5 ? 1 : -1;

	setInterval(() => {
		bgPosition = Math.round(((bgPosition + 0.05) % 200) * 200) / 200;
	}, 0.1);

	import { onMount } from 'svelte';

	import letterPairData from '$lib/data/letterPairData.json';

	const MINIMUM_WORD_COUNT = 100;
	const availableLetterPairsData = letterPairData.filter((lpd) => lpd.count >= MINIMUM_WORD_COUNT);

	let randIdx = $state(Math.floor(Math.random() * availableLetterPairsData.length));
	let chosenLetterPairData = $derived.by(() => {
		let chosenLetterPairData = availableLetterPairsData[randIdx];
		return chosenLetterPairData;
	});

	let middleLettersInputRef: HTMLInputElement | undefined = $state();
	let middleLetters = $state('');

	const handleReroll = () => {
		middleLetters = '';
		randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
		middleLettersInputRef?.focus();
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

	const handleResetGame = (e: SubmitEvent) => {
		e.preventDefault();
		isGameWon = false;
	};

	onMount(() => {
		middleLettersInputRef?.focus();
	});
</script>

<div
	class="bg-polka flex h-svh flex-col justify-between"
	style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};"
>
	<div class="h-16 w-full border-b-8 border-[#10141f] bg-[#ebede9]"></div>
	{#if !isGameWon}
		<form
			onsubmit={handleSubmit}
			class="mx-auto flex w-md flex-1 flex-col items-center justify-center gap-2 border-r-8 border-l-8 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
		>
			<div class="flex flex-col justify-center">
				<div class="text-center font-sans font-bold">
					{convertSecondsToMinute(seconds)}
				</div>
			</div>
			<div class="flex flex-col justify-center">
				<div class="text-center">{`${score}/${GAME_WINNING_SCORE}`}</div>
			</div>

			<div class="flex flex-row justify-center align-middle font-mono text-4xl">
				<div>{chosenLetterPairData.firstLetter}</div>
				<input
					style={`width: ${Math.max(1, middleLetters.length)}ch;`}
					bind:this={middleLettersInputRef}
					bind:value={middleLetters}
					type="text"
					class="text-center uppercase outline-0"
				/>
				<div>{chosenLetterPairData.lastLetter}</div>
			</div>

			<button type="submit" class="flex flex-col justify-center hover:cursor-pointer">submit</button
			>
			<button
				type="reset"
				class="flex flex-col justify-center hover:cursor-pointer"
				onclick={handleReroll}
			>
				reroll
			</button>
		</form>
	{:else}
		<form
			onsubmit={handleResetGame}
			class="mx-auto flex h-svh flex-col items-center justify-center gap-4 pb-32 text-2xl"
		>
			<div class="text-center">Yay you won with a time of {convertSecondsToMinute(seconds)}!</div>
			<!-- display words & responding score per word -->
			<!-- display computation based on word score and time -->
			<button type="submit" class="hover: cursor-pointer">play again?</button>
		</form>
	{/if}
	<div class="absolute right-10 bottom-10 size-16 bg-[#ea5e82]">
		<img alt="My logo" src={Logo} />
	</div>
</div>

<style>
	.bg-polka {
		opacity: 1;
		background-image:
			radial-gradient(#ebede9 4px, transparent 4px), radial-gradient(#ebede9 4px, #e8c170 4px);
		background-size: 50px 50px;
	}
</style>
