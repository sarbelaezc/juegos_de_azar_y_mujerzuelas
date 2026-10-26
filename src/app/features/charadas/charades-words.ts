import wordBank from './charades-words.json';

export type CharadesDifficulty = 'facil' | 'intermedio' | 'dificil';

export const CHARADES_WORDS: Record<CharadesDifficulty, readonly string[]> = wordBank;
