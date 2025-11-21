<script lang="ts">
	import Icon from '@iconify/svelte'
	import { convertSecondsToMinute } from '$lib/utils/helper'
	import { format } from 'date-fns-tz'
	import Countdown from './Countdown.svelte'
	import {
		MAX_SECONDS,
		WORD_MILESTONES,
		TIME_MILESTONES,
		MILESTONE_TITLES,
		getScoreIdx,
		getTotalLetterCount,
		type GameStats,
		createShareText,
	} from '$lib/utils/game'
	import { Button, cn, Divider, Typography } from 'imbento-box-ui'

	interface SuccessPageProps {
		gameStats: GameStats
		showToast: boolean
		handlePlayAgainClick: () => void
		handleMenuClick: () => void
	}

	let {
		gameStats,
		showToast = $bindable(),
		handlePlayAgainClick,
		handleMenuClick,
	}: SuccessPageProps = $props()

	let showScoreBreakdown = $state(true)

	let wordScoreIdx = $derived(
		getScoreIdx(
			WORD_MILESTONES,
			getTotalLetterCount(gameStats.answers.map(a => a.word))
		)
	)
	let timeScoreIdx = $derived(
		getScoreIdx(TIME_MILESTONES, gameStats.secondsLeft)
	)

	function handleShareClick() {
		navigator.clipboard.writeText(
			createShareText(
				wordScoreIdx,
				timeScoreIdx,
				gameStats.answers,
				gameStats.secondsLeft
			)
		)
		showToast = true
	}
</script>

<div class="flex flex-col gap-4 bg-white px-4 py-2 text-center xs:px-8 xs:py-4">
	<div class="flex h-fit flex-row justify-between">
		{#each { length: WORD_MILESTONES.length - 1 + TIME_MILESTONES.length - 1 }, idx}
			<div class="aspect-square w-1/8 border-4">
				{#if wordScoreIdx === WORD_MILESTONES.length && timeScoreIdx === TIME_MILESTONES.length}
					<div class="size-full bg-pink"></div>
				{:else if idx < Math.min(wordScoreIdx, WORD_MILESTONES.length - 1)}
					<div class="size-full bg-red"></div>
				{:else if idx < Math.min(wordScoreIdx, WORD_MILESTONES.length - 1) + Math.min(timeScoreIdx, TIME_MILESTONES.length - 1)}
					<div class="size-full bg-blue"></div>
				{:else}
					<div class="size-full"></div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="flex w-full flex-row justify-between">
		<Typography>WORD SCORE</Typography>
		<Typography class="font-mono" color="red">
			{MILESTONE_TITLES[wordScoreIdx]}
		</Typography>
	</div>
	<div class="flex w-full flex-row justify-between">
		<Typography>TIME SCORE</Typography>
		<Typography class="font-mono" color="blue">
			{MILESTONE_TITLES[timeScoreIdx]}
		</Typography>
	</div>
</div>

<Divider axis="horizontal" />

<div class="px-8 py-4">
	<div class="flex flex-row items-center justify-between">
		<Typography>EXTRA STATS</Typography>
		<Button
			onClick={() => {
				showScoreBreakdown = !showScoreBreakdown
			}}
			class="size-8 justify-center self-center hover:bg-black hover:text-white"
			padding="icon"
		>
			{#if !showScoreBreakdown}
				<Icon icon="oi:chevron-bottom" width="16" height="16" />
			{:else}
				<Icon icon="oi:chevron-top" width="16" height="16" />
			{/if}
		</Button>
	</div>
	{#if showScoreBreakdown}
		<Typography class="mt-4 flex flex-col justify-between">
			{#each gameStats.answers as answer, idx}
				<div
					class={cn(
						'flex w-full flex-row justify-between',
						idx === gameStats.answers.length - 1 &&
							'mb-2 border-b-4 border-black pb-2'
					)}
				>
					<div>{answer.word}</div>
					<div class="flex flex-row justify-between gap-4 font-mono">
						<span class="text-red">
							{String(answer.word.length.toString()).padStart(2, '0')}
						</span>
						<span class="text-blue">
							+{convertSecondsToMinute(
								answer.timestamp -
									(idx === 0 ? 0 : gameStats.answers[idx - 1].timestamp)
							)}
						</span>
					</div>
				</div>
			{/each}
		</Typography>
		<Typography class="flex flex-row justify-between">
			<div>FINAL SCORE</div>
			<div class="flex flex-row justify-between gap-4 font-mono">
				<span class="text-red">
					{gameStats.answers
						.map(a => a.word.length)
						.reduce((acc, curr) => acc + curr, 0)
						.toString()
						.padStart(2, '0')}
				</span>
				<span class="text-blue">
					{convertSecondsToMinute(MAX_SECONDS - gameStats.secondsLeft)}
				</span>
			</div>
		</Typography>
		<div class="mt-4 grid overflow-clip border-4 border-black text-white">
			<div
				class={`col-start-1 row-start-1 h-8 border-r-4 border-red bg-blue`}
				style={`width: ${((MAX_SECONDS - gameStats.secondsLeft) / MAX_SECONDS) * 100 + 0.5}%`}
			></div>

			{#each gameStats.answers as answer}
				<div
					class="col-start-1 row-start-1 h-full border-r-4 border-red"
					style={`width:  ${(answer.timestamp / MAX_SECONDS) * 100 + 0.5}%;`}
				></div>
			{/each}
			{#each { length: MAX_SECONDS / 5 + 1 }, idx}
				{#if idx != 0 && idx != MAX_SECONDS / 5}
					<div
						class={`col-start-1 row-start-1 -mt-0.5 border-r-4 border-black ${idx % 2 === 0 ? 'h-4' : 'h-2'}`}
						style={`width: ${(idx / (MAX_SECONDS / 5)) * 100 + 0.5}%`}
					></div>
				{/if}
			{/each}
		</div>
		<div class="text-xs text-black">* each tick represents 5 seconds</div>
	{/if}
</div>
<Divider axis="horizontal" />

<div class="flex h-12 flex-row">
	<Button
		class="flex-1 p-2 hover:bg-black hover:**:text-white"
		onClick={handleShareClick}
	>
		<Typography>share!</Typography>
	</Button>
	<Divider axis="vertical" />
	<Button
		onClick={handlePlayAgainClick}
		class="flex-1 p-2 hover:bg-black hover:**:text-white"
	>
		<Typography>play again?</Typography>
	</Button>
</div>
<Divider axis="horizontal" />

<Button
	onClick={handleMenuClick}
	class="p-2 hover:bg-black hover:**:text-white"
>
	<Typography>go home</Typography>
</Button>
<Divider axis="horizontal" />

<Countdown />
