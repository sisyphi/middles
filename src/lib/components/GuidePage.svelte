<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte'
	import { GAME_WINNING_SCORE, MAX_SECONDS } from '$lib/utils/game'
	import { convertSecondsToMinute } from '$lib/utils/helper'
	import Icon from '@iconify/svelte'
	import { Button, Divider, Typography } from 'imbento-box-ui'
	import Typewriter from 'svelte-typewriter'
</script>

<div class="sticky top-0 flex flex-col bg-white">
	<div class="flex flex-row items-center justify-between px-8 py-4">
		<Typography>how to play?</Typography>
		<Button
			class="flex size-8 flex-row justify-center self-center hover:bg-black hover:text-white"
			onClick={() => {
				appState.value = 'menu'
			}}
			padding="icon"
		>
			<Icon
				class="self-center"
				icon="icomoon-free:cross"
				width="16"
				height="16"
			/>
		</Button>
	</div>
	<Divider axis="horizontal" />
</div>

<Typography>
	<ul class="ml-4 flex list-disc flex-col gap-12 px-8 py-4 text-left text-lg">
		<li class="">
			<div>
				With the <span class="text-red">FIRST</span>
				and <span class="text-blue">LAST</span> letter, fill in the MIDDLE to form
				a word.
			</div>
			<div class="flex w-full flex-row justify-center font-mono text-4xl">
				<span class="text-red">A</span>
				<Typewriter interval={100} mode={'loop'} cursor={false} delay={500}>
					<span>NCHO</span>
					<span>UTHORIZE</span>
					<span>VATA</span>
					<span>MBASSADO</span>
				</Typewriter>
				<span class="text-blue">R</span>
			</div>
		</li>
		<li>
			<div>
				Remember, you DON'T need to type the <span class="text-red">FIRST</span>
				and
				<span class="text-blue">LAST</span> letters.
			</div>
			<div
				class="mx-auto flex flex-col content-center gap-2 font-mono text-4xl xs:max-w-2/3"
			>
				<div class="flex w-full flex-row justify-between self-center">
					<div class="flex w-2/3 flex-row justify-center">
						<span class="text-red">L</span>
						<Typewriter interval={100} mode={'loop'} cursor={false} delay={500}>
							<span>LAST</span>
							<span>LINGUIST</span>
						</Typewriter>
						<span class="text-blue">T</span>
					</div>
					<Icon
						class="w-1/3 self-center text-red"
						icon="icomoon-free:cross"
						width="36"
						height="36"
					/>
				</div>
				<div class="flex w-full flex-row justify-between self-center">
					<div class="flex w-2/3 flex-row justify-center">
						<span class="text-red">L</span>
						<Typewriter interval={100} mode={'loop'} cursor={false} delay={500}>
							<span>OCKE</span>
							<span>IEUTENAN</span>
						</Typewriter>
						<span class="text-blue">T</span>
					</div>
					<Icon
						class="w-1/3 self-center text-blue"
						icon="icomoon-free:checkmark"
						width="48"
						height="48"
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
					class="h-fit w-1/3 self-center border-4 border-black p-2 text-center hover:cursor-pointer hover:bg-black hover:text-white"
				>
					submit
				</div>
			</div>
		</li>
		<li>
			<div class="mb-2">
				Get {GAME_WINNING_SCORE} CORRECT ANSWERS before the TIME runs out.
			</div>
			<div class="flex w-full flex-row items-center border-4 border-black">
				<div
					class=" w-1/2 bg-red p-2 text-center font-mono font-bold text-white"
				>
					{`0/${GAME_WINNING_SCORE}`}
				</div>
				<div
					class={`w-1/2 border-l-4 border-black bg-blue p-2 text-center font-mono font-bold text-white`}
				>
					{convertSecondsToMinute(MAX_SECONDS)}
				</div>
			</div>
		</li>
		<li>Longer words and faster times gets you higher scores.</li>
	</ul>
</Typography>
