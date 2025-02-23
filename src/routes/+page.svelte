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
	import { convertSecondsToMinute } from '$lib/utils';

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

	setInterval(() => {
		if (isPlaying) secondsLeft -= 0.1;
	}, 100);

	$effect(() => {
		if (score == GAME_WINNING_SCORE) isGameWon = true;
		if (secondsLeft <= 0) isGameLost = true;
	});

	let score = $state(0);

	const handleResetGame = () => {
		isGameWon = false;
		isGameLost = false;
		score = 0;
		secondsLeft = MAX_SECONDS;
		answers = [];
		rerollCount = MAX_REROLL_COUNT;
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

	let showModal = $state(true);
</script>

<div class="bg-polka flex h-svh flex-col justify-between">
	<!-- style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};" -->
	<div class="h-16 w-full border-b-4 border-[#10141f] bg-[#ebede9]">
		<div class="mx-auto flex h-full max-w-xl flex-row justify-between">
			<div class="flex flex-row content-center items-center justify-center gap-4">
				<div class={gameMode == 'daily' ? 'text-[#cf573c]' : ''}>
					<Icon icon="mdi:calendar-question" width="36" height="36" />
				</div>

				<div class={gameMode == 'random' ? 'text-[#4f8fba]' : ''}>
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
				<span class="text-5xl text-[#cf573c]">M</span>IDDLE<span class="text-5xl text-[#4f8fba]"
					>S</span
				>
			</button>
			<div class="flex flex-row content-center items-center justify-center gap-4">
				<button
					onclick={() => {
						showModal = true;
					}}
					class="ml-[52px] hover:cursor-pointer hover:text-[#4f8fba]"
				>
					<Icon icon="ri:information-2-fill" width="36" height="36" />
				</button>
			</div>
		</div>
	</div>
	{#if !isPlaying}
		<div
			class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col items-center justify-between border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
		>
			<div class="w-full">
				<div class="flex w-full flex-row border-t-4 border-b-4 border-[#10141f] text-center">
					<button
						onclick={() => {
							isPlaying = true;
						}}
						disabled={gameMode == 'daily' &&
							$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}
						class="w-5/7 border-r-4 border-[#10141f] px-8 py-4 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
					>
						play {gameMode == 'random' ? 'random' : 'daily'}
					</button>
					<button
						onclick={() => {
							gameMode = 'daily';
						}}
						disabled={gameMode == 'daily' ||
							$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}
						class={`flex w-1/7 flex-row justify-center border-r-4 border-[#10141f] ${$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString() ? 'bg-diagonal-small' : gameMode == 'daily' ? 'bg-[#cf573c] text-[#ebede9] hover:cursor-default hover:text-[#ebede9]' : 'hover:cursor-pointer hover:text-[#cf573c]'}`}
					>
						<Icon
							class={`self-center ${$finishedDaily == new Date(new Date().setHours(0, 0, 0, 0)).toISOString() ? 'bg-[#ebede9]' : ''}`}
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
						class={`flex w-1/7 flex-row justify-center border-[#10141f] ${gameMode == 'random' ? 'bg-[#4f8fba] text-[#ebede9] hover:cursor-default hover:text-[#ebede9]' : 'hover:cursor-pointer hover:text-[#4f8fba]'}`}
					>
						<Icon class="self-center" icon="ri:dice-line" width="36" height="36" />
					</button>
				</div>
				<button
					onclick={() => {
						showModal = true;
					}}
					class="w-full border-b-4 px-8 py-4 text-center">how to play?</button
				>
				<div
					class="flex w-full flex-col justify-center border-[#10141f] px-8 py-4 text-center text-lg leading-6"
				>
					{`${format(new Date(), 'MMM dd, yyyy')} - Sequence #${dayDiff}`} <br />
					<span class="text-base">{`by sisyphi`}</span>
				</div>
			</div>
			<div
				class="bg-diagonal-large flex w-full flex-row justify-center border-t-4 border-b-4 border-[#10141f] px-4 py-8"
			>
				<div
					class="flex flex-row gap-4 border-4 bg-[#ebede9] px-8 py-4 text-lg leading-6 text-[#10141f]"
				>
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
	{#if showModal}
		<div
			class="text-sans absolute top-1/2 left-1/2 flex h-4/5 max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 overflow-scroll border-4 border-[#10141f] bg-[#ebede9] px-8 py-4 text-2xl font-bold text-[#10141f]"
		>
			<div class="flex w-full flex-row content-center justify-between text-4xl">
				<div>How to play?</div>
				<button
					class="flex size-8 flex-row justify-center self-center hover:bg-[#10141f] hover:text-[#ebede9]"
					onclick={() => {
						showModal = false;
					}}
				>
					<Icon class="self-center" icon="icomoon-free:cross" width="16" height="16" />
				</button>
			</div>
			<ul class="ml-4 flex list-disc flex-col gap-4 text-left text-lg">
				<li class="">
					<div>
						With the <span class="text-[#cf573c]">FIRST</span>
						and <span class="text-[#4f8fba]">LAST</span> letter, fill in the MIDDLE to form a word.
					</div>
					<div class="flex w-full flex-row justify-center font-mono text-4xl">
						<span class="text-[#cf573c]">A</span>NSWE<span class="text-[#4f8fba]">R</span>
					</div>
				</li>
				<li>
					<div>
						Remember, you DON'T need to type the <span class="text-[#cf573c]">FIRST</span> and
						<span class="text-[#4f8fba]">LAST</span> letters.
					</div>
					<div class="flex flex-row justify-between gap-4">
						<div class="flex flex-row content-center gap-2 font-mono text-4xl">
							<div class="flex flex-row self-center">
								<span class="text-[#cf573c]">C</span>ORREC<span class="text-[#4f8fba]">T</span>
							</div>
							<Icon
								class="self-center text-[#4f8fba]"
								icon="icomoon-free:checkmark"
								width="48"
								height="48"
							/>
						</div>
						<div class="flex flex-row content-center gap-2 align-middle font-mono text-4xl">
							<div class="flex flex-row self-center">
								<span class="text-[#cf573c]">W</span>WRONG<span class="text-[#4f8fba]">G</span>
							</div>
							<Icon
								class="self-center text-[#cf573c]"
								icon="icomoon-free:cross"
								width="36"
								height="36"
							/>
						</div>
					</div>
				</li>
				<li>
					<div>Press ENTER or the submit button to send your answer.</div>
					<div class="flex flex-row justify-center gap-4">
						<Icon icon="icon-park-solid:enter-key" width="56" height="56" />
						<span class="self-center">or</span>
						<div
							class="h-fit w-1/3 self-center border-4 border-[#10141f] p-2 text-center hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
						>
							submit
						</div>
					</div>
				</li>
				<li>
					<div></div>
					Get {GAME_WINNING_SCORE} CORRECT ANSWERS before the TIME runs out.
					<div class="flex w-full flex-row items-center border-4 border-[#10141f]">
						<div class=" w-1/2 bg-[#cf573c] p-2 text-center font-mono font-bold text-[#ebede9]">
							{`0/${GAME_WINNING_SCORE}`}
						</div>
						<div
							class={`w-1/2 border-l-4 border-[#10141f] bg-[#4f8fba] p-2 text-center font-mono font-bold text-[#ebede9]`}
						>
							{convertSecondsToMinute(90)}
						</div>
					</div>
				</li>
				<li>Longer words and faster times gets you higher scores.</li>
			</ul>
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

	.bg-diagonal-large {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 16px, #ebede9 16px, #ebede9 48px);
	}

	.bg-diagonal-small {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 8px, #ebede9 8px, #ebede9 24px);
	}
</style>
