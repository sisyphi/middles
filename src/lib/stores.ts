import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { MAX_SECONDS } from './constants';

export const todayFinished = writable((browser && localStorage.getItem('todayFinished')) || 'none');
todayFinished.subscribe((val) => {
	if (browser) return (localStorage.todayFinished = val);
});

export const todayAnswers = writable((browser && localStorage.getItem('todayAnswers')) || 'none');
todayAnswers.subscribe((val) => {
	if (browser) return (localStorage.todayAnswers = val);
});

export const todaySecondsLeft = writable(
	(browser && localStorage.getItem('todaySecondsLeft')) || MAX_SECONDS.toString()
);
todaySecondsLeft.subscribe((val) => {
	if (browser) return (localStorage.todaySecondsLeft = val);
});

export const wordHighscore = writable((browser && localStorage.getItem('wordHighscore')) || '0');
wordHighscore.subscribe((val) => {
	if (browser) return (localStorage.wordHighscore = val);
});

export const timeHighscore = writable((browser && localStorage.getItem('timeHighscore')) || '0');
timeHighscore.subscribe((val) => {
	if (browser) return (localStorage.timeHighscore = val);
});
