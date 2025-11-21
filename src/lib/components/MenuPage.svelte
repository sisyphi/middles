<script lang="ts">
	import { appState } from '$lib/stores/AppState.svelte'
	import { convertSecondsToMinute, isDailyFinished } from '$lib/utils/helper'
	import Icon from '@iconify/svelte'
	import { Button, cn, Divider, Typography } from 'imbento-box-ui'
	import { MediaQuery } from 'svelte/reactivity'
	import UntilTom from './UntilTom.svelte'
	import { MAX_SECONDS } from '$lib/utils/game'
	import { playerData } from '$lib/stores/PlayerData.svelte'

	interface MenuPageProps {
		handleDailyClick: () => void
		handleRandomClick: () => void
	}

	let { handleDailyClick, handleRandomClick }: MenuPageProps = $props()

	let showBreakdown = $state(false)

	const isMobile = new MediaQuery('width < 32rem')

	let dailyFinished = $derived(isDailyFinished(playerData.todayFinished))
</script>

<div class="flex flex-col xs:flex-row">
	<Button
		onClick={handleDailyClick}
		class={cn(
			'flex flex-1 flex-row items-center justify-start gap-2 px-8 py-4',
			!dailyFinished && 'hover:bg-red hover:**:text-white',
			dailyFinished && 'bg-white text-black'
		)}
		disabled={dailyFinished}
	>
		{#if dailyFinished}
			<Icon
				class="order-2 size-9 self-center xs:order-1"
				icon="icomoon-free:checkmark"
			/>
		{:else}
			<Icon
				class="order-2 size-9 self-center xs:order-1"
				icon="mdi:calendar-question"
			/>
		{/if}
		<Typography class="order-1 self-center xs:order-2" weight="bold">
			<span class="text-red">daily</span>
			{#if dailyFinished}
				done
			{:else}
				play
			{/if}
		</Typography>
	</Button>
	{#if isMobile.current}
		<Divider axis="horizontal" />
	{:else}
		<Divider axis="vertical" />
	{/if}
	<Button
		onClick={handleRandomClick}
		class={cn(
			'flex flex-1 flex-row items-center justify-start gap-2 px-8 py-4',
			'hover:bg-blue hover:**:text-white'
		)}
	>
		<Icon
			class="order-2 self-center xs:order-1"
			icon="ri:dice-line"
			width="36"
			height="36"
		/>
		<Typography class="order-1 self-center xs:order-2" weight="bold">
			<span class="text-blue">random</span>
			play
		</Typography>
	</Button>
</div>
<Divider axis="horizontal" />

<Button
	onClick={() => {
		appState.value = 'guide'
	}}
	class={cn('px-8 py-4', 'hover:bg-black hover:**:text-white')}
	align="left"
>
	<Typography weight="bold">how to play?</Typography>
</Button>
<Divider axis="horizontal" />

<div class="flex flex-row justify-between px-8 py-4">
	<Typography weight="bold">best score</Typography>
	<Typography weight="bold">
		<span class="font-mono text-red">{playerData.wordHighscore}</span>
		<span>in</span>
		<span class="font-mono text-blue">
			{convertSecondsToMinute(playerData.timeHighscore)}
		</span>
	</Typography>
</div>
<Divider axis="horizontal" />

{#if dailyFinished}
	<div class="px-8 py-4">
		<div class="flex flex-row items-center justify-between">
			<Typography>daily stats</Typography>
			<Button
				onClick={() => {
					showBreakdown = !showBreakdown
				}}
				class="size-8 justify-center self-center hover:bg-black hover:text-white"
				padding="icon"
			>
				{#if !showBreakdown}
					<Icon icon="oi:chevron-bottom" width="16" height="16" />
				{:else}
					<Icon icon="oi:chevron-top" width="16" height="16" />
				{/if}
			</Button>
		</div>
		{#if showBreakdown}
			<Typography class="mt-4 flex flex-col justify-between">
				{#each playerData.todayAnswers as answer, idx}
					<div
						class={cn(
							'flex w-full flex-row justify-between',
							idx === playerData.todayAnswers.length - 1 &&
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
										(idx === 0 ? 0 : playerData.todayAnswers[idx - 1].timestamp)
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
						{playerData.todayAnswers
							.map(a => a.word.length)
							.reduce((acc, curr) => acc + curr, 0)
							.toString()
							.padStart(2, '0')}
					</span>
					<span class="text-blue">
						{convertSecondsToMinute(MAX_SECONDS - playerData.todaySecondsLeft)}
					</span>
				</div>
			</Typography>
			<div class="mt-4 grid overflow-clip border-4 border-black text-white">
				<div
					class={`col-start-1 row-start-1 h-8 border-r-4 border-red bg-blue`}
					style={`width: ${((MAX_SECONDS - playerData.todaySecondsLeft) / MAX_SECONDS) * 100 + 0.5}%`}
				></div>

				{#each playerData.todayAnswers as answer}
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
{/if}

<UntilTom />
