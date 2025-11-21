<script lang="ts">
	import { ORIGIN_DATE } from '$lib/constants'
	import { format } from 'date-fns-tz'
	import { Typography } from 'imbento-box-ui'

	let timeDiff =
		new Date(new Date().setHours(0, 0, 0, 0)).getTime() - ORIGIN_DATE.getTime()
	let dayDiff = Math.round(timeDiff / (1000 * 3600 * 24)) + 1
</script>

<Typography class="px-8 py-4 leading-6" size="sm" weight="bold">
	{`${format(new Date(), 'MMM dd, yyyy')} - Sequence #${dayDiff}`}
	<br />
	by sisyphi
</Typography>
