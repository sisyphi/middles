<script lang="ts">
	import { MIN_TIME_DIFF } from '$lib/constants';

	let today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);

	let tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);

	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);

	setInterval(function () {
		let now = new Date();
		let timeDiff = tomorrow.getTime() - now.getTime();

		hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		if (timeDiff < MIN_TIME_DIFF) {
			today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			today.setMilliseconds(0);

			tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);
		}
	}, 1000);
</script>

<div class="px-8 py-4 text-center text-lg text-[#10141f]">
	next sequence in
	<span class="font-mono">
		{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
	</span>
</div>
