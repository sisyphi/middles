<script lang="ts">
	// import dictTxt from '$lib/data/words_alpha.txt?raw';
	// import lettersTxt from '$lib/data/letters.txt?raw';

	// let dict = dictTxt.split('\r\n');
	// const letters = lettersTxt.split('\n');

	// dict = dict.map((word) => word.toLowerCase());

	// const letterPairData = [];
	// for (const f of letters) {
	// 	for (const l of letters) {
	// 		const words = dict.filter(
	// 			(w) => w[0] == f.toLowerCase() && w[w.length - 1] == l.toLowerCase()
	// 		);
	// 		letterPairData.push({
	// 			pair: { firstLetter: f, lastLetter: l },
	// 			count: words.length,
	// 			words: words
	// 		});
	// 	}
	// }

	import Logo from '$lib/icons/Logo.svg';

	import { wordHighscore, timeHighscore, todayAnswers, todaySecondsLeft } from '$lib/stores';

	import type { PageProps } from './$types';
	import Icon from '@iconify/svelte';
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

	import { todayFinished } from '$lib/stores';
	import { format } from 'date-fns-tz';
	import Tutorial from '$lib/components/Tutorial.svelte';
	import { convertSecondsToMinute, isDailyFinished } from '$lib/utils';
	import CopiedModal from '$lib/components/CopiedModal.svelte';
	import ResultsV2 from '$lib/components/ResultsV2.svelte';

	let { data }: PageProps = $props();

	const availableLetterPairsData = data.letterPairData.filter(
		(lpd) => lpd.count >= MINIMUM_WORD_COUNT
	);

	const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
	if ($todayFinished < today) {
		$todayFinished = 'none';
		$todayAnswers = 'none';
		$todaySecondsLeft = MAX_SECONDS.toString();
	}

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
			chosenLetterPairData.pair.firstLetter +
			middleLetters +
			chosenLetterPairData.pair.lastLetter
		).toUpperCase();

		const timestamp = MAX_SECONDS - secondsLeft;

		switch (gameMode) {
			case 'random':
				if (chosenLetterPairData.words.includes(guess)) {
					score += 1;
					middleLetters = '';
					randIdx = Math.floor(Math.random() * availableLetterPairsData.length);
					middleLettersInputRef?.focus();

					answers.push({
						word: guess,
						timestamp
					});
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

					dailyAnswers.push({
						word: guess,
						timestamp
					});

					$todayAnswers =
						$todayAnswers === 'none'
							? `[${JSON.stringify({
									word: guess,
									timestamp
								})}]`
							: `[${$todayAnswers.replace('[', '').replace(']', '')},${JSON.stringify({
									word: guess,
									timestamp
								})}]`;

					$todaySecondsLeft = secondsLeft.toString();

					if ($todayAnswers !== 'none' && JSON.parse($todayAnswers).length >= GAME_WINNING_SCORE) {
						$todayFinished = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
					}
				} else {
					middleLetters = '';
				}
				break;
			default:
				break;
		}

		if (score == GAME_WINNING_SCORE) {
			isGameWon = true;
			const wordScore = answers.map((a) => a.word.length).reduce((acc, curr) => acc + curr, 0);
			if (wordScore >= +$wordHighscore) {
				$wordHighscore = wordScore.toString();
				$timeHighscore = `${Math.floor(timestamp)}`;
			}
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
		middleLetters = '';
		if (gameMode == 'daily') {
			dailyIdx = 0;
			$todayFinished = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
			gameMode = 'random';
		}
	};

	$effect(() => {
		if (!isGameWon) middleLettersInputRef?.focus();
	});

	let dailyAnswers: {
		word: string;
		timestamp: number;
	}[] = $state([]);

	let answers: {
		word: string;
		timestamp: number;
	}[] = $state([]);

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
		getMilestoneIdx(
			WORD_MILESTONES,
			getTotalLetterCount(
				gameMode === 'daily'
					? JSON.parse($todayAnswers).map((a: { word: string; timestamp: number[] }) => a.word)
					: answers.map((a) => a.word)
			)
		)
	);
	let timeMilestoneIdx = $derived(
		getMilestoneIdx(TIME_MILESTONES, gameMode === 'daily' ? +$todaySecondsLeft : secondsLeft)
	);

	let rerollCount = $state(MAX_REROLL_COUNT);

	let showToast = $state(false);

	let isPlaying = $state(false);

	let timeDiff = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - ORIGIN_DATE.getTime();
	let dayDiff = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;

	let showModal = $state(false);

	let showDailyScoreBreakdown = $state(false);
</script>

<div class="bg-polka flex h-svh flex-col justify-between">
	<!-- style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};" -->
	<div class="h-16 w-full border-b-4 border-black bg-white px-4">
		<div class="xs:justify-between mx-auto flex h-full max-w-xl flex-row justify-center">
			<div class="xs:flex hidden flex-row content-center items-center justify-center gap-4">
				<div class="w-[88px]"></div>
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
			class="xs:max-w-lg xs:border-r-4 xs:border-l-4 mx-auto mt-32 flex w-full flex-1 flex-col items-center justify-between border-t-4 border-black bg-white font-sans text-2xl font-bold text-black"
		>
			<div class="w-full">
				<div class="xs:flex-row flex w-full flex-col">
					<div class={`xs:border-r-4 xs:w-1/2 flex w-full flex-row border-b-4 border-black`}>
						<button
							onclick={() => {
								gameMode = 'daily';
								isPlaying = true;
							}}
							disabled={isDailyFinished()}
							class={`flex w-full flex-row gap-2 border-black px-8 py-4 text-left ${isDailyFinished() ? 'hover:cursor-not-allowed' : 'hover:bg-red hover:cursor-pointer hover:**:text-white'}`}
						>
							{#if isDailyFinished()}
								<Icon
									class="xs:order-1 order-2 self-center"
									icon="icomoon-free:checkmark"
									width="36"
									height="36"
								/>
							{:else}
								<Icon
									class="xs:order-1 order-2 self-center"
									icon="mdi:calendar-question"
									width="36"
									height="36"
								/>
							{/if}
							<span class="xs:order-2 order-1 self-center">
								{#if isDailyFinished()}
									<span class="text-red">daily</span> done
								{:else}
									<span class="text-red">daily</span> play
								{/if}
							</span>
						</button>
					</div>
					<div class="xs:w-1/2 flex w-full flex-row border-b-4 border-black">
						<button
							onclick={() => {
								gameMode = 'random';
								isPlaying = true;
							}}
							disabled={gameMode == 'daily' && isDailyFinished()}
							class="hover:bg-blue flex w-full flex-row gap-2 border-black px-8 py-4 text-left hover:cursor-pointer hover:**:text-white"
						>
							<Icon
								class="xs:order-1 order-2 self-center"
								icon="ri:dice-line"
								width="36"
								height="36"
							/>
							<span class="xs:order-2 order-1 self-center">
								<span class="text-blue">random</span> play
							</span>
						</button>
					</div>
				</div>
				<button
					onclick={() => {
						showModal = true;
					}}
					class="w-full border-b-4 border-black px-8 py-4 text-left hover:cursor-pointer hover:bg-black hover:text-white"
					>how to play?</button
				>
				<div
					class="xs:gap-0 flex w-full flex-col items-center justify-center gap-4 border-b-4 border-black px-8 py-4"
				>
					<div class="xs:flex-row xs:justify-between flex w-full flex-col text-left">
						<span class="xs:self-center"> best score </span>
						<span class="xs:self-center">
							<span class="text-red font-mono">{$wordHighscore}</span>
							in
							<span class="text-blue font-mono">{convertSecondsToMinute(+$timeHighscore)}</span>
						</span>
					</div>
				</div>
				{#if isDailyFinished()}
					<div class="xs:px-8 xs:py-4 flex w-full flex-col border-b-4 border-black px-8 py-4">
						<button
							disabled={$todayAnswers === 'none'}
							class={`w-full ${$todayAnswers !== 'none' ? 'hover:cursor-pointer' : ''}`}
							onclick={(e) => {
								e.preventDefault();
								showDailyScoreBreakdown = !showDailyScoreBreakdown;
							}}
						>
							<div class="flex w-full flex-row justify-between">
								<span><span class="text-red">daily</span> stats</span>
								<span class="flex flex-row items-center gap-2">
									{#if $todayAnswers !== 'none'}
										{#if !showDailyScoreBreakdown}
											<Icon icon="oi:chevron-bottom" width="16" height="16" />
										{:else}
											<Icon icon="oi:chevron-top" width="16" height="16" />
										{/if}
									{/if}
								</span>
							</div>
						</button>
						{#if showDailyScoreBreakdown}
							<div class="flex flex-col justify-between text-lg">
								{#each JSON.parse($todayAnswers) as answer, idx}
									<div
										class={`flex w-full flex-row justify-between ${
											idx == JSON.parse($todayAnswers).length - 1
												? 'mb-2 border-b-4 border-black pb-2'
												: ''
										} ${idx == 0 ? 'mt-4' : ''}`}
									>
										<div>{answer.word}</div>
										<div class="flex flex-row justify-between gap-4 font-mono">
											<span class="text-red">
												{String(answer.word.length.toString()).padStart(2, '0')}
											</span>
											<span class="text-blue">
												+{convertSecondsToMinute(
													answer.timestamp -
														(idx == 0 ? 0 : JSON.parse($todayAnswers)[idx - 1].timestamp)
												)}
											</span>
										</div>
									</div>
								{/each}
							</div>
							<div class="flex flex-row justify-between text-2xl">
								<div>FINAL SCORE</div>
								<div class="flex flex-row justify-between gap-4 font-mono">
									<span class="text-red">
										{JSON.parse($todayAnswers)
											.map((a: { word: string; timestamp: number }) => a.word.length)
											.reduce((acc: number, curr: number) => acc + curr, 0)
											.toString()
											.padStart(2, '0')}
									</span>
									<span class="text-blue">
										{convertSecondsToMinute(MAX_SECONDS - +$todaySecondsLeft)}
									</span>
								</div>
							</div>
							<div class="mt-4 grid overflow-clip border-4 border-black text-white">
								<div
									class={`bg-blue border-red col-start-1 row-start-1 h-8 border-r-4`}
									style={`width: ${((MAX_SECONDS - +$todaySecondsLeft) / MAX_SECONDS) * 100 + 0.5}%`}
								></div>

								{#each JSON.parse($todayAnswers) as answer}
									<div
										class="border-red col-start-1 row-start-1 h-full border-r-4"
										style={`width:  ${(answer.timestamp / MAX_SECONDS) * 100 + 0.5}%;`}
									></div>
								{/each}
								{#each { length: MAX_SECONDS / 5 + 1 }, idx}
									{#if idx != 0 && idx != MAX_SECONDS / 5}
										<div
											class={`col-start-1 row-start-1 -mt-0.5 border-r-4 border-black ${idx % 2 == 0 ? 'h-4' : 'h-2'}`}
											style={`width: ${(idx / (MAX_SECONDS / 5)) * 100 + 0.5}%`}
										></div>
									{/if}
								{/each}
							</div>
							<div class="text-xs text-black">* each tick represents 5 seconds</div>
						{/if}
					</div>
				{/if}
				<div
					class="flex w-full flex-col justify-center border-black px-8 py-4 text-center text-lg leading-6"
				>
					{`${format(new Date(), 'MMM dd, yyyy')} - Sequence #${dayDiff}`}
					<br />
					<span class="text-base">{`by sisyphi`}</span>
				</div>
			</div>
			<!-- <div
				class="bg-diagonal-large flex w-full flex-row justify-center border-t-4 border-b-4 border-black px-4 py-8"
			>
				<div class="flex flex-row gap-4 border-4 bg-white px-8 py-4 text-lg leading-6 text-black">
					<Icon class="self-center" icon="lucide:construction" width="52" height="52" />
					<div class="flex flex-col justify-center text-center">
						stats under<br />construction
					</div>
					<Icon class="self-center" icon="lucide:construction" width="52" height="52" />
				</div>
			</div> -->
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
		<!-- <Results
			{handleResetGame}
			{wordMilestoneIdx}
			{timeMilestoneIdx}
			{answers}
			{secondsLeft}
			bind:showToast
			bind:isPlaying
		/> -->
		<ResultsV2
			{handleResetGame}
			{wordMilestoneIdx}
			{timeMilestoneIdx}
			answers={gameMode === 'daily' ? JSON.parse($todayAnswers) : answers}
			secondsLeft={gameMode === 'daily' ? +$todaySecondsLeft : secondsLeft}
			bind:showToast
			bind:isPlaying
		/>
	{/if}
	<div class="absolute right-10 bottom-10 hidden size-16 bg-[#ea5e82] md:block">
		<img alt="Jordan Sibug's logo" src={Logo} />
	</div>
	{#if showToast}
		<CopiedModal bind:showToast />
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

	.bg-diagonal-lg {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 16px, #ebede9 16px, #ebede9 48px);
	}

	.bg-diagonal-sm {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 8px, #ebede9 8px, #ebede9 24px);
	}
</style>
