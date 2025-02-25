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
	import Typewriter from 'svelte-typewriter';

	// let bgPosition: number = $state(0);
	// const xDir = Math.random() > 0.5 ? 1 : -1;
	// const yDir = Math.random() > 0.5 ? 1 : -1;
	// setInterval(() => {
	// 	bgPosition = Math.round(((bgPosition + 0.05) % 200) * 200) / 200;
	// }, 0.1);

	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';
	import Results from '$lib/components/Results.svelte';
	import Game from '$lib/components/Game.svelte';
	import {
		GAME_WINNING_SCORE,
		MAX_REROLL_COUNT,
		MAX_SECONDS,
		MINIMUM_WORD_COUNT,
		ORIGIN_DATE,
		TIME_MILESTONES,
		WORD_MILESTONES
	} from '$lib/constants';

	import { finishedDaily } from '$lib/stores';
	import { format } from 'date-fns-tz';
	import Tutorial from '$lib/components/Tutorial.svelte';

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

		if (score == GAME_WINNING_SCORE) {
			isGameWon = true;
		}

		middleLettersInputRef?.focus();
	};

	let secondsLeft = $state(MAX_SECONDS);
	let isGameWon = $state(false);
	let isGameLost = $state(false);

	setInterval(() => {
		if (isPlaying && !isGameWon && !isGameLost) secondsLeft -= 0.1;
	}, 100);

	$effect(() => {
		if (secondsLeft <= 0) {
			isGameLost = true;
		}
	});

	let score = $state(0);

	const handleResetGame = () => {
		isGameWon = false;
		isGameLost = false;
		score = 0;
		secondsLeft = MAX_SECONDS;
		answers = [];
		rerollCount = MAX_REROLL_COUNT;
		randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
		if (gameMode == 'daily') {
			dailyIdx = 0;
			$finishedDaily = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
			gameMode = 'random';
		}
	};

	$effect(() => {
		if (!isGameWon) middleLettersInputRef?.focus();
	});

	let answers: { word: string; timestamp: number }[] = $state([]);

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

	let rerollCount = $state(MAX_REROLL_COUNT);

	let showToast = $state(false);

	let isPlaying = $state(false);

	let timeDiff = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - ORIGIN_DATE.getTime();
	let dayDiff = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;

	let showModal = $state(false);
</script>

<div class="bg-polka flex h-svh flex-col justify-between">
	<!-- style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};" -->
	<div class="h-16 w-full border-b-4 border-black bg-white px-4">
		<div class="xs:justify-between mx-auto flex h-full max-w-xl flex-row justify-center">
			<div class="xs:flex hidden flex-row content-center items-center justify-center gap-4">
				<div class={gameMode == 'daily' ? 'text-red' : ''}>
					<Icon icon="mdi:calendar-question" width="36" height="36" />
				</div>

				<div class={gameMode == 'random' ? 'text-blue' : ''}>
					<Icon icon="ri:dice-line" width="36" height="36" />
				</div>
			</div>
			<button
				onclick={() => {
					handleResetGame();
					isPlaying = false;
				}}
				class="flex flex-row content-center items-center justify-center font-mono text-4xl font-bold hover:cursor-pointer"
			>
				<span class="text-red text-5xl">M</span>IDDLE<span class="text-blue text-5xl">S</span>
			</button>
			<div class="xs:flex hidden flex-row content-center items-center justify-center gap-4">
				<button
					onclick={() => {
						showModal = true;
					}}
					class="hover:text-red ml-[52px] hover:cursor-pointer"
				>
					<Icon icon="ri:information-2-fill" width="36" height="36" />
				</button>
			</div>
		</div>
	</div>
	{#if !isPlaying}
		<div
			class="xs:max-w-lg xs:border-r-4 xs:border-l-4 mx-auto mt-32 flex w-full flex-1 flex-col items-center justify-between border-black bg-white font-sans text-2xl font-bold text-black"
		>
			<div class="w-full">
				<div class="flex w-full flex-row border-t-4 border-b-4 border-black text-center">
					<button
						onclick={() => {
							isPlaying = true;
						}}
						disabled={gameMode == 'daily' &&
							$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}
						class="w-5/7 border-r-4 border-black px-8 py-4 hover:cursor-pointer hover:bg-black hover:text-white"
					>
						play {gameMode == 'random' ? 'random' : 'daily'}
					</button>
					<button
						onclick={() => {
							gameMode = 'daily';
						}}
						disabled={gameMode == 'daily' ||
							$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}
						class={`flex w-1/7 flex-row justify-center border-r-4 border-black ${$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString() ? 'bg-diagonal-small' : gameMode == 'daily' ? 'bg-red text-white hover:cursor-default hover:text-white' : 'hover:text-red hover:cursor-pointer'}`}
					>
						<Icon
							class={`self-center ${$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString() ? 'bg-white' : ''}`}
							icon="mdi:calendar-question"
							width="36"
							height="36"
						/>
					</button>

					<button
						onclick={() => {
							gameMode = 'random';
						}}
						disabled={gameMode == 'random'}
						class={`flex w-1/7 flex-row justify-center border-black ${gameMode == 'random' ? 'bg-blue text-white hover:cursor-default hover:text-white' : 'hover:text-blue hover:cursor-pointer'}`}
					>
						<Icon class="self-center" icon="ri:dice-line" width="36" height="36" />
					</button>
				</div>
				<button
					onclick={() => {
						showModal = true;
					}}
					class="w-full border-b-4 px-8 py-4 text-center hover:cursor-pointer hover:bg-black hover:text-white"
					>how to play?</button
				>
				<div
					class="flex w-full flex-col justify-center border-black px-8 py-4 text-center text-lg leading-6"
				>
					{`${format(new Date(), 'MMM dd, yyyy')} - Sequence #${dayDiff}`} <br />
					<span class="text-base">{`by sisyphi`}</span>
				</div>
			</div>
			<div
				class="bg-diagonal-large flex w-full flex-row justify-center border-t-4 border-b-4 border-black px-4 py-8"
			>
				<div class="flex flex-row gap-4 border-4 bg-white px-8 py-4 text-lg leading-6 text-black">
					<Icon class="self-center" icon="lucide:construction" width="52" height="52" />
					<div class="flex flex-col justify-center text-center">
						stats under<br />construction
					</div>
					<Icon class="self-center" icon="lucide:construction" width="52" height="52" />
				</div>
			</div>
		</div>
	{:else if !isGameWon && !isGameLost}
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
			bind:isPlaying
		/>
	{/if}
	<div class="absolute right-10 bottom-10 hidden size-16 bg-[#ea5e82] md:block">
		<img alt="Jordan Sibug's logo" src={Logo} />
	</div>
	{#if showToast}
		<div
			class="text-sans absolute bottom-5 left-1/2 flex h-16 w-fit -translate-x-1/2 flex-row items-center justify-between gap-2 border-4 border-black bg-white px-4 py-2 text-2xl font-bold text-black"
		>
			<div>copied to clipboard!</div>
			<button
				class="flex size-8 justify-center align-middle hover:bg-black hover:text-white"
				onclick={() => {
					showToast = false;
				}}
			>
				<Icon class="self-center" icon="icomoon-free:cross" width="16" height="16" />
			</button>
		</div>
	{/if}
	{#if showModal}
		<Tutorial bind:showModal />
	{/if}
</div>

<style>
	.bg-polka {
		opacity: 1;
		background-image:
			radial-gradient(#ebede9 4px, transparent 4px), radial-gradient(#ebede9 4px, #e8c170 4px);
		background-size: 50px 50px;
	}

	.bg-diagonal-large {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 16px, #ebede9 16px, #ebede9 48px);
	}

	.bg-diagonal-small {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 8px, #ebede9 8px, #ebede9 24px);
	}
</style>
