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
  Activity,
  ChevronRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'home' | 'live';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
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
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden bg-surface text-white">
      {/* Header */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="font-headline uppercase tracking-widest font-bold text-sm text-primary">
              MATCH CENTER
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-white/40 font-headline font-black italic tracking-tighter text-sm">
              APEX GRID
            </span>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentPage === 'live' ? (
            <LiveScoreScreen 
              key="live" 
              seconds={seconds}
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
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 px-6 py-2 rounded-2xl' : 'text-white/40 hover:text-primary'}`}
          >
            <Home className="w-6 h-6" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentPage('live')}
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'live' ? 'text-primary bg-primary/10 px-6 py-2 rounded-2xl' : 'text-white/40 hover:text-primary'}`}
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
        className="bg-surface-high rounded-2xl p-3 flex items-center justify-between shadow-2xl border border-white/5"
      >
        <div className="flex flex-col w-[120px] shrink-0">
          <span className="font-headline text-primary text-4xl font-bold tracking-tight tabular-nums leading-none">
            {formatTime(seconds)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-2 h-4 flex items-center overflow-hidden whitespace-nowrap">
            {getPeriodLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsActive(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsActive(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-[0_0_20px_rgba(129,236,255,0.3)] hover:brightness-110 transition-all active:scale-95"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>
          <button 
            onClick={() => {
              setSeconds(0);
              setIsActive(false);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

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
                  className="font-headline text-6xl font-black text-white tabular-nums"
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
                  className="font-headline text-6xl font-black text-white tabular-nums"
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
        <div className="bg-surface-container rounded-2xl p-3 flex items-center justify-between border border-white/5">
          <span className="font-headline font-bold text-xs tracking-widest text-white/80 uppercase truncate max-w-[120px]">
            {homeTeamName || 'DOMICILE'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setHomeScore((s: number) => Math.max(0, s - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-white/60 hover:text-white transition-colors border border-white/5"
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

        <div className="bg-surface-container rounded-2xl p-3 flex items-center justify-between border border-white/5">
          <span className="font-headline font-bold text-xs tracking-widest text-white/80 uppercase truncate max-w-[120px]">
            {awayTeamName || 'EXTÉRIEUR'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAwayScore((s: number) => Math.max(0, s - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bright text-white/60 hover:text-white transition-colors border border-white/5"
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
        <Activity className="w-6 h-6 text-on-primary" />
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
                  <span className="block text-xs font-bold uppercase tracking-wider text-white/60 truncate">{homeTeamName}</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-high px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                  <span className="text-2xl font-black text-primary tabular-nums">{homeScore}</span>
                  <span className="text-white/20 font-bold">-</span>
                  <span className="text-2xl font-black text-secondary tabular-nums">{awayScore}</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-white/60 truncate">{awayTeamName}</span>
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
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input 
              type="text" 
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-headline font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        {/* Away Team Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Équipe Extérieur</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input 
              type="text" 
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              placeholder="Nom de l'équipe"
              className="w-full bg-surface-high border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white font-headline font-bold focus:outline-none focus:border-secondary/50 transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        {/* Match Format Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Format du Match</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => setMatchFormat('custom')}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${matchFormat === 'custom' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-high border-white/5 text-white/40'}`}
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
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Périodes</label>
                  <div className="flex items-center gap-2 bg-surface-high rounded-xl p-1 border border-white/5">
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.max(1, c - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-white/60"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-white tabular-nums">{customPeriodCount}</span>
                    <button 
                      onClick={() => setCustomPeriodCount((c: number) => Math.min(10, c + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-white/60"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Minutes / Période</label>
                  <div className="flex items-center gap-2 bg-surface-high rounded-xl p-1 border border-white/5">
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.max(1, d - 5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-white/60"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-white tabular-nums">{customPeriodDuration}</span>
                    <button 
                      onClick={() => setCustomPeriodDuration((d: number) => Math.min(120, d + 5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-bright text-white/60"
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
