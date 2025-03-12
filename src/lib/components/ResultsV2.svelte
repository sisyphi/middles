<script lang="ts">
	import {
		GAME_WINNING_SCORE,
		MAX_SECONDS,
		TIME_MILESTONES,
		WORD_MILESTONES
	} from '$lib/constants';
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
		isFilming: boolean;
	} = $props();

	let showScoreBreakdown = $state(false);
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		props.handleResetGame();
		showScoreBreakdown = false;
	}}
	class={`mx-auto flex w-full flex-col overflow-scroll border-t-4 border-black bg-white font-sans text-2xl font-bold text-black ${props.isFilming ? 'mt-16 h-[20.5rem] justify-between' : 'xs:max-w-lg xs:border-r-4 xs:border-l-4 mt-32 flex-1'}`}
>
	<div
		class="xs:px-8 xs:py-4 sticky top-0 flex h-fit w-full flex-row justify-between border-b-4 border-black bg-white px-4 py-2 text-center"
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

	<div class="xs:px-8 xs:py-4 flex w-full flex-col border-b-4 border-black p-4">
		<div class="flex flex-col justify-between text-lg">
			{#each { length: GAME_WINNING_SCORE } as _, idx}
				{#if idx < props.answers.length}
					<div
						class={`flex w-full flex-row justify-between ${
							idx == GAME_WINNING_SCORE - 1 ? 'mb-2 border-b-4 border-black pb-2' : ''
						}`}
					>
						<div>{props.answers[idx].word}</div>
						<div class="flex flex-row justify-between gap-4 font-mono">
							<span class="text-red">
								{String(props.answers[idx].word.length.toString()).padStart(2, '0')}
							</span>
							<span class="text-blue">
								+{convertSecondsToMinute(
									props.answers[idx].timestamp - (idx == 0 ? 0 : props.answers[idx - 1].timestamp)
								)}
							</span>
						</div>
					</div>
				{:else}
					<div
						class={`flex w-full flex-row justify-between ${
							idx == GAME_WINNING_SCORE - 1 ? 'mb-2 border-b-4 border-black pb-2' : ''
						}`}
					>
						<div>--</div>
						<div class="flex flex-row justify-between gap-4 font-mono">
							<span class="text-red">00</span>
							<span class="text-blue whitespace-pre-line">&nbsp;--:--</span>
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<div class="flex flex-row justify-between text-2xl">
			<div>FINAL SCORE</div>
			<div class="flex flex-row justify-between gap-4 font-mono">
				<span class="text-red">
					{props.answers
						.map((a) => a.word.length)
						.reduce((acc, curr) => acc + curr, 0)
						.toString()
						.padStart(2, '0')}
				</span>
				<span class="text-blue">
					{convertSecondsToMinute(MAX_SECONDS - props.secondsLeft)}
				</span>
			</div>
		</div>
		{#if !props.isFilming}
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
	{#if !props.isFilming}
		<div class="flex w-full flex-row">
			<button
				class="w-1/2 border-r-2 border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
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
				class="w-1/2 border-b-4 border-l-2 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
				>play again?</button
			>
		</div>
		<div class="flex w-full flex-row">
			<button
				onclick={() => {
					props.handleResetGame();
					showScoreBreakdown = false;

					isPlaying = false;
				}}
				class="w-full border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
			>
				go home
			</button>
		</div>

		<Countdown />
	{/if}
</form>
