import type { MatchRecord } from '../types';

const HISTORY_KEY = 'scoreboard_history_v1';
const MAX_MATCHES = 200;

export const loadHistory = (): MatchRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading match history:', e);
    return [];
  }
};

export const saveHistory = (history: MatchRecord[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_MATCHES)));
  } catch (e) {
    console.error('Error saving match history:', e);
  }
};

export const recordScore = (record: MatchRecord) => ({
  home: record.periodScores.reduce((sum, p) => sum + (p?.home || 0), 0),
  away: record.periodScores.reduce((sum, p) => sum + (p?.away || 0), 0),
});
