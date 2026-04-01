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
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'home' | 'live';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [matchFormat, setMatchFormat] = useState<'kids' | 'adults' | 'custom'>('custom');
  const [customPeriodCount, setCustomPeriodCount] = useState(2);
  const [customPeriodDuration, setCustomPeriodDuration] = useState(45);
  const [isMatchFinished, setIsMatchFinished] = useState(false);

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
    setHomeScore(0);
    setAwayScore(0);
    setSeconds(0);
    setIsActive(false);
    setIsMatchFinished(false);
    setHomeTeamName('');
    setAwayTeamName('');
  };

  const getPeriodLabel = () => {
    if (matchFormat === 'kids') {
      if (seconds < 900) return '1ère Période (1/3)';
      if (seconds < 1800) return '2ème Période (2/3)';
      return '3ème Période (3/3)';
    } else if (matchFormat === 'adults') {
      if (seconds < 2700) return '1ère Mi-temps (1/2)';
      return '2ème Mi-temps (2/2)';
    } else {
      const durationInSeconds = customPeriodDuration * 60;
      const currentPeriod = Math.min(customPeriodCount, Math.floor(seconds / durationInSeconds) + 1);
      return `${currentPeriod}${currentPeriod === 1 ? 'ère' : 'ème'} Période (${currentPeriod}/${customPeriodCount})`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden bg-surface text-text">
      {/* Header */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between px-4 h-14">
          {/* Logo Section (Left) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 z-10 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(0,227,253,0.3)] border border-white/10">
              <Trophy className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-text font-headline font-black italic tracking-tighter text-[14px] leading-none">
                MATCH
              </span>
              <span className="text-primary font-headline font-black italic tracking-tighter text-[14px] leading-none">
                COMPTEUR
              </span>
            </div>
          </motion.div>

          {/* Actions Section (Right) */}
          <div className="flex items-center z-10">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-surface-bright text-text-muted hover:text-primary transition-all active:scale-90"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[calc(4rem+env(safe-area-inset-top))] pb-20 px-4 flex-1 flex flex-col justify-center">
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
              setHomeScore={setHomeScore}
              awayScore={awayScore}
              setAwayScore={setAwayScore}
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
      <nav className="fixed bottom-0 w-full max-w-md z-50 bg-surface/90 backdrop-blur-2xl border-t border-white/5 rounded-t-3xl shadow-2xl">
        <div className="flex justify-around items-center h-16 px-6 w-full">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 px-6 py-2 rounded-2xl' : 'text-text-muted hover:text-primary'}`}
          >
            <Home className="w-6 h-6" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentPage('live')}
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'live' ? 'text-primary bg-primary/10 px-6 py-2 rounded-2xl' : 'text-text-muted hover:text-primary'}`}
          >
            <Timer className="w-6 h-6" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest">Live Score</span>
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
  setHomeScore,
  awayScore,
  setAwayScore,
  resetMatch
}: any) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState(Math.floor(seconds / 60).toString());
  const [editSeconds, setEditSeconds] = useState((seconds % 60).toString());

  const handleSetTime = () => {
    const mins = parseInt(editMinutes) || 0;
    const secs = parseInt(editSeconds) || 0;
    setSeconds(mins * 60 + secs);
    setIsEditingTime(false);
  };

  const handlePeriodChange = (direction: 'next' | 'prev') => {
    let duration = 45; // Default
    let count = 2;

    if (matchFormat === 'kids') {
      duration = 15;
      count = 3;
    } else if (matchFormat === 'adults') {
      duration = 45;
      count = 2;
    } else {
      duration = customPeriodDuration;
      count = customPeriodCount;
    }

    const durationInSeconds = duration * 60;
    const currentPeriod = Math.floor(seconds / durationInSeconds);
    
    let nextSeconds = seconds;
    if (direction === 'next') {
      if (currentPeriod < count - 1) {
        nextSeconds = (currentPeriod + 1) * durationInSeconds;
      }
    } else {
      if (currentPeriod > 0) {
        nextSeconds = (currentPeriod - 1) * durationInSeconds;
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
      className="flex flex-col gap-2"
    >
      {/* Timer Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-high rounded-2xl p-3 flex items-center justify-between shadow-2xl border border-text/5"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-primary text-4xl font-bold tracking-tight tabular-nums leading-none">
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
            className={`h-11 px-5 flex items-center justify-center gap-2 rounded-2xl transition-all active:scale-95 font-headline font-black text-[9px] uppercase tracking-[0.2em] ${
              isActive 
                ? 'bg-text/5 text-text-muted border border-text/5 hover:bg-text/10' 
                : 'bg-primary text-on-primary shadow-[0_8px_20px_rgba(0,227,253,0.2)] hover:brightness-110'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{seconds > 0 ? 'PLAY' : 'START'}</span>
              </>
            )}
          </button>
          <button 
            onClick={() => {
              setSeconds(0);
              setIsActive(false);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-text/5 text-text-dim hover:text-text hover:bg-text/10 transition-all border border-text/5 active:scale-95"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
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

      {/* Score Display */}
      <section className="flex flex-col items-center justify-center py-1">
        <div className="flex items-center justify-between w-full px-2 gap-2">
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="h-4 flex items-center justify-center w-full overflow-hidden">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary text-center truncate w-full">
                {homeTeamName || 'DOMICILE'}
              </span>
            </div>
            <div className="h-[60px] relative flex items-center justify-center w-full overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span 
                  key={homeScore}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="font-headline text-6xl font-black text-text tabular-nums"
                >
                  {homeScore}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-[80px] pt-4">
            <span className="font-headline text-2xl font-bold text-primary/20">-</span>
          </div>

          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="h-4 flex items-center justify-center w-full overflow-hidden">
              <span className="text-[11px] font-black uppercase tracking-wider text-secondary text-center truncate w-full">
                {awayTeamName || 'EXTÉRIEUR'}
              </span>
            </div>
            <div className="h-[60px] relative flex items-center justify-center w-full overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span 
                  key={awayScore}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="font-headline text-6xl font-black text-text tabular-nums"
                >
                  {awayScore}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <div className="bg-surface-container rounded-2xl p-3 flex items-center justify-between border border-text/5">
          <span className="font-headline font-bold text-xs tracking-widest text-text-muted uppercase truncate max-w-[120px]">
            {homeTeamName || 'DOMICILE'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setHomeScore((s: number) => Math.max(0, s - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-text-muted hover:text-text transition-colors border border-text/5"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setHomeScore((s: number) => s + 1)}
              className="w-14 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-3 flex items-center justify-between border border-text/5">
          <span className="font-headline font-bold text-xs tracking-widest text-text-muted uppercase truncate max-w-[120px]">
            {awayTeamName || 'EXTÉRIEUR'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAwayScore((s: number) => Math.max(0, s - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-text-muted hover:text-text transition-colors border border-text/5"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setAwayScore((s: number) => s + 1)}
              className="w-14 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={resetMatch}
        className="w-full mt-0 bg-gradient-to-r from-primary to-primary-container h-14 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,227,253,0.2)] hover:scale-[1.02] active:scale-95 transition-all group"
      >
        <span className="font-headline font-black text-on-primary uppercase tracking-[0.2em] text-sm">
          Fin du Match
        </span>
        <Flag className="w-6 h-6 text-on-primary/40 group-hover:translate-x-1 transition-transform" />
      </button>
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
      className="flex flex-col gap-4 py-2"
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
                  <span className="block text-xs font-bold uppercase tracking-wider text-text-muted truncate">{homeTeamName}</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-high px-4 py-2 rounded-xl border border-text/5 shadow-inner">
                  <span className="text-2xl font-black text-primary tabular-nums">{homeScore}</span>
                  <span className="text-text-dim font-bold">-</span>
                  <span className="text-2xl font-black text-secondary tabular-nums">{awayScore}</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-text-muted truncate">{awayTeamName}</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-4">
        {/* Home Team Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Équipe Domicile</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input 
              type="text" 
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-text/5 rounded-2xl py-3 pl-12 pr-4 text-text font-headline font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* Away Team Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Équipe Extérieur</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input 
              type="text" 
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-text/5 rounded-2xl py-3 pl-12 pr-4 text-text font-headline font-bold focus:outline-none focus:border-secondary/50 transition-all placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* Match Format Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Format du Match</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => setMatchFormat('custom')}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${matchFormat === 'custom' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-high border-text/5 text-text-muted'}`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest">Personnalisé</span>
              <span className="text-[12px] font-bold mt-1">Configuration Libre</span>
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
              className="overflow-hidden flex flex-col gap-3 pt-1"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-text-dim uppercase tracking-widest ml-1">Périodes</label>
                  <div className="flex items-center gap-2 bg-surface-high rounded-xl p-1 border border-text/5">
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.max(1, c - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-text-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-text tabular-nums">{customPeriodCount}</span>
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.min(10, c + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-text-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-text-dim uppercase tracking-widest ml-1">Minutes / Période</label>
                  <div className="flex items-center gap-2 bg-surface-high rounded-xl p-1 border border-text/5">
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.max(1, d - 5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-text-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-text tabular-nums">{customPeriodDuration}</span>
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.min(120, d + 5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-text-muted"
                    >
                      <Plus className="w-4 h-4" />
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
        className="w-full mt-2 bg-primary h-14 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(129,236,255,0.15)] hover:brightness-110 active:scale-95 transition-all group"
      >
        <span className="font-headline font-black text-on-primary uppercase tracking-[0.2em] text-sm">
          Rejoindre le Live
        </span>
        <ChevronRight className="w-5 h-5 text-on-primary group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
