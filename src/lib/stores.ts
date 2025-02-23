import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const finishedDaily = writable((browser && localStorage.getItem('finishedDaily')) || 'none');
finishedDaily.subscribe((val) => {
	if (browser) return (localStorage.finishedDaily = val);
});
