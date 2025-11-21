<script lang="ts">
	import type { PageProps } from './$types'
	import GamePage from '$lib/components/GamePage.svelte'
	import CopiedToast from '$lib/components/CopiedToast.svelte'
	import SuccessPage from '$lib/components/SuccessPage.svelte'
	import { gameMode } from '$lib/stores/gameMode.svelte'
	import GuidePage from '$lib/components/GuidePage.svelte'
	import { appState } from '$lib/stores/appState.svelte'
	import MenuPage from '$lib/components/MenuPage.svelte'
	import {
		createRandomPairs,
		EMPTY_GAME_STATS,
		type GameStats,
	} from '$lib/utils/game'

	let { data }: PageProps = $props()

	const { validationMap, validPairs, dailyPairs } = data

	let gameStats: GameStats = $state(EMPTY_GAME_STATS)
	let randPairs: string[] = $state(createRandomPairs(validPairs))
	let currPairs: string[] = $derived(
		gameMode.value === 'daily' ? dailyPairs : randPairs
	)

	let showToast = $state(false)

	function handleDailyClick() {
		gameMode.value = 'daily'
		appState.value = 'game'
	}

	function handleRandomClick() {
		randPairs = createRandomPairs(validPairs)
		gameMode.value = 'random'
		appState.value = 'game'
	}

	function handlePlayAgainClick() {
		appState.value = 'game'
	}

	function handleMenuClick() {
		appState.value = 'menu'
	}
</script>

{#if appState.value === 'menu'}
	<MenuPage {handleDailyClick} {handleRandomClick} />
{:else if appState.value === 'guide'}
	<GuidePage />
{:else if appState.value === 'game'}
	<GamePage bind:gameStats pairs={currPairs} {validationMap} />
{:else if appState.value === 'success'}
	<SuccessPage
		{gameStats}
		bind:showToast
		{handlePlayAgainClick}
		{handleMenuClick}
	/>
{/if}

{#if showToast}
	<CopiedToast bind:showToast />
{/if}
