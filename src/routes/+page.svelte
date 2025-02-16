<script lang="ts">
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronUp from '$lib/icons/ChevronUp.svelte';
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
	import Logo from '$lib/icons/Logo.svg';
	let bgPosition: number = $state(0);
	const xDir = Math.random() > 0.5 ? 1 : -1;
	const yDir = Math.random() > 0.5 ? 1 : -1;

	setInterval(() => {
		bgPosition = Math.round(((bgPosition + 0.05) % 200) * 200) / 200;
	}, 0.1);

	import letterPairData from '$lib/data/letterPairData.json';
	import { format } from 'date-fns-tz';

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
		rerollCount--;
		focusMiddleLettersInput();
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
			answers.push({ word: guess, timestamp: MAX_SECONDS - seconds });
		} else {
			middleLetters = '';
		}

		focusMiddleLettersInput();
	};

	const MAX_SECONDS = 90;
	let seconds = $state(MAX_SECONDS);
	let isGameWon = $state(false);
	let isGameLost = $state(false);
	const GAME_WINNING_SCORE = 5;

	setInterval(() => {
		if (!isGameWon && !isGameLost) seconds -= 0.1;
	}, 100);

	$effect(() => {
		if (score == GAME_WINNING_SCORE) isGameWon = true;
		if (seconds <= 0) isGameLost = true;
	});

	let score = $state(0);

	const convertSecondsToMinute = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const extraSeconds = Math.floor(seconds % 60);
		const minutesText = minutes < 10 ? '0' + minutes : minutes.toString();
		const extraSecondsText = extraSeconds < 10 ? '0' + extraSeconds : extraSeconds;
		return `${minutesText}:${extraSecondsText}`;
	};

	const handleResetGame = (e: SubmitEvent) => {
		e.preventDefault();
		isGameWon = false;
		isGameLost = false;
		score = 0;
		seconds = MAX_SECONDS;
		answers = [];
		isTimeScoreBreakdownOpen = false;
		isWordScoreBreakdownOpen = false;
		rerollCount = MAX_REROLL_COUNT;
	};

	$effect(() => {
		if (!isGameWon) focusMiddleLettersInput();
	});

	const focusMiddleLettersInput = () => {
		middleLettersInputRef?.focus();
	};

	let answers: { word: string; timestamp: number }[] = $state([]);

	answers = [
		{ word: 'ERROR', timestamp: 5 },
		{ word: 'GOVERNMENT', timestamp: 20 },
		{ word: 'VOLITION', timestamp: 26 },
		{ word: 'ASSIGNMENT', timestamp: 38 },
		{ word: 'COLONY', timestamp: 42 }
	];

	const WORD_MILESTONES = [20, 30, 40, 50];
	// const TIME_MILESTONES = [90, 100, 110, 120];
	const TIME_MILESTONES = [30, 40, 50, 60];

	const getTotalLetterCount = (words: string[]): number => {
		return words.map((a) => a.length).reduce((acc, curr) => acc + curr, 0);
	};

	const MILESTONE_TITLES = ['NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
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
	let timeMilestoneIdx = $derived(getMilestoneIdx(TIME_MILESTONES, seconds));

	let isWordScoreBreakdownOpen = $state(false);
	let isTimeScoreBreakdownOpen = $state(false);

	const MAX_REROLL_COUNT = 1;
	let rerollCount = $state(MAX_REROLL_COUNT);

	const createShareText = (): string => {
		const createScoreEmojis = () => {
			if (wordMilestoneIdx == 4 && timeMilestoneIdx == 4) {
				return '🟪🟪🟪🟪🟪🟪';
			}

			const wordScoreEmojis = '🟥'.repeat(Math.min(wordMilestoneIdx, 3));
			const timeScoreEmojis = '🟦'.repeat(Math.min(timeMilestoneIdx, 3));
			const noneScoreEmojis = '⬜'.repeat(
				6 - (Math.min(wordMilestoneIdx, 3) + Math.min(timeMilestoneIdx, 3))
			);

			return `${wordScoreEmojis}${timeScoreEmojis}${noneScoreEmojis}`;
		};
		return `Middles | ${format(new Date(), 'MMM d, yyyy')}\n${createScoreEmojis()}\nWord Score: ${wordMilestoneIdx}/3 | ${answers.map((a) => a.word.length).reduce((acc, curr) => acc + curr, 0)}\nTime Score: ${timeMilestoneIdx}/3 | ${convertSecondsToMinute(MAX_SECONDS - seconds)}`;
	};
</script>

<div class="bg-polka flex h-svh flex-col justify-between">
	<div
		class="h-16 w-full border-b-4 border-[#10141f] bg-[#ebede9]"
		style="background-position: {`${bgPosition * xDir}px ${bgPosition * yDir}px`};"
	></div>
	{#if !isGameWon && !isGameLost}
		<form
			onsubmit={handleSubmit}
			class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col items-center border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
		>
			<div class="flex w-full flex-row items-center">
				<div
					class=" w-1/2 border-t-4 border-r-2 border-b-4 border-[#10141f] bg-[#cf573c] p-2 text-center font-mono font-bold text-[#ebede9]"
				>
					{`${score}/${GAME_WINNING_SCORE}`}
				</div>
				<div
					class={`w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] bg-[#4f8fba] p-2 text-center font-mono font-bold ${seconds > 11 ? 'text-[#ebede9]' : seconds - Math.floor(seconds) < 0.5 ? 'text-[#10141f]' : 'text-[#ebede9]'}`}
				>
					{convertSecondsToMinute(seconds)}
				</div>
			</div>

			<div class="my-8 flex flex-row justify-center align-middle font-mono text-4xl">
				<div class="text-[#cf573c]">{chosenLetterPairData.firstLetter}</div>
				<input
					style={`width: ${Math.max(1, middleLetters.length)}ch;`}
					bind:this={middleLettersInputRef}
					bind:value={middleLetters}
					type="text"
					class="text-center uppercase outline-0"
				/>
				<div class="text-[#4f8fba]">{chosenLetterPairData.lastLetter}</div>
			</div>

			<div class="flex w-full flex-row">
				<button
					type="submit"
					class="w-1/2 border-t-4 border-r-2 border-b-4 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
				>
					submit
				</button>
				<button
					disabled={rerollCount == 0}
					class={`w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] p-2 ${rerollCount > 0 ? 'hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]' : 'bg-[#577277] text-[#ebede9] hover:cursor-not-allowed'}`}
					onclick={handleReroll}
				>
					{rerollCount > 0 ? 'reroll' : 'goodluck!'}
				</button>
			</div>
		</form>
	{:else}
		<form
			onsubmit={handleResetGame}
			class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
		>
			<div
				class="flex h-fit w-full flex-row justify-between border-t-4 border-b-4 border-[#10141f] px-8 py-4 text-center"
			>
				{#each { length: WORD_MILESTONES.length - 1 + TIME_MILESTONES.length - 1 }, idx}
					<div class="aspect-square w-1/8 border-4">
						{#if wordMilestoneIdx == WORD_MILESTONES.length && timeMilestoneIdx == TIME_MILESTONES.length}
							<div class="size-full bg-[#ea5e82]"></div>
						{:else if idx < Math.min(wordMilestoneIdx, WORD_MILESTONES.length - 1)}
							<div class="size-full bg-[#cf573c]"></div>
						{:else if idx < Math.min(wordMilestoneIdx, WORD_MILESTONES.length - 1) + Math.min(timeMilestoneIdx, TIME_MILESTONES.length - 1)}
							<div class="size-full bg-[#4f8fba]"></div>
						{:else}
							<div class="size-full"></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex flex-row">
				<div class="flex w-full flex-col px-8 py-4 text-lg">
					<button
						disabled={answers.length == 0}
						onclick={(e) => {
							e.preventDefault();
							isWordScoreBreakdownOpen = !isWordScoreBreakdownOpen;
						}}
						class={`flex flex-row justify-between text-2xl ${answers.length > 0 ? 'hover:cursor-pointer' : ''}`}
					>
						<div>WORD SCORE</div>
						<div class="flex flex-row items-center gap-2">
							<div class="font-mono text-[#cf573c]">
								{`(${MILESTONE_TITLES[wordMilestoneIdx]}) ${wordMilestoneIdx}/${MILESTONE_TITLES.length - 2}`}
							</div>
							{#if answers.length > 0}
								{#if !isWordScoreBreakdownOpen}
									<ChevronDown class="size-8" />
								{:else}
									<ChevronUp class="size-8" />
								{/if}
							{/if}
						</div>
					</button>

					{#if isWordScoreBreakdownOpen}
						{#each answers as answer, idx}
							<div
								class={`flex w-full flex-row justify-between ${
									idx == answers.length - 1 ? 'mb-2 border-b-4 border-[#10141f] pb-2' : ''
								} ${idx == 0 ? 'mt-4' : ''}`}
							>
								<div>{answer.word}</div>
								<div class="font-mono text-[#cf573c]">
									+{String(answer.word.length.toString()).padStart(2, '0')}
								</div>
							</div>
						{/each}
						{#if answers.length > 0}
							<div class="flex flex-row justify-between text-2xl">
								<div>TOTAL</div>
								<div class="font-mono text-[#cf573c]">
									{answers
										.map((a) => a.word.length)
										.reduce((acc, curr) => acc + curr, 0)
										.toString()}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<div class="flex w-full flex-col border-t-4 border-[#10141f] px-8 py-4">
				<button
					disabled={answers.length == 0}
					class={`w-full ${answers.length > 0 ? 'hover:cursor-pointer' : ''}`}
					onclick={(e) => {
						e.preventDefault();
						isTimeScoreBreakdownOpen = !isTimeScoreBreakdownOpen;
					}}
				>
					<div class="flex w-full flex-row justify-between">
						<div>TIME SCORE</div>
						<div class="flex flex-row items-center gap-2">
							<div class="font-mono text-[#4f8fba]">
								{`(${MILESTONE_TITLES[timeMilestoneIdx]}) ${timeMilestoneIdx}/${MILESTONE_TITLES.length - 2}`}
							</div>

							{#if answers.length > 0}
								{#if !isTimeScoreBreakdownOpen}
									<ChevronDown class="size-8" />
								{:else}
									<ChevronUp class="size-8" />
								{/if}
							{/if}
						</div>
					</div>
				</button>
				{#if isTimeScoreBreakdownOpen}
					<div class="flex flex-col justify-between text-lg">
						{#each answers as answer, idx}
							<div
								class={`flex w-full flex-row justify-between ${
									idx == answers.length - 1 ? 'mb-2 border-b-4 border-[#10141f] pb-2' : ''
								} ${idx == 0 ? 'mt-4' : ''}`}
							>
								<div>{answer.word}</div>
								<div class="font-mono text-[#4f8fba]">
									+{convertSecondsToMinute(
										answer.timestamp - (idx == 0 ? 0 : answers[idx - 1].timestamp)
									)}
								</div>
							</div>
						{/each}
					</div>
					{#if seconds == MAX_SECONDS}
						<div class="flex flex-row justify-between text-2xl">
							<div>FINISH TIME</div>
							<div class="font-mono text-[#4f8fba]">
								{convertSecondsToMinute(MAX_SECONDS - seconds)}
							</div>
						</div>
						<div class="mt-4 grid overflow-clip border-4 border-[#10141f] text-[#ebede9]">
							<div
								class={`col-start-1 row-start-1 h-8 border-r-4 border-[#cf573c] bg-[#4f8fba]`}
								style={`width: ${((MAX_SECONDS - seconds) / MAX_SECONDS) * 100 + 0.5}%`}
							></div>

							{#each answers as answer}
								<div
									class="col-start-1 row-start-1 h-full border-r-4 border-[#cf573c]"
									style={`width:  ${(answer.timestamp / MAX_SECONDS) * 100 + 0.5}%;`}
								></div>
							{/each}
							{#each { length: MAX_SECONDS / 5 + 1 }, idx}
								{#if idx != 0 && idx != MAX_SECONDS / 5}
									<div
										class={`col-start-1 row-start-1 -mt-0.5 border-r-4 border-[#10141f] ${idx % 2 == 0 ? 'h-4' : 'h-2'}`}
										style={`width: ${(idx / (MAX_SECONDS / 5)) * 100 + 0.5}%`}
									></div>
								{/if}
							{/each}
						</div>
						<div class="text-xs text-[#10141f]">* each tick represents 5 seconds</div>
					{/if}
				{/if}
			</div>

			<div class="flex w-full flex-row">
				<button
					class="w-1/2 border-t-4 border-r-2 border-b-4 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
					onclick={(e) => {
						e.preventDefault();
						console.log(createShareText());
					}}>share!</button
				>
				<button
					type="submit"
					class="w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
					>play again?</button
				>
			</div>
		</form>
	{/if}
	<div class="absolute right-10 bottom-10 size-16 bg-[#ea5e82]">
		<img alt="Jordan Sibug's logo" src={Logo} />
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
