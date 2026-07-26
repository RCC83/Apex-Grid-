/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'home' | 'live';

export interface PeriodScore {
  home: number;
  away: number;
}

export const getTotalPeriods = (format: 'kids' | 'adults' | 'custom', customCount: number) => {
  if (format === 'adults') return 2;
  if (format === 'kids') return 3;
  return customCount;
};

export const getPeriodDuration = (format: 'kids' | 'adults' | 'custom', customDuration: number) => {
  if (format === 'adults') return 45 * 60;
  if (format === 'kids') return 15 * 60;
  return customDuration * 60;
};

export const getPeriodName = (index: number, format: 'kids' | 'adults' | 'custom') => {
  if (format === 'adults') {
    return index === 0 ? '1ère Mi-temps' : '2ème Mi-temps';
  } else if (format === 'kids') {
    return `${index + 1}${index === 0 ? 'er' : 'ème'} Tiers`;
  } else {
    return `Période ${index + 1}`;
  }
};

export const getPeriodShortName = (index: number, format: 'kids' | 'adults' | 'custom') => {
  if (format === 'adults') {
    return index === 0 ? '1MT' : '2MT';
  } else if (format === 'kids') {
    return `T${index + 1}`;
  } else {
    return `P${index + 1}`;
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [matchFormat, setMatchFormat] = useState<'kids' | 'adults' | 'custom'>('custom');
  const [customPeriodCount, setCustomPeriodCount] = useState(2);
  const [customPeriodDuration, setCustomPeriodDuration] = useState(45);
  const [isMatchFinished, setIsMatchFinished] = useState(false);

  const totalPeriods = getTotalPeriods(matchFormat, customPeriodCount);
  const periodDuration = getPeriodDuration(matchFormat, customPeriodDuration);
  const currentPeriodIndex = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDuration)));

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
      const idx = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDuration)));
      const curr = next[idx]?.home || 0;
      if (delta < 0 && curr === 0) {
        for (let i = idx - 1; i >= 0; i--) {
          if (next[i].home > 0) {
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
      const idx = Math.min(totalPeriods - 1, Math.max(0, Math.floor(seconds / periodDuration)));
      const curr = next[idx]?.away || 0;
      if (delta < 0 && curr === 0) {
        for (let i = idx - 1; i >= 0; i--) {
          if (next[i].away > 0) {
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
        const currentVal = next[periodIndex][team];
        next[periodIndex] = {
          ...next[periodIndex],
          [team]: Math.max(0, currentVal + delta)
        };
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

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
    const pName = getPeriodName(currentPeriodIndex, matchFormat);
    return `${pName} (${currentPeriodIndex + 1}/${totalPeriods})`;
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[360px] mx-auto relative overflow-hidden bg-surface text-text">
      {/* Header */}
      <header className="fixed top-0 w-full max-w-[360px] z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between px-3 h-12">
          {/* Logo Section (Left) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 z-10 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,227,253,0.25)] border border-white/10">
              <Trophy className="w-4 h-4 text-on-primary" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-text font-headline font-black italic tracking-tighter text-[12px] leading-none">
                MATCH
              </span>
              <span className="text-primary font-headline font-black italic tracking-tighter text-[12px] leading-none">
                COMPTEUR
              </span>
            </div>
          </motion.div>

          {/* Actions Section (Right) */}
          <div className="flex items-center z-10">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-surface-bright text-text-muted hover:text-primary transition-all active:scale-90"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-12 pb-12 px-3 flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {currentPage === 'live' ? (
            <LiveScoreScreen 
              key="live" 
              seconds={seconds}
              isActive={isActive}
              matchFormat={matchFormat}
              customPeriodCount={customPeriodCount}
              customPeriodDuration={customPeriodDuration}
              formatTime={formatTime}
              getPeriodLabel={getPeriodLabel}
              setIsActive={setIsActive}
              setSeconds={setSeconds}
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
              matchFormat={matchFormat}
              setMatchFormat={setMatchFormat}
              customPeriodCount={customPeriodCount}
              setCustomPeriodCount={setCustomPeriodCount}
              customPeriodDuration={customPeriodDuration}
              setCustomPeriodDuration={setCustomPeriodDuration}
              setCurrentPage={setCurrentPage}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-[360px] z-50 bg-surface/90 backdrop-blur-2xl border-t border-white/5 rounded-t-xl shadow-2xl">
        <div className="flex justify-around items-center pl-3 pr-[14px] border-[10px] border-transparent w-full" style={{ height: '53px', borderRadius: '10px' }}>
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex items-center gap-1.5 transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 px-4 py-1 rounded-lg' : 'text-text-muted hover:text-primary px-3 py-1'}`}
          >
            <Home className="w-4 h-4" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-wider">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentPage('live')}
            className={`flex items-center gap-1.5 transition-all ${currentPage === 'live' ? 'text-primary bg-primary/10 px-4 py-1 rounded-lg' : 'text-text-muted hover:text-primary px-3 py-1'}`}
          >
            <Timer className="w-4 h-4" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-wider">Live Score</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

const LiveScoreScreen = ({
  seconds,
  isActive,
  matchFormat,
  customPeriodCount,
  customPeriodDuration,
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
  resetMatch
}: any) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(seconds / 60).toString());
  const [editSeconds, setEditSeconds] = useState((seconds % 60).toString());
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    const home = homeTeamName.trim() || 'DOMICILE';
    const away = awayTeamName.trim() || 'EXTÉRIEUR';
    const period = getPeriodLabel();
    const time = formatTime(seconds);
    const title = `Match Compteur - ${home} vs ${away}`;

    const breakdownText = periodScores
      .map((p: PeriodScore, i: number) => `${getPeriodShortName(i, matchFormat)}: ${p.home}-${p.away}`)
      .join(' | ');

    const shareText = `⚽ ${home} ${homeScore} - ${awayScore} ${away}\n📊 Score par période: ${breakdownText}\n⏱️ ${period} (${time})\n\nSuivez le match sur Match Compteur !`;
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

  const handleSetTime = () => {
    const mins = parseInt(editMinutes) || 0;
    const secs = parseInt(editSeconds) || 0;
    setSeconds(mins * 60 + secs);
    setIsEditingTime(false);
  };

  const handlePeriodChange = (direction: 'next' | 'prev') => {
    const durationInSeconds = getPeriodDuration(matchFormat, customPeriodDuration);
    let nextSeconds = seconds;
    if (direction === 'next') {
      if (currentPeriodIndex < totalPeriods - 1) {
        nextSeconds = (currentPeriodIndex + 1) * durationInSeconds;
      }
    } else {
      if (currentPeriodIndex > 0) {
        nextSeconds = (currentPeriodIndex - 1) * durationInSeconds;
      } else {
        nextSeconds = 0;
      }
    }
    
    setSeconds(nextSeconds);
    setIsActive(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-3 w-full py-0.5"
      style={{ paddingTop: '21px' }}
    >
      {/* Timer Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-high rounded-xl p-2.5 flex items-center justify-between shadow-lg border border-text/5"
        style={{ paddingTop: '30px' }}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-primary text-3xl font-bold tracking-tight tabular-nums leading-none">
              {formatTime(seconds)}
            </span>
            <button 
              onClick={() => {
                setEditMinutes(Math.floor(seconds / 60).toString());
                setEditSeconds((seconds % 60).toString());
                setIsEditingTime(true);
              }}
              className="p-1 text-text-dim hover:text-primary transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-0.5 bg-text/5 rounded-full px-2 py-0.5 w-fit border border-text/5">
            <button 
              onClick={() => handlePeriodChange('prev')}
              className="p-0.5 text-text-muted hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-2 h-2" strokeWidth={4} />
            </button>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted h-3 flex items-center overflow-hidden whitespace-nowrap px-1">
              {getPeriodLabel()}
            </span>
            <button 
              onClick={() => handlePeriodChange('next')}
              className="p-0.5 text-text-muted hover:text-primary transition-colors"
            >
              <ChevronRight className="w-2 h-2" strokeWidth={4} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`h-9 px-3.5 flex items-center justify-center gap-1.5 rounded-xl transition-all active:scale-95 font-headline font-black text-[9px] uppercase tracking-[0.2em] ${
              isActive 
                ? 'bg-text/5 text-text-muted border border-text/5 hover:bg-text/10' 
                : 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(0,227,253,0.2)] hover:brightness-110'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{seconds > 0 ? 'PLAY' : 'START'}</span>
              </>
            )}
          </button>
          <button 
            onClick={() => {
              setSeconds(0);
              setIsActive(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-text/5 text-text-dim hover:text-text hover:bg-text/10 transition-all border border-text/5 active:scale-95"
            title="Réinitialiser"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
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
                <h3 className="font-headline font-black text-primary uppercase tracking-widest text-xs">Ajuster le Chrono</h3>
                <button onClick={() => setIsEditingTime(false)} className="text-text-muted hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Minutes</span>
                  <input 
                    type="number" 
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    className="w-20 h-20 bg-surface-bright border border-text/5 rounded-2xl text-center text-3xl font-headline font-bold text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
                <span className="text-4xl font-headline font-bold text-text-dim mt-6">:</span>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Secondes</span>
                  <input 
                    type="number" 
                    value={editSeconds}
                    onChange={(e) => setEditSeconds(e.target.value)}
                    className="w-20 h-20 bg-surface-bright border border-text/5 rounded-2xl text-center text-3xl font-headline font-bold text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <button 
                onClick={handleSetTime}
                className="w-full bg-primary h-14 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Check className="w-6 h-6 text-on-primary" />
                <span className="font-headline font-black text-on-primary uppercase tracking-widest text-sm">Confirmer</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Display with Inline + / - Controls */}
      <section 
        className="bg-surface-high/80 border border-text/10 rounded-xl p-2.5 shadow-md flex flex-col gap-1"
        style={{ marginTop: '22px' }}
      >
        <div className="flex items-center justify-between w-full px-1 gap-2">
          {/* Home Team Column */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="h-3.5 flex items-center justify-center w-full overflow-hidden mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary text-center truncate w-full">
                {homeTeamName || 'DOMICILE'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => handleHomeScoreChange(-1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-bright text-text-muted hover:text-text border border-text/5 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="-1 Domicile"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="h-[44px] relative flex items-center justify-center min-w-[32px] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={homeScore}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="font-headline text-4xl sm:text-5xl font-black text-text tabular-nums px-0.5"
                  >
                    {homeScore}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button 
                onClick={() => handleHomeScoreChange(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-on-primary shadow-sm hover:brightness-110 flex items-center justify-center active:scale-95 transition-all"
                title="+1 Domicile"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-[44px] pt-3">
            <span className="font-headline text-lg font-bold text-primary/20">-</span>
          </div>

          {/* Away Team Column */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="h-3.5 flex items-center justify-center w-full overflow-hidden mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-secondary text-center truncate w-full">
                {awayTeamName || 'EXTÉRIEUR'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => handleAwayScoreChange(-1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-bright text-text-muted hover:text-text border border-text/5 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="-1 Extérieur"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="h-[44px] relative flex items-center justify-center min-w-[32px] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={awayScore}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="font-headline text-4xl sm:text-5xl font-black text-text tabular-nums px-0.5"
                  >
                    {awayScore}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button 
                onClick={() => handleAwayScoreChange(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-on-primary shadow-sm hover:brightness-110 flex items-center justify-center active:scale-95 transition-all"
                title="+1 Extérieur"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Résultats Intermédiaires Card */}
      <div 
        className="bg-surface-high/80 border border-text/10 rounded-xl p-2 flex flex-col gap-1 shadow-sm"
        style={{ paddingTop: '31px', marginLeft: '0px', marginTop: '16px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ListOrdered className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
              Résultats Intermédiaires
            </span>
          </div>
          <span className="text-[8px] font-bold text-text-dim uppercase">
            {totalPeriods} {totalPeriods > 1 ? 'Périodes' : 'Période'} ({Math.round(getPeriodDuration(matchFormat, customPeriodDuration) / 60)}m)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
          {periodScores.map((p: PeriodScore, idx: number) => {
            const isCurrent = idx === currentPeriodIndex;
            const shortName = getPeriodShortName(idx, matchFormat);
            
            return (
              <div 
                key={idx}
                className={`flex flex-col p-1.5 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-primary/10 border-primary/60 text-text shadow-sm' 
                    : 'bg-surface-high/60 border-text/5 text-text-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-[8px] font-black uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                    {shortName}
                  </span>
                  {isCurrent ? (
                    <span className="text-[7px] font-black bg-primary text-on-primary px-1 py-0.2 rounded uppercase">
                      En cours
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        const dur = getPeriodDuration(matchFormat, customPeriodDuration);
                        setSeconds(idx * dur);
                        setIsActive(false);
                      }}
                      className="text-[7px] font-bold text-text-dim hover:text-primary transition-colors underline"
                    >
                      Aller à
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between bg-surface/70 rounded px-1.5 py-0.5 border border-text/5 gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => handlePeriodScoreUpdate(idx, 'home', -1)}
                      className="w-3.5 h-3.5 rounded flex items-center justify-center bg-surface-bright text-text-dim hover:text-primary text-[9px] font-bold"
                      title="Moins Domicile"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-black text-primary tabular-nums min-w-[10px] text-center">{p.home}</span>
                    <button 
                      onClick={() => handlePeriodScoreUpdate(idx, 'home', 1)}
                      className="w-3.5 h-3.5 rounded flex items-center justify-center bg-surface-bright text-text-dim hover:text-primary text-[9px] font-bold"
                      title="Plus Domicile"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[9px] font-bold text-text-dim">-</span>

                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => handlePeriodScoreUpdate(idx, 'away', -1)}
                      className="w-3.5 h-3.5 rounded flex items-center justify-center bg-surface-bright text-text-dim hover:text-secondary text-[9px] font-bold"
                      title="Moins Extérieur"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-black text-secondary tabular-nums min-w-[10px] text-center">{p.away}</span>
                    <button 
                      onClick={() => handlePeriodScoreUpdate(idx, 'away', 1)}
                      className="w-3.5 h-3.5 rounded flex items-center justify-center bg-surface-bright text-text-dim hover:text-secondary text-[9px] font-bold"
                      title="Plus Extérieur"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-0.5">
        <button 
          onClick={handleShare}
          className="bg-surface-high hover:bg-surface-bright border border-text/10 h-9 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all group shadow-sm"
          style={{ marginTop: '15px' }}
          title="Partager le score"
        >
          <Share2 className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-headline font-bold text-text uppercase tracking-wider text-[10px]">
            Partager
          </span>
        </button>
        <button 
          onClick={resetMatch}
          className="bg-gradient-to-r from-primary to-primary-container h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(0,227,253,0.2)] hover:scale-[1.02] active:scale-95 transition-all group"
          style={{ marginTop: '15px', width: '167px' }}
        >
          <span className="font-headline font-black text-on-primary uppercase tracking-wider text-[10px]">
            Fin du Match
          </span>
          <Flag className="w-3.5 h-3.5 text-on-primary/50 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

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
  matchFormat, 
  setMatchFormat, 
  customPeriodCount, 
  setCustomPeriodCount, 
  customPeriodDuration, 
  setCustomPeriodDuration, 
  setCurrentPage 
}: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-3 w-full py-0.5"
      style={{ paddingTop: '21px' }}
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
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dernier Résultat</span>
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <span className="block text-xs font-bold uppercase tracking-wider text-text-muted truncate">{homeTeamName || 'DOMICILE'}</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-high px-4 py-2 rounded-xl border border-text/5 shadow-inner">
                  <span className="text-2xl font-black text-primary tabular-nums">{homeScore}</span>
                  <span className="text-text-dim font-bold">-</span>
                  <span className="text-2xl font-black text-secondary tabular-nums">{awayScore}</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-text-muted truncate">{awayTeamName || 'EXTÉRIEUR'}</span>
                </div>
              </div>

              {/* Period Breakdown */}
              {periodScores && periodScores.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2 border-t border-primary/10">
                  {periodScores.map((p: PeriodScore, i: number) => (
                    <span key={i} className="text-[10px] font-bold bg-surface-high/80 px-2.5 py-1 rounded-lg border border-text/5 text-text-muted flex items-center gap-1">
                      <span className="text-text-dim uppercase text-[9px]">{getPeriodShortName(i, matchFormat)}:</span>
                      <strong className="text-primary">{p.home}</strong>-<strong className="text-secondary">{p.away}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-3">
        {/* Home Team Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-1">Équipe Domicile</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
              type="text" 
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-text/5 rounded-xl py-2 pl-10 pr-3 text-xs text-text font-headline font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* Away Team Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Équipe Extérieur</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
              type="text" 
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-text/5 rounded-xl py-2 pl-10 pr-3 text-xs text-text font-headline font-bold focus:outline-none focus:border-secondary/50 transition-all placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* Match Format Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Format du Match</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button 
              onClick={() => setMatchFormat('adults')}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${matchFormat === 'adults' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-high border-text/5 text-text-muted hover:text-text'}`}
            >
              <span className="text-[8px] font-black uppercase tracking-wider">Adultes</span>
              <span className="text-[10px] font-bold mt-0.5">2 × 45m</span>
            </button>
            <button 
              onClick={() => setMatchFormat('kids')}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${matchFormat === 'kids' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-high border-text/5 text-text-muted hover:text-text'}`}
            >
              <span className="text-[8px] font-black uppercase tracking-wider">Jeunes</span>
              <span className="text-[10px] font-bold mt-0.5">3 × 15m</span>
            </button>
            <button 
              onClick={() => setMatchFormat('custom')}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${matchFormat === 'custom' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-high border-text/5 text-text-muted hover:text-text'}`}
            >
              <span className="text-[8px] font-black uppercase tracking-wider">Sur Mesure</span>
              <span className="text-[10px] font-bold mt-0.5">{customPeriodCount} × {customPeriodDuration}m</span>
            </button>
          </div>
        </div>

        {/* Custom Format Inputs */}
        <AnimatePresence>
          {matchFormat === 'custom' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex flex-col gap-2 pt-0.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black text-text-dim uppercase tracking-widest ml-1">Périodes</label>
                  <div className="flex items-center gap-1.5 bg-surface-high rounded-lg p-1 border border-text/5">
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.max(1, c - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-bright text-text-muted"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-text tabular-nums">{customPeriodCount}</span>
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.min(10, c + 1))}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-bright text-text-muted"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black text-text-dim uppercase tracking-widest ml-1">Min / Période</label>
                  <div className="flex items-center gap-1.5 bg-surface-high rounded-lg p-1 border border-text/5">
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.max(1, d - 5))}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-bright text-text-muted"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-text tabular-nums">{customPeriodDuration}</span>
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.min(120, d + 5))}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-bright text-text-muted"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <button 
        onClick={() => setCurrentPage('live')}
        className="w-full mt-1 bg-primary h-11 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(129,236,255,0.15)] hover:brightness-110 active:scale-95 transition-all group"
      >
        <span className="font-headline font-black text-on-primary uppercase tracking-[0.2em] text-xs">
          Rejoindre le Live
        </span>
        <ChevronRight className="w-4 h-4 text-on-primary group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
