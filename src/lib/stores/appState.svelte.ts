export type AppState = 'menu' | 'game' | 'success' | 'guide'
export let appState: { value: AppState } = $state({ value: 'menu' })
