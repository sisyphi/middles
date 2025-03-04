<script lang="ts">
	import Icon from '@iconify/svelte';

	let { showToast = $bindable(), ...props }: { showToast: boolean } = $props();
</script>

<div
	class="text-sans absolute bottom-5 left-1/2 flex h-16 w-fit -translate-x-1/2 flex-row items-center justify-between gap-2 border-4 border-black bg-white px-4 py-2 text-2xl font-bold text-black"
>
	<div>copied to clipboard!</div>
	<button
		class="flex size-8 justify-center align-middle hover:bg-black hover:text-white"
		onclick={() => {
			showToast = false;
		}}
	>
		<Icon class="self-center" icon="icomoon-free:cross" width="16" height="16" />
	</button>
</div>
