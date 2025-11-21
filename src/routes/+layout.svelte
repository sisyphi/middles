<script lang="ts">
	import '../app.css'
	import favicon from '$lib/assets/Logo.svg'
	import {
		Background,
		ContentContainer,
		Header,
		MainContainer,
	} from 'imbento-box-ui'
	import { appState } from '$lib/stores/appState.svelte'
	import FloatingLogo from '$lib/components/FloatingLogo.svelte'
	import { onMount } from 'svelte'
	import { initPlayerData } from '$lib/stores/playerData.svelte'

	let { children } = $props()

	onMount(() => {
		initPlayerData()
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MainContainer>
	<Background pattern="stagDot" color="yellow" animate={false} />
	<Header>
		<button
			onclick={() => {
				appState.value = 'menu'
			}}
			class="flex flex-row content-center items-center justify-center font-mono text-4xl font-bold hover:cursor-pointer"
		>
			<span class="text-5xl text-red">M</span>
			<span>IDDLE</span>
			<span class="text-5xl text-blue">S</span>
		</button>
	</Header>
	<ContentContainer>
		{@render children?.()}
	</ContentContainer>
	<FloatingLogo />
</MainContainer>
