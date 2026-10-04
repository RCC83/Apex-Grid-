import type { MatchEvent, Page, PeriodScore } from '../types';

const STORAGE_KEY = 'scoreboard_app_state_v1';

export interface SavedAppState {
  currentPage?: Page;
  theme?: 'dark' | 'light';
  homeTeamName?: string;
  awayTeamName?: string;
  seconds?: number;
  isActive?: boolean;
  lastActiveTimestamp?: number;
  periodCount?: number;
  periodDuration?: number;
  isMatchFinished?: boolean;
  periodScores?: PeriodScore[];
  events?: MatchEvent[];
}

export const loadSavedState = (): SavedAppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SavedAppState;
  } catch (e) {
    console.error('Error loading saved state from localStorage:', e);
    return {};
  }
};

export const saveState = (state: SavedAppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
};
