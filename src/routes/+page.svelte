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
			console.log({ word: guess, timestamp: MAX_SECONDS - seconds });
		} else {
			middleLetters = '';
		}

		focusMiddleLettersInput();
	};

	const MAX_SECONDS = 90;
	let seconds = $state(0);
	let isGameWon = $state(false);
	let isGameLost = $state(false);
	const GAME_WINNING_SCORE = 0;

	setInterval(() => {
		if (!isGameWon && !isGameLost) seconds -= 1;
	}, 1000);

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
	};

	$effect(() => {
		if (!isGameWon) focusMiddleLettersInput();
	});

	const focusMiddleLettersInput = () => {
		middleLettersInputRef?.focus();
	};

	let answers: { word: string; timestamp: number }[] = $state([]);

	answers = [
		{ word: '12345', timestamp: 10 },
		{ word: '1234567890', timestamp: 20 },
		{ word: '1234567890', timestamp: 30 },
		{ word: '1234567890', timestamp: 40 },
		{ word: '1234567890', timestamp: 50 }
	];

	const WORD_MILESTONES = [20, 30, 40, 50];
	// const TIME_MILESTONES = [90, 100, 110, 120];
	const TIME_MILESTONES = [30, 60, 75, 90];

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
					class="w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] bg-[#4f8fba] p-2 text-center font-mono font-bold text-[#ebede9]"
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
					type="reset"
					class="w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
					onclick={handleReroll}
				>
					reroll
				</button>
			</div>
		</form>
	{:else}
		<form
			onsubmit={handleResetGame}
			class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
		>
			<div
				class="flex w-full flex-row justify-evenly border-t-4 border-b-4 border-[#10141f] px-8 py-4 text-center"
			>
				<span class="text-[#cf573c]">{MILESTONE_TITLES[wordMilestoneIdx]}</span>
				<span class="text-[#4f8fba]">{MILESTONE_TITLES[timeMilestoneIdx]}</span>
			</div>
			<div
				class="flex h-fit w-full flex-row justify-between border-b-4 border-[#10141f] px-8 py-4 text-center"
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
					{#each answers as answer, idx}
						<div
							class={`flex w-full flex-row justify-between ${
								idx == answers.length - 1 ? ' border-b-4 border-[#10141f] pb-2' : ''
							}`}
						>
							<div>{answer.word}</div>
							<div class="font-mono text-[#cf573c]">
								+{String(answer.word.length.toString()).padStart(2, '0')}
							</div>
						</div>
					{/each}

					<div class="flex flex-row justify-between pt-2 text-2xl text-[#cf573c]">
						<div>WORD SCORE</div>
						<div class="font-mono">
							{answers
								.map((a) => a.word.length)
								.reduce((acc, curr) => acc + curr, 0)
								.toString()}
						</div>
					</div>
				</div>
			</div>

			<div class="flex w-full flex-col border-t-4 border-[#10141f] px-8 py-4">
				<div class="grid overflow-clip border-4 border-[#10141f] text-[#ebede9]">
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
				<div class="w-full">
					<div class="flex w-full flex-row justify-between pt-2 text-[#4f8fba]">
						<div>TIME SCORE</div>
						<div class="font-mono">{convertSecondsToMinute(seconds)}</div>
					</div>
				</div>
			</div>

			<button
				type="submit"
				class="w-full border-t-4 border-b-4 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
				>play again?</button
			>
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
