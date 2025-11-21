<script lang="ts">
	import { Button, Divider } from 'imbento-box-ui'
	import type { PageProps } from '../init/$types'
	import { convertMapToJsonStr, downloadTxt } from '$lib/utils/file'

	let { data }: PageProps = $props()
</script>

<Button onClick={() => downloadTxt(data.pairs, 'pairs')}>Download Pairs</Button>
<Divider axis="horizontal" />

<Button
	onClick={() => downloadTxt(convertMapToJsonStr(data.pairMap), 'pairMap')}
>
	Download Pair Map
</Button>
<Divider axis="horizontal" />

<Button onClick={() => downloadTxt(data.dailySeq, 'dailySeq')}>
	Download Daily Sequence
</Button>
<Divider axis="horizontal" />

<Button onClick={() => downloadTxt(data.validPairs, 'validPairs')}>
	Download Valid Pairs
</Button>
<Divider axis="horizontal" />
