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

	import Logo from '$lib/icons/Logo.svg';
	let bgPosition: number = $state(0);
	const xDir = Math.random() > 0.5 ? 1 : -1;
	const yDir = Math.random() > 0.5 ? 1 : -1;

	setInterval(() => {
		bgPosition = Math.round(((bgPosition + 0.05) % 200) * 200) / 200;
	}, 0.1);

	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';
	import Results from '$lib/components/Results.svelte';
	import Game from '$lib/components/Game.svelte';
	import {
		GAME_WINNING_SCORE,
		MAX_SECONDS,
		MINIMUM_WORD_COUNT,
		TIME_MILESTONES,
		WORD_MILESTONES
	} from '$lib/constants';

	import { finishedDaily } from '$lib/stores';

	let { data }: PageProps = $props();

	const availableLetterPairsData = data.letterPairData.filter(
		(lpd) => lpd.count >= MINIMUM_WORD_COUNT
	);

	let gameMode = $state('random');

	let randIdx = $state(Math.floor(Math.random() * availableLetterPairsData.length));
	let dailyIdx = $state(0);
	let chosenLetterPairData = $derived.by(() => {
		switch (gameMode) {
			case 'random':
				return availableLetterPairsData[randIdx];
			case 'daily':
				return data.todayLetterPairData[dailyIdx];
			default:
				return availableLetterPairsData[randIdx];
		}
	});

	let middleLettersInputRef: HTMLInputElement | undefined = $state();
	let middleLetters = $state('');

	const handleReroll = () => {
		switch (gameMode) {
			case 'random':
				middleLetters = '';
				randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
				middleLettersInputRef?.focus();
				rerollCount--;
				break;
			case 'daily':
				middleLetters = '';
				dailyIdx++;
				middleLettersInputRef?.focus();
				rerollCount--;
				break;
		}
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();

		const guess = (
			chosenLetterPairData.firstLetter +
			middleLetters +
			chosenLetterPairData.lastLetter
		).toUpperCase();

		switch (gameMode) {
			case 'random':
				if (chosenLetterPairData.words.includes(guess)) {
					score += 1;
					middleLetters = '';
					randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
					middleLettersInputRef?.focus();

					answers.push({ word: guess, timestamp: MAX_SECONDS - secondsLeft });
				} else {
					middleLetters = '';
				}
				break;
			case 'daily':
				if (chosenLetterPairData.words.includes(guess)) {
					score += 1;
					middleLetters = '';
					dailyIdx++;
					middleLettersInputRef?.focus();

					answers.push({ word: guess, timestamp: MAX_SECONDS - secondsLeft });
				} else {
					middleLetters = '';
				}
				break;
			default:
				break;
		}

		middleLettersInputRef?.focus();
	};

	let secondsLeft = $state(MAX_SECONDS);
	let isGameWon = $state(false);
	let isGameLost = $state(false);

	let secondsLeftCountdown = setInterval(() => {
		if (!isGameWon && !isGameLost) secondsLeft -= 0.1;
		if (secondsLeft < 0) clearInterval(secondsLeftCountdown);
	}, 100);

	$effect(() => {
		if (score == GAME_WINNING_SCORE) isGameWon = true;
		if (secondsLeft <= 0) isGameLost = true;
	});

	let score = $state(0);

	const handleResetGame = (e: SubmitEvent) => {
		e.preventDefault();
		isGameWon = false;
		isGameLost = false;
		score = 0;
		secondsLeft = MAX_SECONDS;
		answers = [];
		rerollCount = MAX_REROLL_COUNT;
		if (gameMode == 'daily') {
			dailyIdx = 0;
			finishedDaily.set('true');
			gameMode = 'random';
		}
	};

	$effect(() => {
		if (!isGameWon) middleLettersInputRef?.focus();
	});

	let answers: { word: string; timestamp: number }[] = $state([]);

	// answers = [
	// 	{ word: 'ERROR', timestamp: 5 },
	// 	{ word: 'GOVERNMENT', timestamp: 20 },
	// 	{ word: 'VOLITION', timestamp: 26 },
	// 	{ word: 'ASSIGNMENT', timestamp: 38 },
	// 	{ word: 'COLONY', timestamp: 42 }
	// ];

	const getTotalLetterCount = (words: string[]): number => {
		return words.map((a) => a.length).reduce((acc, curr) => acc + curr, 0);
	};

	const getMilestoneIdx = (milestones: number[], value: number): number => {
		let idx = 0;
		while (idx < milestones.length) {
			if (value < milestones[idx]) return idx;
			idx++;
		}
		return idx;
	};

	let wordMilestoneIdx = $derived(
		getMilestoneIdx(WORD_MILESTONES, getTotalLetterCount(answers.map((a) => a.word)))
	);
	let timeMilestoneIdx = $derived(getMilestoneIdx(TIME_MILESTONES, secondsLeft));

	const MAX_REROLL_COUNT = 1;
	let rerollCount = $state(MAX_REROLL_COUNT);

	let showToast = $state(false);
</script>

<div class="bg-polka flex h-svh flex-col justify-between">
	<!-- style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};" -->
	<div class="h-16 w-full border-b-4 border-[#10141f] bg-[#ebede9]">
		<div class="mx-auto flex h-full max-w-xl flex-row justify-between">
			<div class="flex flex-row content-center items-center justify-center gap-4">
				<button
					onclick={() => {
						gameMode = 'daily';
					}}
					class={`hover:cursor-pointer hover:text-[#cf573c] ${gameMode == 'daily' ? 'text-[#cf573c]' : ''}`}
				>
					<Icon icon="mdi:calendar-question" width="36" height="36" />
				</button>

				<button
					onclick={() => {
						gameMode = 'random';
					}}
					class={`hover:cursor-pointer hover:text-[#4f8fba] ${gameMode == 'random' ? 'text-[#4f8fba]' : ''}`}
				>
					<Icon icon="ri:dice-line" width="36" height="36" />
				</button>
			</div>
			<div
				class="flex flex-row content-center items-center justify-center font-mono text-4xl font-bold"
			>
				<span class="text-5xl text-[#cf573c]">M</span>IDDLE<span class="text-5xl text-[#4f8fba]"
					>S</span
				>
			</div>
			<div class="flex flex-row content-center items-center justify-center gap-4">
				<button class="ml-[52px] hover:cursor-pointer hover:text-[#4f8fba]">
					<Icon icon="ri:information-2-fill" width="36" height="36" />
				</button>
			</div>
		</div>
	</div>
	{#if !isGameWon && !isGameLost}
		<Game
			{handleSubmit}
			{score}
			{secondsLeft}
			{chosenLetterPairData}
			bind:middleLettersInputRef
			bind:middleLetters
			{rerollCount}
			{handleReroll}
		/>
	{:else}
		<Results
			{handleResetGame}
			{wordMilestoneIdx}
			{timeMilestoneIdx}
			{answers}
			{secondsLeft}
			bind:showToast
		/>
	{/if}
	<div class="absolute right-10 bottom-10 size-16 bg-[#ea5e82]">
		<img alt="Jordan Sibug's logo" src={Logo} />
	</div>
	{#if showToast}
		<div
			class="text-sans absolute bottom-5 left-1/2 flex h-16 w-fit -translate-x-1/2 flex-row items-center justify-between gap-2 border-4 border-[#10141f] bg-[#ebede9] px-4 py-2 text-2xl font-bold text-[#10141f]"
		>
			<div>copied to clipboard!</div>
			<button
				class="flex size-8 justify-center align-middle hover:bg-[#10141f] hover:text-[#ebede9]"
				onclick={() => {
					showToast = false;
				}}
			>
				<Icon class="self-center" icon="icomoon-free:cross" width="16" height="16" />
			</button>
		</div>
	{/if}
</div>

<style>
	.bg-polka {
		opacity: 1;
		background-image:
			radial-gradient(#ebede9 4px, transparent 4px), radial-gradient(#ebede9 4px, #e8c170 4px);
		background-size: 50px 50px;
	}
</style>
