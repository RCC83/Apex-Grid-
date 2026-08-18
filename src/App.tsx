/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Flag, 
  Home, 
  Timer, 
  Trophy,
  ChevronRight,
  Shield,
  Edit2,
  Check,
  X,
  ChevronLeft,
  Sun,
  Moon,
  Share2,
  ListOrdered,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'home' | 'live';

export interface PeriodScore {
  home: number;
  away: number;
}

export const getPeriodName = (index: number, totalPeriods: number = 2) => {
  const safeIndex = Math.max(0, index || 0);
  const safeTotal = Math.max(1, totalPeriods || 2);
  if (safeTotal === 2) {
    return safeIndex === 0 ? '1ère Mi-temps' : '2ème Mi-temps';
  } else if (safeTotal === 3) {
    return `${safeIndex + 1}${safeIndex === 0 ? 'er' : 'ème'} Tiers`;
  } else if (safeTotal === 4) {
    return `${safeIndex + 1}${safeIndex === 0 ? 'er' : 'ème'} Quart-temps`;
  } else {
    return `Période ${safeIndex + 1}`;
  }
};

export const getPeriodShortName = (index: number, totalPeriods: number = 2) => {
  const safeIndex = Math.max(0, index || 0);
  const safeTotal = Math.max(1, totalPeriods || 2);
  if (safeTotal === 2) {
    return safeIndex === 0 ? '1MT' : '2MT';
  } else if (safeTotal === 3) {
    return `T${safeIndex + 1}`;
  } else if (safeTotal === 4) {
    return `Q${safeIndex + 1}`;
  } else {
    return `P${safeIndex + 1}`;
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-[#81ecff] mb-4 animate-bounce" />
          <h2 className="text-xl font-bold mb-2 font-headline uppercase tracking-wider">ScoreBoard Live</h2>
          <p className="text-sm text-zinc-400 mb-6">Une erreur d'affichage est survenue.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-[#81ecff] text-[#003840] font-black rounded-xl uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
          >
            Recharger le tableau
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScoreBoardApp />
    </ErrorBoundary>
  );
}

function ScoreBoardApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [periodCount, setPeriodCount] = useState(2);
  const [periodDuration, setPeriodDuration] = useState(45);
  const [isMatchFinished, setIsMatchFinished] = useState(false);

  const totalPeriods = Math.max(1, periodCount);
  const periodDurationSeconds = Math.max(1, periodDuration) * 60;
  const currentPeriodIndex = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDurationSeconds)));

  const [periodScores, setPeriodScores] = useState<PeriodScore[]>([
    { home: 0, away: 0 },
    { home: 0, away: 0 }
  ]);

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
  }, [totalPeriods]);

  const homeScore = periodScores.reduce((sum, p) => sum + (p?.home || 0), 0);
  const awayScore = periodScores.reduce((sum, p) => sum + (p?.away || 0), 0);

  const handleHomeScoreChange = (delta: number) => {
    setPeriodScores((prev) => {
      const next = [...prev];
      while (next.length < totalPeriods) {
        next.push({ home: 0, away: 0 });
      }
      const idx = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDurationSeconds)));
      if (!next[idx]) {
        next[idx] = { home: 0, away: 0 };
      }
      const curr = next[idx]?.home || 0;
      if (delta < 0 && curr === 0) {
        for (let i = idx - 1; i >= 0; i--) {
          if (next[i] && next[i].home > 0) {
            next[i] = { ...next[i], home: next[i].home - 1 };
            break;
          }
        }
      } else {
        next[idx] = { ...next[idx], home: Math.max(0, curr + delta) };
      }
      return next;
    });
  };

  const handleAwayScoreChange = (delta: number) => {
    setPeriodScores((prev) => {
      const next = [...prev];
      while (next.length < totalPeriods) {
        next.push({ home: 0, away: 0 });
      }
      const idx = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDurationSeconds)));
      if (!next[idx]) {
        next[idx] = { home: 0, away: 0 };
      }
      const curr = next[idx]?.away || 0;
      if (delta < 0 && curr === 0) {
        for (let i = idx - 1; i >= 0; i--) {
          if (next[i] && next[i].away > 0) {
            next[i] = { ...next[i], away: next[i].away - 1 };
            break;
          }
        }
      } else {
        next[idx] = { ...next[idx], away: Math.max(0, curr + delta) };
      }
      return next;
    });
  };

  const handlePeriodScoreUpdate = (periodIndex: number, team: 'home' | 'away', delta: number) => {
    setPeriodScores((prev) => {
      const next = [...prev];
      if (next[periodIndex]) {
        const currentVal = next[periodIndex][team] || 0;
        next[periodIndex] = {
          ...next[periodIndex],
          [team]: Math.max(0, currentVal + delta)
        };
      }
      return next;
    });
  };

  const handleResetPeriodScore = (periodIndex: number) => {
    setPeriodScores((prev) => {
      const next = [...prev];
      if (next[periodIndex]) {
        next[periodIndex] = { home: 0, away: 0 };
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const timerRef = useRef<{ startTime: number; baseSeconds: number } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
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

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetMatch = () => {
    setIsActive(false);
    setIsMatchFinished(true);
    setCurrentPage('home');
  };

  const clearAll = () => {
    setPeriodScores(Array(totalPeriods).fill(null).map(() => ({ home: 0, away: 0 })));
    setSeconds(0);
    setIsActive(false);
    setIsMatchFinished(false);
    setHomeTeamName('');
    setAwayTeamName('');
  };

  const getPeriodLabel = () => {
    const pName = getPeriodName(currentPeriodIndex, totalPeriods);
    return `${pName} (${currentPeriodIndex + 1}/${totalPeriods})`;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md w-full mx-auto relative overflow-hidden bg-surface text-text shadow-2xl border-x border-white/5">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/90 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between px-4 h-14">
          {/* Logo Section (Left) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 z-10 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-[0_3px_10px_rgba(0,227,253,0.25)] border border-white/10">
              <Trophy className="w-4 h-4 text-on-primary" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-text font-headline font-black italic tracking-tighter text-sm leading-none">
                SCOREBOARD
              </span>
              <span className="text-primary font-headline font-black italic tracking-tighter text-sm leading-none">
                LIVE
              </span>
            </div>
          </motion.div>

          {/* Actions Section (Right) */}
          <div className="flex items-center z-10">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-surface-bright text-text-muted hover:text-primary transition-all active:scale-90"
              aria-label="Changer de thème"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4 flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {currentPage === 'live' ? (
            <LiveScoreScreen 
              key="live" 
              seconds={seconds}
              isActive={isActive}
              periodCount={periodCount}
              periodDuration={periodDuration}
              formatTime={formatTime}
              getPeriodLabel={getPeriodLabel}
              setIsActive={setIsActive}
              setSeconds={updateSeconds}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              homeScore={homeScore}
              awayScore={awayScore}
              periodScores={periodScores}
              totalPeriods={totalPeriods}
              currentPeriodIndex={currentPeriodIndex}
              handleHomeScoreChange={handleHomeScoreChange}
              handleAwayScoreChange={handleAwayScoreChange}
              handlePeriodScoreUpdate={handlePeriodScoreUpdate}
              handleResetPeriodScore={handleResetPeriodScore}
              resetMatch={resetMatch}
            />
          ) : (
            <HomeScreen 
              key="home" 
              homeTeamName={homeTeamName}
              setHomeTeamName={setHomeTeamName}
              awayTeamName={awayTeamName}
              setAwayTeamName={setAwayTeamName}
              homeScore={homeScore}
              awayScore={awayScore}
              periodScores={periodScores}
              isMatchFinished={isMatchFinished}
              clearAll={clearAll}
              periodCount={periodCount}
              setPeriodCount={setPeriodCount}
              periodDuration={periodDuration}
              setPeriodDuration={setPeriodDuration}
              setCurrentPage={setCurrentPage}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/95 backdrop-blur-2xl border-t border-white/10 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-4 w-full">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 font-black shadow-sm' : 'text-text-muted hover:text-primary font-bold'}`}
          >
            <Home className="w-5 h-5" />
            <span className="font-headline text-xs uppercase tracking-wider">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentPage('live')}
            className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl transition-all ${currentPage === 'live' ? 'text-primary bg-primary/10 font-black shadow-sm' : 'text-text-muted hover:text-primary font-bold'}`}
          >
            <Timer className="w-5 h-5" />
            <span className="font-headline text-xs uppercase tracking-wider">Live Score</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

const LiveScoreScreen = ({
  seconds,
  isActive,
  periodCount,
  periodDuration,
  formatTime,
  getPeriodLabel,
  setIsActive,
  setSeconds,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  periodScores,
  totalPeriods,
  currentPeriodIndex,
  handleHomeScoreChange,
  handleAwayScoreChange,
  handlePeriodScoreUpdate,
  handleResetPeriodScore,
  resetMatch
}: any) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(seconds / 60).toString());
  const [editSeconds, setEditSeconds] = useState((seconds % 60).toString());

  const periodDurationSeconds = Math.max(1, periodDuration) * 60;
  const currentPeriodStartSec = currentPeriodIndex * periodDurationSeconds;
  const currentPeriodElapsedSec = Math.max(0, seconds - currentPeriodStartSec);
  const isPeriodReached = seconds >= (currentPeriodIndex + 1) * periodDurationSeconds;
  const extraTimeSeconds = isPeriodReached ? seconds - (currentPeriodIndex + 1) * periodDurationSeconds : 0;

  const handleSetTime = () => {
    const mins = parseInt(editMinutes) || 0;
    const secs = parseInt(editSeconds) || 0;
    setSeconds(mins * 60 + secs);
    setIsEditingTime(false);
  };

  const adjustSeconds = (delta: number) => {
    setSeconds((prev: number) => Math.max(0, prev + delta));
  };

  const handleSelectPeriod = (targetIndex: number) => {
    const cleanIndex = Math.max(0, Math.min(totalPeriods - 1, targetIndex));
    setIsActive(false);
    setSeconds(cleanIndex * periodDurationSeconds);
  };

  const handlePeriodChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentPeriodIndex < totalPeriods - 1) {
        handleSelectPeriod(currentPeriodIndex + 1);
      }
    } else {
      if (currentPeriodIndex > 0) {
        handleSelectPeriod(currentPeriodIndex - 1);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-3.5 w-full py-1"
    >
      {/* Timer Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-high rounded-2xl p-4 flex flex-col gap-3 shadow-lg border border-text/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline text-primary text-3xl sm:text-5xl font-black tracking-tight tabular-nums leading-none">
                {formatTime(seconds)}
              </span>

              {/* Petit carré de temps additionnel */}
              {extraTimeSeconds > 0 && (
                <div 
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-[11px] font-black tabular-nums tracking-wide flex items-center gap-1 shadow-sm"
                  title={`Temps additionnel : +${formatTime(extraTimeSeconds)}`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400/80">+</span>
                  <span>{formatTime(extraTimeSeconds)}</span>
                </div>
              )}

              <button 
                onClick={() => {
                  setEditMinutes(Math.floor(seconds / 60).toString());
                  setEditSeconds((seconds % 60).toString());
                  setIsEditingTime(true);
                }}
                className="p-1 text-text-dim hover:text-primary transition-colors"
                title="Éditer le temps manuellement"
                aria-label="Éditer le temps"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Période active & Temps réglementaire épuré (Option A) */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-surface-bright/90 px-2.5 py-1 rounded-xl border border-text/10 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-text">
                  {getPeriodName(currentPeriodIndex, totalPeriods)}
                </span>
                {totalPeriods > 1 && (
                  <span className="text-[10px] font-bold text-text-dim px-1.5 py-0.5 rounded bg-surface border border-text/5">
                    {currentPeriodIndex + 1}/{totalPeriods}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-text-dim bg-surface/60 px-2.5 py-1 rounded-xl border border-text/5 whitespace-nowrap tabular-nums notranslate">
                {formatTime(Math.min(currentPeriodElapsedSec, periodDurationSeconds))} / {formatTime(periodDurationSeconds)}
              </span>
            </div>
          </div>

          {/* Boutons Start / Pause & Reset spacieux & confortables */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button 
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`h-11 sm:h-12 px-5 sm:px-6 flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 font-headline font-black text-sm uppercase tracking-wider shadow-md ${
                isActive 
                  ? 'bg-text/5 text-text hover:bg-text/10 border border-text/10' 
                  : 'bg-primary text-on-primary shadow-[0_4px_16px_rgba(0,227,253,0.25)] hover:brightness-110'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{seconds > 0 ? 'Play' : 'Start'}</span>
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={() => {
                setSeconds(0);
                setIsActive(false);
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-text/5 text-text-dim hover:text-text hover:bg-text/10 transition-all border border-text/10 active:scale-95"
              title="Réinitialiser le chronomètre"
              aria-label="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Boutons de réglage rapide du temps */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
          <span className="text-[10px] font-black uppercase text-text-dim">Ajustement :</span>
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => adjustSeconds(-60)}
              className="px-2 py-1 rounded-lg bg-surface-bright hover:bg-surface text-text-dim hover:text-text text-[10px] font-black border border-text/5 active:scale-95 transition-all cursor-pointer select-none"
              title="Reculer d'une minute"
            >
              -1 min
            </button>
            <button 
              type="button"
              onClick={() => adjustSeconds(-30)}
              className="px-2 py-1 rounded-lg bg-surface-bright hover:bg-surface text-text-dim hover:text-text text-[10px] font-black border border-text/5 active:scale-95 transition-all cursor-pointer select-none"
              title="Reculer de 30 secondes"
            >
              -30s
            </button>
            <button 
              type="button"
              onClick={() => adjustSeconds(30)}
              className="px-2 py-1 rounded-lg bg-surface-bright hover:bg-surface text-text-dim hover:text-text text-[10px] font-black border border-text/5 active:scale-95 transition-all cursor-pointer select-none"
              title="Ajouter 30 secondes"
            >
              +30s
            </button>
            <button 
              type="button"
              onClick={() => adjustSeconds(60)}
              className="px-2 py-1 rounded-lg bg-surface-bright hover:bg-surface text-text-dim hover:text-text text-[10px] font-black border border-text/5 active:scale-95 transition-all cursor-pointer select-none"
              title="Ajouter 1 minute"
            >
              +1 min
            </button>
            <button 
              type="button"
              onClick={() => adjustSeconds(120)}
              className="px-2 py-1 rounded-lg bg-surface-bright hover:bg-surface text-text-dim hover:text-text text-[10px] font-black border border-text/5 active:scale-95 transition-all cursor-pointer select-none"
              title="Ajouter 2 minutes"
            >
              +2 min
            </button>
          </div>
        </div>

        {/* Alerte fin de période */}
        {isPeriodReached && !isActive && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-2.5 rounded-xl text-xs font-bold text-primary">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Fin de {getPeriodName(currentPeriodIndex, totalPeriods)} atteinte ({periodDuration}m)</span>
            </div>
            {currentPeriodIndex < totalPeriods - 1 ? (
              <button 
                type="button"
                onClick={() => handlePeriodChange('next')}
                className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-black text-[10px] uppercase hover:brightness-110 transition-all cursor-pointer"
              >
                Période suivante →
              </button>
            ) : (
              <button 
                type="button"
                onClick={resetMatch}
                className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-black text-[10px] uppercase hover:brightness-110 transition-all cursor-pointer"
              >
                Fin du match
              </button>
            )}
          </div>
        )}
      </motion.section>

      {/* Manual Time Setting Modal/Overlay */}
      <AnimatePresence>
        {isEditingTime && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-high border border-white/10 rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-black text-primary uppercase tracking-widest text-sm">Ajuster le Chrono</h3>
                <button onClick={() => setIsEditingTime(false)} className="text-text-muted hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-black text-text-dim uppercase tracking-wider">Minutes</span>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    className="w-20 h-20 bg-surface-bright border border-text/10 rounded-2xl text-center text-3xl sm:text-4xl font-headline font-black text-text focus:outline-none focus:border-primary/50 shadow-inner"
                  />
                </div>
                <span className="text-4xl font-headline font-bold text-text-dim mt-6">:</span>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-black text-text-dim uppercase tracking-wider">Secondes</span>
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editSeconds}
                    onChange={(e) => setEditSeconds(e.target.value)}
                    className="w-20 h-20 bg-surface-bright border border-text/10 rounded-2xl text-center text-3xl sm:text-4xl font-headline font-black text-text focus:outline-none focus:border-primary/50 shadow-inner"
                  />
                </div>
              </div>

              <button 
                onClick={handleSetTime}
                className="w-full bg-primary h-14 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Check className="w-6 h-6 text-on-primary" />
                <span className="font-headline font-black text-on-primary uppercase tracking-wider text-sm sm:text-base">Confirmer</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Display with Inline + / - Controls */}
      <section className="bg-surface-high/80 border border-text/10 rounded-2xl p-4 shadow-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between w-full px-1 gap-2">
          {/* Home Team Column */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="h-5 flex items-center justify-center w-full overflow-hidden mb-1.5">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-primary text-center truncate w-full">
                {homeTeamName || 'DOMICILE'}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => handleHomeScoreChange(-1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-bright text-text-muted hover:text-text border border-text/5 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="-1 Domicile"
                aria-label="-1 Domicile"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="h-[56px] relative flex items-center justify-center min-w-[42px] overflow-hidden">
                <motion.span 
                  key={`home-${homeScore}`}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="font-headline text-5xl sm:text-6xl font-black text-text tabular-nums px-0.5"
                >
                  {homeScore}
                </motion.span>
              </div>
              <button 
                type="button"
                onClick={() => handleHomeScoreChange(1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary text-on-primary shadow-md hover:brightness-110 flex items-center justify-center active:scale-95 transition-all"
                title="+1 Domicile"
                aria-label="+1 Domicile"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-[56px] pt-4">
            <span className="font-headline text-2xl sm:text-3xl font-black text-primary/40">-</span>
          </div>

          {/* Away Team Column */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="h-5 flex items-center justify-center w-full overflow-hidden mb-1.5">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-secondary text-center truncate w-full">
                {awayTeamName || 'EXTÉRIEUR'}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={() => handleAwayScoreChange(-1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-bright text-text-muted hover:text-text border border-text/5 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="-1 Extérieur"
                aria-label="-1 Extérieur"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="h-[56px] relative flex items-center justify-center min-w-[42px] overflow-hidden">
                <motion.span 
                  key={`away-${awayScore}`}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="font-headline text-5xl sm:text-6xl font-black text-text tabular-nums px-0.5"
                >
                  {awayScore}
                </motion.span>
              </div>
              <button 
                onClick={() => handleAwayScoreChange(1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary text-on-primary shadow-md hover:brightness-110 flex items-center justify-center active:scale-95 transition-all"
                title="+1 Extérieur"
                aria-label="+1 Extérieur"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats par Période - Tableau TV / NBA */}
      <div className="bg-surface-high/90 border border-text/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
              Tableau des Scores par Période
            </span>
          </div>
          <span className="text-[10px] text-text-dim font-bold bg-surface px-2 py-0.5 rounded-md border border-text/5">
            {totalPeriods} × {periodDuration}m
          </span>
        </div>

        {/* Table de score style Box-Score TV */}
        <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-text/10 bg-surface/70 shadow-inner">
          <table className="w-full text-center border-collapse min-w-full text-xs select-none">
            <thead>
              <tr className="border-b border-text/10 bg-surface-bright/80 text-[10px] uppercase font-black tracking-wider text-text-dim">
                <th className="text-left py-2.5 px-3 font-black text-text-muted">Équipe</th>
                {Array.from({ length: totalPeriods }).map((_, idx) => {
                  const isCurrent = idx === currentPeriodIndex;
                  const isPast = idx < currentPeriodIndex;
                  const shortName = getPeriodShortName(idx, totalPeriods);
                  return (
                    <th 
                      key={idx} 
                      onClick={() => handleSelectPeriod(idx)}
                      title={`Sélectionner ${getPeriodName(idx, totalPeriods)}`}
                      className={`py-2.5 px-2.5 cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'bg-primary/20 text-primary font-black border-b-2 border-primary' 
                          : isPast 
                            ? 'text-text-muted hover:text-text hover:bg-surface-high' 
                            : 'text-text-dim/60 hover:text-text hover:bg-surface-high'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{shortName}</span>
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2.5 px-3 bg-surface-high/60 font-black text-text border-l border-text/10">
                  TOT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text/5 font-headline">
              {/* Ligne Équipe Domicile */}
              <tr className="hover:bg-primary/5 transition-colors">
                <td className="text-left py-2.5 px-3 font-bold text-text truncate max-w-[120px] sm:max-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="truncate">{homeTeamName || 'Domicile'}</span>
                  </div>
                </td>
                {Array.from({ length: totalPeriods }).map((_, idx) => {
                  const isCurrent = idx === currentPeriodIndex;
                  const pScore = periodScores[idx]?.home ?? 0;
                  return (
                    <td 
                      key={idx} 
                      onClick={() => handleSelectPeriod(idx)}
                      className={`py-2.5 px-2.5 tabular-nums text-sm font-black cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-primary/10 text-primary font-black' 
                          : 'text-text hover:bg-surface-bright/50'
                      }`}
                    >
                      {pScore}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 tabular-nums text-base font-black text-primary bg-primary/10 border-l border-text/10">
                  {homeScore}
                </td>
              </tr>

              {/* Ligne Équipe Extérieur */}
              <tr className="hover:bg-secondary/5 transition-colors">
                <td className="text-left py-2.5 px-3 font-bold text-text truncate max-w-[120px] sm:max-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                    <span className="truncate">{awayTeamName || 'Extérieur'}</span>
                  </div>
                </td>
                {Array.from({ length: totalPeriods }).map((_, idx) => {
                  const isCurrent = idx === currentPeriodIndex;
                  const pScore = periodScores[idx]?.away ?? 0;
                  return (
                    <td 
                      key={idx} 
                      onClick={() => handleSelectPeriod(idx)}
                      className={`py-2.5 px-2.5 tabular-nums text-sm font-black cursor-pointer transition-all ${
                        isCurrent 
                          ? 'bg-primary/10 text-secondary font-black' 
                          : 'text-text hover:bg-surface-bright/50'
                      }`}
                    >
                      {pScore}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 tabular-nums text-base font-black text-secondary bg-secondary/10 border-l border-text/10">
                  {awayScore}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="text-[10px] text-text-dim text-center -mt-1">
          💡 Astuce : Cliquez sur une colonne de période ({getPeriodShortName(0, totalPeriods)}, {getPeriodShortName(1, totalPeriods)}...) pour synchroniser le chrono.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-1">
        <button 
          onClick={resetMatch}
          className="w-full bg-gradient-to-r from-primary to-primary-container h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,227,253,0.2)] hover:scale-[1.01] active:scale-95 transition-all group"
        >
          <span className="font-headline font-black text-on-primary uppercase tracking-wider text-xs sm:text-sm">
            Fin du Match
          </span>
          <Flag className="w-4 h-4 text-on-primary/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

const HomeScreen = ({ 
  homeTeamName, 
  setHomeTeamName, 
  awayTeamName, 
  setAwayTeamName, 
  homeScore,
  awayScore,
  periodScores,
  isMatchFinished,
  clearAll,
  periodCount, 
  setPeriodCount, 
  periodDuration, 
  setPeriodDuration, 
  setCurrentPage 
}: any) => {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShareResult = async () => {
    const home = homeTeamName.trim() || 'DOMICILE';
    const away = awayTeamName.trim() || 'EXTÉRIEUR';
    const title = `Score Final : ${home} ${homeScore} - ${awayScore} ${away}`;
    const breakdownText = periodScores
      .map((p: PeriodScore, i: number) => `${getPeriodShortName(i, periodCount)}: ${p.home}-${p.away}`)
      .join(' | ');

    const shareText = `🏁 Résultat Final\n⚽ ${home} ${homeScore} - ${awayScore} ${away}\n📊 Détail par période: ${breakdownText}\n\nScoreBoard Live`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (err) {
        console.error('Clipboard copy error:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-3.5 w-full py-1"
    >
      {/* Last Match Result Card */}
      <AnimatePresence>
        {isMatchFinished && (
          <motion.section 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary uppercase tracking-wider">Dernier Résultat</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleShareResult}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    title="Partager le score"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Partager</span>
                  </button>
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 active:scale-95 transition-colors"
                    title="Réinitialiser le résultat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Reset</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <span className="block text-sm sm:text-base font-black uppercase tracking-wider text-text truncate">{homeTeamName || 'DOMICILE'}</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-high px-4 py-2 rounded-xl border border-text/5 shadow-inner">
                  <span className="text-3xl font-black text-primary tabular-nums">{homeScore}</span>
                  <span className="text-text-dim font-bold text-xl">-</span>
                  <span className="text-3xl font-black text-secondary tabular-nums">{awayScore}</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-sm sm:text-base font-black uppercase tracking-wider text-text truncate">{awayTeamName || 'EXTÉRIEUR'}</span>
                </div>
              </div>

              {/* Period Breakdown */}
              {periodScores && periodScores.length > 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap pt-2.5 border-t border-primary/10">
                  {periodScores.map((p: PeriodScore, i: number) => {
                    return (
                      <span key={i} className="text-xs font-bold bg-surface-high/90 px-3 py-1.5 rounded-lg border border-text/10 text-text-muted flex items-center gap-1.5 shadow-sm">
                        <span className="text-text-dim uppercase text-[10px] font-black">{getPeriodShortName(i, periodCount)}:</span>
                        <strong className="text-primary font-black">{p?.home ?? 0}</strong>-<strong className="text-secondary font-black">{p?.away ?? 0}</strong>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Copy Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-surface-high border border-primary/40 text-text px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md"
          >
            <Check className="w-4 h-4 text-primary" />
            <span>Score copié dans le presse-papier !</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-3.5">
        {/* Home Team Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-primary uppercase tracking-wider ml-1">Équipe Domicile</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input 
              type="text" 
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              placeholder="Nom de l'équipe domicile"
              className="w-full h-14 bg-surface-high border border-text/10 rounded-2xl pl-12 pr-4 text-base sm:text-lg text-text font-headline font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-dim/60 shadow-sm"
            />
          </div>
        </div>

        {/* Away Team Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-secondary uppercase tracking-wider ml-1">Équipe Extérieur</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input 
              type="text" 
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              placeholder="Nom de l'équipe extérieur"
              className="w-full h-14 bg-surface-high border border-text/10 rounded-2xl pl-12 pr-4 text-base sm:text-lg text-text font-headline font-bold focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-text-dim/60 shadow-sm"
            />
          </div>
        </div>

        {/* Custom Period and Duration Settings */}
        <div className="flex flex-col gap-2.5 bg-surface-high/90 border border-text/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-text uppercase tracking-wider">
              Périodes & Durée du Match
            </label>
            <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              Total : {periodCount * periodDuration} min
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Nombre de Périodes */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-text-dim uppercase tracking-wider ml-0.5">
                Périodes
              </span>
              <div className="flex items-center gap-2 bg-surface-bright rounded-xl p-2 border border-text/10 shadow-sm">
                <button 
                  type="button"
                  onClick={() => setPeriodCount((c: number) => Math.max(1, c - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text active:scale-95 transition-all"
                  aria-label="Moins de périodes"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-black text-base sm:text-lg text-text tabular-nums">
                  {periodCount}
                </span>
                <button 
                  type="button"
                  onClick={() => setPeriodCount((c: number) => Math.min(10, c + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text active:scale-95 transition-all"
                  aria-label="Plus de périodes"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Durée par Période (Capped at 60 max) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-text-dim uppercase tracking-wider ml-0.5">
                Min / Période (max 60)
              </span>
              <div className="flex items-center gap-2 bg-surface-bright rounded-xl p-2 border border-text/10 shadow-sm">
                <button 
                  type="button"
                  onClick={() => setPeriodDuration((d: number) => Math.max(1, d - 5))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text active:scale-95 transition-all"
                  aria-label="Moins de minutes"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-black text-base sm:text-lg text-text tabular-nums">
                  {periodDuration}
                </span>
                <button 
                  type="button"
                  onClick={() => setPeriodDuration((d: number) => Math.min(60, d + 5))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Plus de minutes"
                  disabled={periodDuration >= 60}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-text-dim pt-1 border-t border-text/5">
            <span>{periodCount} {periodCount > 1 ? 'périodes' : 'période'} de {periodDuration} min</span>
            <span className="font-bold text-primary">{getPeriodName(0, periodCount)}</span>
          </div>
        </div>
      </section>

      <button 
        onClick={() => setCurrentPage('live')}
        className="w-full mt-2 bg-primary h-13 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,227,253,0.2)] hover:brightness-110 active:scale-95 transition-all group"
      >
        <span className="font-headline font-black text-on-primary uppercase tracking-widest text-sm">
          Rejoindre le Live
        </span>
        <ChevronRight className="w-5 h-5 text-on-primary group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
