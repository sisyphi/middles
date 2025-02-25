<script lang="ts">
	import { MAX_SECONDS, MILESTONE_TITLES, TIME_MILESTONES, WORD_MILESTONES } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import { convertSecondsToMinute } from '$lib/utils';
	import { format } from 'date-fns-tz';
	import Countdown from './Countdown.svelte';

	const createShareText = (
		wordMilestoneIdx: number,
		timeMilestoneIdx: number,
		answers: { word: string; timestamp: number }[],
		secondsLeft: number
	): string => {
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

		const dateToday = format(new Date(), 'MMM d, yyyy');
		const finishTime = convertSecondsToMinute(MAX_SECONDS - secondsLeft);
		const wordTotal = answers.map((a) => a.word.length).reduce((acc, curr) => acc + curr, 0);

		return `Middles | ${dateToday}\n${createScoreEmojis()}\nI finished in ${finishTime} with ${wordTotal} letters`;
	};

	let {
		showToast = $bindable(),
		isPlaying = $bindable(),
		...props
	}: {
		handleResetGame: () => void;
		wordMilestoneIdx: number;
		timeMilestoneIdx: number;
		answers: { word: string; timestamp: number }[];
		secondsLeft: number;
		showToast: boolean;
		isPlaying: boolean;
	} = $props();

	let showWordScoreBreakdown = $state(false);
	let showTimeScoreBreakdown = $state(false);
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		props.handleResetGame();
		showTimeScoreBreakdown = false;
		showWordScoreBreakdown = false;
	}}
	class="xs:max-w-lg xs:border-r-4 xs:border-l-4 mx-auto mt-32 flex w-full flex-1 flex-col overflow-scroll border-t-4 border-black bg-white font-sans text-2xl font-bold text-black"
>
	<div
		class="sticky top-0 flex h-fit w-full flex-row justify-between border-b-4 border-black bg-white px-8 py-4 text-center"
	>
		{#each { length: WORD_MILESTONES.length - 1 + TIME_MILESTONES.length - 1 }, idx}
			<div class="aspect-square w-1/8 border-4">
				{#if props.wordMilestoneIdx == WORD_MILESTONES.length && props.timeMilestoneIdx == TIME_MILESTONES.length}
					<div class="size-full bg-[#ea5e82]"></div>
				{:else if idx < Math.min(props.wordMilestoneIdx, WORD_MILESTONES.length - 1)}
					<div class="bg-red size-full"></div>
				{:else if idx < Math.min(props.wordMilestoneIdx, WORD_MILESTONES.length - 1) + Math.min(props.timeMilestoneIdx, TIME_MILESTONES.length - 1)}
					<div class="bg-blue size-full"></div>
				{:else}
					<div class="size-full"></div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="flex flex-row">
		<div class="flex w-full flex-col px-8 py-4 text-lg">
			<button
				disabled={props.answers.length == 0}
				onclick={(e) => {
					e.preventDefault();
					showWordScoreBreakdown = !showWordScoreBreakdown;
				}}
				class={`flex flex-row justify-between text-2xl ${props.answers.length > 0 ? 'hover:cursor-pointer' : ''}`}
			>
				<div>WORD SCORE</div>
				<div class="flex flex-row items-center gap-2">
					<div class="text-red font-mono">
						{MILESTONE_TITLES[props.wordMilestoneIdx]}
					</div>
					{#if props.answers.length > 0}
						{#if !showWordScoreBreakdown}
							<Icon icon="oi:chevron-bottom" width="16" height="16" />
						{:else}
							<Icon icon="oi:chevron-top" width="16" height="16" />
						{/if}
					{/if}
				</div>
			</button>

			{#if showWordScoreBreakdown}
				{#each props.answers as answer, idx}
					<div
						class={`flex w-full flex-row justify-between ${
							idx == props.answers.length - 1 ? 'mb-2 border-b-4 border-black pb-2' : ''
						} ${idx == 0 ? 'mt-4' : ''}`}
					>
						<div>{answer.word}</div>
						<div class="text-red font-mono">
							+{String(answer.word.length.toString()).padStart(2, '0')}
						</div>
					</div>
				{/each}
				{#if props.answers.length > 0}
					<div class="flex flex-row justify-between text-2xl">
						<div>TOTAL</div>
						<div class="text-red font-mono">
							{props.answers
								.map((a) => a.word.length)
								.reduce((acc, curr) => acc + curr, 0)
								.toString()}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<div class="flex w-full flex-col border-t-4 border-black px-8 py-4">
		<button
			disabled={props.answers.length == 0}
			class={`w-full ${props.answers.length > 0 ? 'hover:cursor-pointer' : ''}`}
			onclick={(e) => {
				e.preventDefault();
				showTimeScoreBreakdown = !showTimeScoreBreakdown;
			}}
		>
			<div class="flex w-full flex-row justify-between">
				<div>TIME SCORE</div>
				<div class="flex flex-row items-center gap-2">
					<div class="text-blue font-mono">
						{MILESTONE_TITLES[props.timeMilestoneIdx]}
					</div>

					{#if props.answers.length > 0}
						{#if !showTimeScoreBreakdown}
							<Icon icon="oi:chevron-bottom" width="16" height="16" />
						{:else}
							<Icon icon="oi:chevron-top" width="16" height="16" />
						{/if}
					{/if}
				</div>
			</div>
		</button>
		{#if showTimeScoreBreakdown}
			<div class="flex flex-col justify-between text-lg">
				{#each props.answers as answer, idx}
					<div
						class={`flex w-full flex-row justify-between ${
							idx == props.answers.length - 1 ? 'mb-2 border-b-4 border-black pb-2' : ''
						} ${idx == 0 ? 'mt-4' : ''}`}
					>
						<div>{answer.word}</div>
						<div class="text-blue font-mono">
							+{convertSecondsToMinute(
								answer.timestamp - (idx == 0 ? 0 : props.answers[idx - 1].timestamp)
							)}
						</div>
					</div>
				{/each}
			</div>
			<div class="flex flex-row justify-between text-2xl">
				<div>FINISH TIME</div>
				<div class="text-blue font-mono">
					{convertSecondsToMinute(MAX_SECONDS - props.secondsLeft)}
				</div>
			</div>
			<div class="mt-4 grid overflow-clip border-4 border-black text-white">
				<div
					class={`bg-blue border-red col-start-1 row-start-1 h-8 border-r-4`}
					style={`width: ${((MAX_SECONDS - props.secondsLeft) / MAX_SECONDS) * 100 + 0.5}%`}
				></div>

				{#each props.answers as answer}
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
	<div class="flex w-full flex-row">
		<button
			class="w-1/2 border-t-4 border-r-2 border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
			onclick={(e) => {
				e.preventDefault();
				navigator.clipboard.writeText(
					createShareText(
						props.wordMilestoneIdx,
						props.timeMilestoneIdx,
						props.answers,
						props.secondsLeft
					)
				);
				showToast = true;
			}}>share!</button
		>
		<button
			type="submit"
			class="w-1/2 border-t-4 border-b-4 border-l-2 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
			>play again?</button
		>
	</div>
	<div class="flex w-full flex-row">
		<button
			onclick={() => {
				props.handleResetGame();
				showTimeScoreBreakdown = false;
				showWordScoreBreakdown = false;
				isPlaying = false;
			}}
			class="w-full border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
		>
			go home
		</button>
	</div>

	<Countdown />
</form>
