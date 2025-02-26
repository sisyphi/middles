import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const finishedDaily = writable((browser && localStorage.getItem('finishedDaily')) || 'none');
finishedDaily.subscribe((val) => {
	if (browser) return (localStorage.finishedDaily = val);
});

export const wordHighscore = writable((browser && localStorage.getItem('wordHighscore')) || '0');
wordHighscore.subscribe((val) => {
	if (browser) return (localStorage.wordHighscore = val);
});

export const timeHighscore = writable((browser && localStorage.getItem('timeHighscore')) || '0');
timeHighscore.subscribe((val) => {
	if (browser) return (localStorage.timeHighscore = val);
});
