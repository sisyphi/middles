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
	class="mx-auto mt-32 flex w-full max-w-lg flex-1 flex-col items-center border-r-4 border-l-4 border-[#10141f] bg-[#ebede9] font-sans text-2xl font-bold text-[#10141f]"
>
	<div class="flex w-full flex-row items-center">
		<div
			class=" w-1/2 border-t-4 border-r-2 border-b-4 border-[#10141f] bg-[#cf573c] p-2 text-center font-mono font-bold text-[#ebede9]"
		>
			{`${props.score}/${GAME_WINNING_SCORE}`}
		</div>
		<div
			class={`w-1/2 border-t-4 border-b-4 border-l-2 border-[#10141f] bg-[#4f8fba] p-2 text-center font-mono font-bold ${props.secondsLeft > 11 ? 'text-[#ebede9]' : props.secondsLeft - Math.floor(props.secondsLeft) < 0.5 ? 'text-[#10141f]' : 'text-[#ebede9]'}`}
		>
			{convertSecondsToMinute(props.secondsLeft)}
		</div>
	</div>

	<div class="my-8 flex flex-row justify-center align-middle font-mono text-4xl">
		<div class="align-middle leading-normal text-[#cf573c]">
			{props.chosenLetterPairData.firstLetter}
		</div>
		<input
			style={`width: ${Math.max(1, middleLetters.length)}ch;`}
			bind:this={middleLettersInputRef}
			bind:value={middleLetters}
			type="text"
			class="text-side-adjust-full m-0 box-border block rounded-none border-0 bg-amber-500 p-0 text-center align-middle leading-normal uppercase outline-0 outline-0"
		/>
		<div class="align-middle leading-normal text-[#4f8fba]">
			{props.chosenLetterPairData.lastLetter}
		</div>
	</div>

	<div class="flex w-full flex-row">
		<button
			type="submit"
			class="w-1/2 border-t-4 border-b-4 border-[#10141f] p-2 hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]"
		>
			submit
		</button>
		<button
			disabled={props.rerollCount == 0}
			class={`w-1/2 border-t-4 border-b-4 border-l-4 border-[#10141f] p-2 ${props.rerollCount > 0 ? 'hover:cursor-pointer hover:bg-[#10141f] hover:text-[#ebede9]' : 'hover:cursor-not-allowed'}`}
			onclick={props.handleReroll}
		>
			<div class={`${props.rerollCount > 0 ? '' : 'bg-[#ebede9]'}`}>
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

	.text-side-adjust-full {
		-webkit-text-size-adjust: 100%;
		caret-color: transparent;
	}
</style>
