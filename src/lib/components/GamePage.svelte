<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte'
	import { gameMode } from '$lib/stores/gameMode.svelte'
	import { playerData, setLocalPlayerData } from '$lib/stores/playerData.svelte'
	import {
		GAME_WINNING_SCORE,
		getTotalLetterCount,
		MAX_SECONDS,
		resetGameStats,
		type Answer,
		type GameStats,
	} from '$lib/utils/game'
	import { convertSecondsToMinute, isDailyFinished } from '$lib/utils/helper'
	import { Button, cn, Divider, Typography } from 'imbento-box-ui'
	import { onMount } from 'svelte'

	interface GamePageProps {
		gameStats: GameStats
		pairs: string[]
		validationMap: Map<string, Set<string>>
	}

	let {
		gameStats = $bindable(),
		pairs,
		validationMap,
	}: GamePageProps = $props()

	let middleLetters = $state('')
	let middleLettersInputRef: HTMLInputElement | undefined = $state()

	let firstLetter = $derived(pairs[gameStats.pairIdx][0])
	let lastLetter = $derived(pairs[gameStats.pairIdx][1])

	let flicker = $derived(
		gameStats.secondsLeft < 11 && gameStats.secondsLeft % 1 > 0.5
	)

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault()

		const guess = (firstLetter + middleLetters + lastLetter).toLowerCase()
		const timestamp = MAX_SECONDS - gameStats.secondsLeft
		const answer: Answer = {
			word: guess,
			timestamp,
		}

		middleLetters = ''
		middleLettersInputRef?.focus()

		const entry = validationMap.get(pairs[gameStats.pairIdx])
		const isValidGuess = entry !== undefined && entry.has(guess)

		if (!isValidGuess) return

		gameStats.answers.push(answer)
		gameStats.pairIdx++

		const hasWon = gameStats.answers.length === GAME_WINNING_SCORE

		if (gameMode.value === 'daily') {
			playerData.todayAnswers = gameStats.answers
			playerData.todayPairIdx = gameStats.pairIdx
			playerData.todaySecondsLeft = gameStats.secondsLeft

			if (hasWon) {
				const todayFinished = new Date(
					new Date().setHours(0, 0, 0, 0)
				).toISOString()
				playerData.todayFinished = todayFinished

				const wordScore = getTotalLetterCount(
					gameStats.answers.map(a => a.word)
				)
				const timeScore = timestamp

				playerData.todayWordScore = wordScore
				playerData.todayTimeScore = timeScore

				if (wordScore > playerData.wordHighscore)
					playerData.wordHighscore = wordScore
				if (timeScore > playerData.timeHighscore)
					playerData.timeHighscore = timeScore
			}

			setLocalPlayerData(playerData)
		}

		if (hasWon) appState.value = 'success'
	}

	function handleReroll() {
		gameStats.pairIdx++
		gameStats.rerollCount--

		if (gameMode.value === 'daily') {
			playerData.todayPairIdx = gameStats.pairIdx
			playerData.todayRerollCount = gameStats.rerollCount
			playerData.todaySecondsLeft = gameStats.secondsLeft

			setLocalPlayerData(playerData)
		}
	}

	$effect(() => {
		if (gameStats.secondsLeft <= 0) {
			appState.value = 'success'
		}
	})

	onMount(() => {
		resetGameStats(gameStats)
		if (
			gameMode.value === 'daily' &&
			!isDailyFinished(playerData.todayFinished)
		) {
			gameStats.answers = playerData.todayAnswers
			gameStats.secondsLeft = playerData.todaySecondsLeft
			gameStats.pairIdx = playerData.todayPairIdx
			gameStats.rerollCount = playerData.todayRerollCount
		}

		const interval = setInterval(() => {
			gameStats.secondsLeft -= 0.1
		}, 100)

		return () => clearInterval(interval)
	})

	// TODO::Remove onClick as a required class cus' type="submit" can be enough
</script>

<form onsubmit={e => handleSubmit(e)}>
	<div class="flex h-12 flex-row items-center">
		<Typography class="h-full flex-1 bg-blue p-2 font-mono" color="white">
			{`${gameStats.answers.length}/${GAME_WINNING_SCORE}`}
		</Typography>
		<Divider axis="vertical" />
		<Typography
			class="h-full flex-1 bg-red p-2 font-mono"
			color={flicker ? 'black' : 'white'}
		>
			{convertSecondsToMinute(gameStats.secondsLeft)}
		</Typography>
	</div>
	<Divider axis="horizontal" />

	<Typography
		class="my-8 flex flex-row justify-center align-middle font-mono"
		size="lg"
	>
		<div class="align-middle leading-normal text-red">
			{firstLetter.toUpperCase()}
		</div>
		<input
			style={`width: ${Math.max(1, middleLetters.length)}ch;`}
			bind:this={middleLettersInputRef}
			bind:value={middleLetters}
			type="text"
			class="m-0 box-border block rounded-none p-0 text-center align-middle leading-normal uppercase outline-0"
		/>
		<div class="align-middle leading-normal text-blue">
			{lastLetter.toUpperCase()}
		</div>
	</Typography>
	<Divider axis="horizontal" />

	<div class="flex h-12 w-full flex-row">
		<Button
			type="submit"
			class="h-full flex-1 p-2 hover:bg-black hover:**:text-white"
			onClick={() => {}}
		>
			<Typography>submit</Typography>
		</Button>
		<Divider axis="vertical" />
		<Button
			disabled={gameStats.rerollCount === 0}
			class={cn(
				'h-full flex-1 p-2',
				gameStats.rerollCount > 0 && 'hover:bg-black hover:**:text-white'
			)}
			onClick={handleReroll}
		>
			<Typography>
				{gameStats.rerollCount > 0 ? 'reroll' : 'goodluck!'}
			</Typography>
		</Button>
	</div>
	<Divider axis="horizontal" />
</form>
