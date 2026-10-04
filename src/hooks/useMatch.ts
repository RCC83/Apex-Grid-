import { useEffect, useRef, useState } from 'react';
import type { MatchEvent, Page, PeriodScore, Team } from '../types';
import { loadSavedState, saveState, type SavedAppState } from '../lib/storage';
import { formatEventMinute, teamLabel } from '../lib/periods';

interface UndoEntry {
  label: string;
  periodScores: PeriodScore[];
  events: MatchEvent[];
}

const MAX_UNDO = 30;

const newEventId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyScores = (count: number): PeriodScore[] =>
  Array.from({ length: count }, () => ({ home: 0, away: 0 }));

export function useMatch() {
  const initialData = useRef<SavedAppState>(loadSavedState()).current;

  const [currentPage, setCurrentPage] = useState<Page>(initialData.currentPage || 'home');
  const [theme, setTheme] = useState<'dark' | 'light'>(initialData.theme || 'dark');
  const [homeTeamName, setHomeTeamName] = useState(initialData.homeTeamName ?? '');
  const [awayTeamName, setAwayTeamName] = useState(initialData.awayTeamName ?? '');

  // Calculate restored seconds (taking elapsed background time into account if it was running)
  const calculateRestoredSeconds = () => {
    if (typeof initialData.seconds !== 'number') return 0;
    if (initialData.isActive && initialData.lastActiveTimestamp) {
      const elapsedSinceClose = Math.floor((Date.now() - initialData.lastActiveTimestamp) / 1000);
      const totalSec = Math.max(1, initialData.periodCount || 2) * Math.max(1, initialData.periodDuration || 45) * 60;
      return Math.min(totalSec, initialData.seconds + Math.max(0, elapsedSinceClose));
    }
    return initialData.seconds;
  };

  const [seconds, setSeconds] = useState<number>(calculateRestoredSeconds);
  const [isActive, setIsActive] = useState<boolean>(false); // Start paused upon reopen for safety
  const [periodCount, setPeriodCount] = useState<number>(initialData.periodCount ?? 2);
  const [periodDuration, setPeriodDuration] = useState<number>(initialData.periodDuration ?? 45);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(initialData.isMatchFinished ?? false);

  const totalPeriods = Math.max(1, periodCount);
  const periodDurationSeconds = Math.max(1, periodDuration) * 60;
  const currentPeriodIndex = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDurationSeconds)));

  const [periodScores, setPeriodScores] = useState<PeriodScore[]>(() => {
    if (Array.isArray(initialData.periodScores) && initialData.periodScores.length > 0) {
      return initialData.periodScores;
    }
    return emptyScores(2);
  });

  const [events, setEvents] = useState<MatchEvent[]>(() =>
    Array.isArray(initialData.events) ? initialData.events : []
  );
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);

  // Automatically persist all state changes to localStorage
  useEffect(() => {
    saveState({
      currentPage,
      theme,
      homeTeamName,
      awayTeamName,
      seconds,
      isActive,
      lastActiveTimestamp: isActive ? Date.now() : undefined,
      periodCount,
      periodDuration,
      isMatchFinished,
      periodScores,
      events,
    });
  }, [currentPage, theme, homeTeamName, awayTeamName, seconds, isActive, periodCount, periodDuration, isMatchFinished, periodScores, events]);

  useEffect(() => {
    setPeriodScores((prev) => {
      if (prev.length === totalPeriods) return prev;
      const next = [...prev];
      if (next.length < totalPeriods) {
        while (next.length < totalPeriods) {
          next.push({ home: 0, away: 0 });
        }
      } else {
        next.length = totalPeriods;
      }
      return next;
    });
    setEvents((prev) => (prev.some((e) => e.periodIndex >= totalPeriods) ? prev.filter((e) => e.periodIndex < totalPeriods) : prev));
  }, [totalPeriods]);

  const homeScore = periodScores.reduce((sum, p) => sum + (p?.home || 0), 0);
  const awayScore = periodScores.reduce((sum, p) => sum + (p?.away || 0), 0);

  const teamName = (team: Team) =>
    team === 'home' ? teamLabel(homeTeamName, 'Domicile') : teamLabel(awayTeamName, 'Extérieur');

  const eventMinute = (event: MatchEvent) => formatEventMinute(event.second, event.periodIndex, periodDuration);

  // --- Score, fil du match & annulation ---

  /** Mémorise l'état actuel avant une action, pour pouvoir l'annuler. */
  const commit = (label: string, nextScores: PeriodScore[], nextEvents: MatchEvent[]) => {
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO - 1)), { label, periodScores, events }]);
    setPeriodScores(nextScores);
    setEvents(nextEvents);
  };

  const normalizedScores = () => {
    const next = [...periodScores];
    while (next.length < totalPeriods) next.push({ home: 0, away: 0 });
    return next.map((p) => p ?? { home: 0, away: 0 });
  };

  const addGoal = (team: Team) => {
    const idx = currentPeriodIndex;
    const next = normalizedScores();
    next[idx] = { ...next[idx], [team]: (next[idx][team] || 0) + 1 };
    const event: MatchEvent = { id: newEventId(), team, periodIndex: idx, second: seconds };
    commit(`But ${teamName(team)} ${eventMinute(event)}`, next, [...events, event]);
  };

  const removeGoal = (team: Team) => {
    const next = normalizedScores();
    // Retire le but de la période en cours, ou à défaut de la dernière période où l'équipe a marqué
    let target = -1;
    for (let i = currentPeriodIndex; i >= 0; i--) {
      if ((next[i]?.[team] || 0) > 0) {
        target = i;
        break;
      }
    }
    if (target < 0) return;
    next[target] = { ...next[target], [team]: next[target][team] - 1 };

    let lastIdx = -1;
    events.forEach((e, i) => {
      if (e.team === team && e.periodIndex === target) lastIdx = i;
    });
    commit(`Retrait but ${teamName(team)}`, next, events.filter((_, i) => i !== lastIdx));
  };

  const setEventScorer = (id: string, scorer: string) => {
    const clean = scorer.trim();
    const event = events.find((e) => e.id === id);
    if (!event || (event.scorer ?? '') === clean) return;
    commit(
      clean ? `Buteur ${clean}` : 'Buteur effacé',
      periodScores,
      events.map((e) => (e.id === id ? { ...e, scorer: clean || undefined } : e))
    );
  };

  const deleteEvent = (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const next = normalizedScores();
    const p = next[event.periodIndex];
    if (p) next[event.periodIndex] = { ...p, [event.team]: Math.max(0, p[event.team] - 1) };
    commit(`Suppression but ${teamName(event.team)} ${eventMinute(event)}`, next, events.filter((e) => e.id !== id));
  };

  const undo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setPeriodScores(last.periodScores);
    setEvents(last.events);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const lastActionLabel = undoStack[undoStack.length - 1]?.label ?? null;

  /** Noms de buteurs déjà saisis pour une équipe, du plus récent au plus ancien. */
  const knownScorers = (team: Team) => {
    const names: string[] = [];
    for (let i = events.length - 1; i >= 0; i--) {
      const s = events[i].scorer;
      if (events[i].team === team && s && !names.includes(s)) names.push(s);
    }
    return names;
  };

  // --- Thème ---

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // --- Chronomètre ---

  const timerRef = useRef<{ startTime: number; baseSeconds: number } | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      timerRef.current = {
        startTime: Date.now(),
        baseSeconds: seconds,
      };

      interval = setInterval(() => {
        if (timerRef.current) {
          const elapsed = Math.floor((Date.now() - timerRef.current.startTime) / 1000);
          const currentTotal = timerRef.current.baseSeconds + elapsed;

          const currentIdx = Math.min(totalPeriods - 1, Math.max(0, Math.floor(timerRef.current.baseSeconds / periodDurationSeconds)));
          const periodEndSec = (currentIdx + 1) * periodDurationSeconds;

          // Auto-pause if reaching end of period from before
          if (timerRef.current.baseSeconds < periodEndSec && currentTotal >= periodEndSec) {
            setSeconds(periodEndSec);
            setIsActive(false);
          } else {
            setSeconds(currentTotal);
          }
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isActive, periodDurationSeconds, totalPeriods]);

  const updateSeconds = (newSeconds: number | ((prev: number) => number)) => {
    setSeconds((prev) => {
      const val = typeof newSeconds === 'function' ? newSeconds(prev) : newSeconds;
      const cleanVal = Math.max(0, val);
      if (timerRef.current) {
        timerRef.current.baseSeconds = cleanVal;
        timerRef.current.startTime = Date.now();
      }
      return cleanVal;
    });
  };

  const selectPeriod = (targetIndex: number) => {
    const cleanIndex = Math.max(0, Math.min(totalPeriods - 1, targetIndex));
    setIsActive(false);
    updateSeconds(cleanIndex * periodDurationSeconds);
  };

  // --- Cycle de vie du match ---

  const endMatch = () => {
    setIsActive(false);
    setIsMatchFinished(true);
    setCurrentPage('home');
  };

  const clearAll = () => {
    setPeriodScores(emptyScores(totalPeriods));
    setEvents([]);
    setUndoStack([]);
    setSeconds(0);
    setIsActive(false);
    setIsMatchFinished(false);
    setHomeTeamName('');
    setAwayTeamName('');
  };

  return {
    currentPage, setCurrentPage,
    theme, setTheme,
    homeTeamName, setHomeTeamName,
    awayTeamName, setAwayTeamName,
    seconds, setSeconds: updateSeconds,
    isActive, setIsActive,
    periodCount, setPeriodCount,
    periodDuration, setPeriodDuration,
    isMatchFinished,
    totalPeriods, currentPeriodIndex,
    periodScores, homeScore, awayScore,
    events, eventMinute, teamName, knownScorers,
    addGoal, removeGoal, setEventScorer, deleteEvent,
    undo, lastActionLabel,
    selectPeriod, endMatch, clearAll,
  };
}

export type Match = ReturnType<typeof useMatch>;
