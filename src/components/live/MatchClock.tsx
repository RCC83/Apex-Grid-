import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Edit2, Check, X, AlertCircle } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import { formatTime, getPeriodName } from '../../lib/periods';

/** Carte du chronomètre : temps, période, réglages rapides et saisie manuelle. */
export function MatchClock({ match }: { match: Match }) {
  const { seconds, setSeconds, isActive, setIsActive, periodDuration, totalPeriods, currentPeriodIndex, selectPeriod } = match;
  const resetMatch = match.endMatch;

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

  const handlePeriodChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentPeriodIndex < totalPeriods - 1) {
        selectPeriod(currentPeriodIndex + 1);
      }
    } else {
      if (currentPeriodIndex > 0) {
        selectPeriod(currentPeriodIndex - 1);
      }
    }
  };

  return (
    <>
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
    </>
  );
}
