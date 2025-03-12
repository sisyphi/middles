<script lang="ts">
	import { GAME_WINNING_SCORE } from '$lib/constants';
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
			pair: {
				firstLetter: string;
				lastLetter: string;
			};
			count: number;
			words: string[];
		};
		middleLettersInputRef: HTMLInputElement | undefined;
		middleLetters: string;
		rerollCount: number;
		handleReroll: () => void;
		isFilming: boolean;
		answers: { word: string; timestamp: number }[];
	} = $props();
</script>

<form
	onsubmit={props.handleSubmit}
	class={`mx-auto flex w-full flex-col items-center border-black bg-white font-sans text-2xl font-bold text-black ${props.isFilming ? 'mt-16 h-[20.5rem] justify-between' : 'xs:max-w-lg xs:border-r-4 xs:border-l-4 mt-32 flex-1'}`}
>
	<div class="flex w-full flex-row items-center">
		<div
			class={`bg-blue w-1/2 border-t-4 border-r-2 border-b-4 border-black p-2 text-center font-mono font-bold text-white ${props.isFilming ? 'py-4 text-3xl' : 'text-2xl'}`}
		>
			{`+${middleLetters.length + 2} | ${props.answers.map((a) => a.word.length).reduce((acc, curr) => acc + curr, 0)}`}
		</div>
		<div
			class={`bg-red w-1/2 border-t-4 border-b-4 border-l-2 border-black p-2 text-center font-mono font-bold ${props.isFilming ? 'py-4 text-3xl' : 'text-2xl'} ${props.secondsLeft > 11 ? 'text-white' : props.secondsLeft - Math.floor(props.secondsLeft) < 0.5 ? 'text-black' : 'text-white'}`}
		>
			{convertSecondsToMinute(props.secondsLeft)}
		</div>
	</div>

	<div class={`grid w-full ${props.isFilming ? 'h-fit flex-1' : 'h-52'}`}>
		<div
			class="relative z-10 col-start-1 row-start-1 flex flex-row justify-center self-center font-mono text-[10rem] leading-0 text-black opacity-10"
		>
			{GAME_WINNING_SCORE - props.answers.length}
		</div>
		<div
			class="relative z-20 col-start-1 row-start-1 flex w-full flex-row justify-center align-middle font-mono text-4xl"
		>
			<div class="text-red self-center align-middle leading-normal">
				{props.chosenLetterPairData.pair.firstLetter}
			</div>
			<input
				style={`width: ${Math.max(1, middleLetters.length)}ch;`}
				bind:this={middleLettersInputRef}
				bind:value={middleLetters}
				type="text"
				class="m-0 box-border block rounded-none border-0 p-0 text-center align-middle leading-normal uppercase outline-0"
			/>
			<div class="text-blue self-center align-middle leading-normal">
				{props.chosenLetterPairData.pair.lastLetter}
			</div>
		</div>
	</div>

	<div class="flex w-full flex-row">
		<button
			type="submit"
			class={`w-1/2 border-t-4 border-b-4 border-black p-2 hover:cursor-pointer hover:bg-black hover:text-white ${props.isFilming ? 'py-4 text-3xl' : 'text-2xl'}`}
		>
			submit
		</button>
		<button
			disabled={props.rerollCount == 0}
			class={`w-1/2 border-t-4 border-b-4 border-l-4 border-black p-2 ${props.rerollCount > 0 ? 'hover:cursor-pointer hover:bg-black hover:text-white' : 'hover:cursor-not-allowed'} ${props.isFilming ? 'py-4 text-3xl' : 'text-2xl'}`}
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
