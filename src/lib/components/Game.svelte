<script lang="ts">
	import { GAME_WINNING_SCORE, MAX_REROLL_COUNT } from '$lib/constants';
	import { convertSecondsToMinute } from '$lib/utils';

	let {
		middleLetters = $bindable(),
		middleLettersInputRef = $bindable(),
		...props
	}: {
		handleSubmit: (e: SubmitEvent) => void;
		score: number;
		secondsLeft: number;
		chosenLetterPairData: {
			firstLetter: string;
			lastLetter: string;
			count: number;
			words: string[];
		};
		middleLettersInputRef: HTMLInputElement | undefined;
		middleLetters: string;
		rerollCount: number;
		handleReroll: () => void;
	} = $props();
</script>

<form
	onsubmit={props.handleSubmit}
	class="xs:max-w-lg xs:border-r-4 xs:border-l-4 mx-auto mt-32 flex w-full flex-1 flex-col items-center border-black bg-white font-sans text-2xl font-bold text-black"
>
	<div class="flex w-full flex-row items-center">
		<div
			class=" bg-blue w-1/2 border-t-4 border-r-2 border-b-4 border-black p-2 text-center font-mono font-bold text-white"
		>
			{`${props.score}/${GAME_WINNING_SCORE}`}
		</div>
		<div
			class={`bg-red w-1/2 border-t-4 border-b-4 border-l-2 border-black p-2 text-center font-mono font-bold ${props.secondsLeft > 11 ? 'text-white' : props.secondsLeft - Math.floor(props.secondsLeft) < 0.5 ? 'text-black' : 'text-white'}`}
		>
			{convertSecondsToMinute(props.secondsLeft)}
		</div>
	</div>

	<div class="my-8 flex flex-row justify-center align-middle font-mono text-4xl">
		<div class="text-red align-middle leading-normal">
			{props.chosenLetterPairData.firstLetter}
		</div>
		<input
			style={`width: ${Math.max(1, middleLetters.length)}ch;`}
			bind:this={middleLettersInputRef}
			bind:value={middleLetters}
			type="text"
			class="m-0 box-border block rounded-none border-0 p-0 text-center align-middle leading-normal uppercase outline-0"
		/>
		<div class="text-blue align-middle leading-normal">
			{props.chosenLetterPairData.lastLetter}
		</div>
	</div>

	<div class="flex w-full flex-row">
		<button
			type="submit"
			class="w-1/2 border-t-4 border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white"
		>
			submit
		</button>
		<button
			disabled={props.rerollCount == 0}
			class={`w-1/2 border-t-4 border-b-4 border-l-4 border-black p-2 ${props.rerollCount > 0 ? 'hover:cursor-pointer hover:bg-black hover:text-white' : 'hover:cursor-not-allowed'}`}
			onclick={props.handleReroll}
		>
			<div class={`${props.rerollCount > 0 ? '' : 'bg-white'}`}>
				{props.rerollCount > 0 ? 'reroll' : 'goodluck!'}
			</div>
		</button>
	</div>
</form>

<style>
	.bg-diagonal-small {
		opacity: 1;
		background: repeating-linear-gradient(45deg, #10141f, #10141f 8px, #ebede9 8px, #ebede9 24px);
	}
</style>
