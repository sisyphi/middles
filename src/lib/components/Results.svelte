<script lang="ts">
	import {
		MAX_SECONDS,
		MILESTONE_TITLES,
		MIN_TIME_DIFF,
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
		...props
	}: {
		handleResetGame: (e: SubmitEvent) => void;
		wordMilestoneIdx: number;
		timeMilestoneIdx: number;
		answers: { word: string; timestamp: number }[];
		secondsLeft: number;
		showToast: boolean;
	} = $props();

	let showWordScoreBreakdown = $state(false);
	let showTimeScoreBreakdown = $state(false);
</script>

<form
	onsubmit={(e) => {
		showTimeScoreBreakdown = false;
		showWordScoreBreakdown = false;
		props.handleResetGame(e);
	}}
	class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
>
	<div
		class="flex h-fit w-full flex-row justify-between border-t-4 border-b-4 border-[#10141f] px-8 py-4 text-center"
	>
		{#each { length: WORD_MILESTONES.length - 1 + TIME_MILESTONES.length - 1 }, idx}
			<div class="aspect-square w-1/8 border-4">
				{#if props.wordMilestoneIdx == WORD_MILESTONES.length && props.timeMilestoneIdx == TIME_MILESTONES.length}
					<div class="size-full bg-[#ea5e82]"></div>
				{:else if idx < Math.min(props.wordMilestoneIdx, WORD_MILESTONES.length - 1)}
					<div class="size-full bg-[#cf573c]"></div>
				{:else if idx < Math.min(props.wordMilestoneIdx, WORD_MILESTONES.length - 1) + Math.min(props.timeMilestoneIdx, TIME_MILESTONES.length - 1)}
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
				disabled={props.answers.length == 0}
				onclick={(e) => {
					e.preventDefault();
					showWordScoreBreakdown = !showWordScoreBreakdown;
				}}
				class={`flex flex-row justify-between text-2xl ${props.answers.length > 0 ? 'hover:cursor-pointer' : ''}`}
			>
				<div>WORD SCORE</div>
				<div class="flex flex-row items-center gap-2">
					<div class="font-mono text-[#cf573c]">
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
							idx == props.answers.length - 1 ? 'mb-2 border-b-4 border-[#10141f] pb-2' : ''
						} ${idx == 0 ? 'mt-4' : ''}`}
					>
						<div>{answer.word}</div>
						<div class="font-mono text-[#cf573c]">
							+{String(answer.word.length.toString()).padStart(2, '0')}
						</div>
					</div>
				{/each}
				{#if props.answers.length > 0}
					<div class="flex flex-row justify-between text-2xl">
						<div>TOTAL</div>
						<div class="font-mono text-[#cf573c]">
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

	<div class="flex w-full flex-col border-t-4 border-[#10141f] px-8 py-4">
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
					<div class="font-mono text-[#4f8fba]">
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
							idx == props.answers.length - 1 ? 'mb-2 border-b-4 border-[#10141f] pb-2' : ''
						} ${idx == 0 ? 'mt-4' : ''}`}
					>
						<div>{answer.word}</div>
						<div class="font-mono text-[#4f8fba]">
							+{convertSecondsToMinute(
								answer.timestamp - (idx == 0 ? 0 : props.answers[idx - 1].timestamp)
							)}
						</div>
					</div>
				{/each}
			</div>
			<div class="flex flex-row justify-between text-2xl">
				<div>FINISH TIME</div>
				<div class="font-mono text-[#4f8fba]">
					{convertSecondsToMinute(MAX_SECONDS - props.secondsLeft)}
				</div>
			</div>
			<div class="mt-4 grid overflow-clip border-4 border-[#10141f] text-[#ebede9]">
				<div
					class={`col-start-1 row-start-1 h-8 border-r-4 border-[#cf573c] bg-[#4f8fba]`}
					style={`width: ${((MAX_SECONDS - props.secondsLeft) / MAX_SECONDS) * 100 + 0.5}%`}
				></div>

				{#each props.answers as answer}
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
	</div>
	<div class="flex w-full flex-row">
		<button
			class="w-1/2 border-t-4 border-r-2 border-b-4 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
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
			class="w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
			>play again?</button
		>
	</div>

	<Countdown />
</form>
