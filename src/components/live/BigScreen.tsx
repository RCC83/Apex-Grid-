import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Minimize2, Minus, Pause, Play, Plus, RotateCw, Undo2 } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import type { Team } from '../../types';
import { formatTime, getPeriodShortName } from '../../lib/periods';

const CONTROLS_DELAY_MS = 4000;

/** Passe en plein écran paysage. À appeler depuis un clic (exigence des navigateurs). */
export const enterBigScreen = async () => {
  try {
    await document.documentElement.requestFullscreen?.();
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
  } catch {
    // iPhone : pas de plein écran ni de verrouillage, l'affichage couvre quand même la page
  }
};

const leaveBigScreen = () => {
  try {
    screen.orientation.unlock?.();
  } catch {
    // non pris en charge
  }
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
};

/** Tableau de score plein écran façon bandeau télé, avec commandes qui apparaissent au toucher. */
export function BigScreen({ match, onClose }: { match: Match; onClose: () => void }) {
  const { seconds, isActive, setIsActive, homeScore, awayScore, currentPeriodIndex, totalPeriods, periodDuration } = match;
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPortrait, setIsPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_DELAY_MS);
  };

  const close = () => {
    leaveBigScreen();
    onClose();
  };

  useEffect(() => {
    showControls();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Écran toujours allumé pendant l'affichage
    let wakeLock: WakeLockSentinel | null = null;
    const acquireWakeLock = async () => {
      try {
        wakeLock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        // refusé ou non pris en charge
      }
    };
    acquireWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquireWakeLock();
    };

    // Sortie du plein écran par le bouton retour du téléphone → on ferme aussi l'affichage
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) onClose();
    };

    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const onOrientation = () => setIsPortrait(portraitQuery.matches);

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    portraitQuery.addEventListener('change', onOrientation);
    return () => {
      clearTimeout(hideTimer.current);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      portraitQuery.removeEventListener('change', onOrientation);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  const periodDurationSeconds = Math.max(1, periodDuration) * 60;
  const periodEnd = (currentPeriodIndex + 1) * periodDurationSeconds;
  const extraTime = seconds > periodEnd ? seconds - periodEnd : 0;
  const recentGoals = [...match.events].reverse().sort((a, b) => b.second - a.second).slice(0, 4);

  const scoreButtons = (team: Team) => (
    <div className="flex items-center gap-2">
      <ControlButton label={`-1 ${match.teamName(team)}`} onClick={() => match.removeGoal(team)} className="bg-white/10 text-zinc-300">
        <Minus className="w-6 h-6" />
      </ControlButton>
      <ControlButton
        label={`+1 ${match.teamName(team)}`}
        onClick={() => match.addGoal(team)}
        className={team === 'home' ? 'bg-[#81ecff] text-[#003840]' : 'bg-[#ff7436] text-[#3a1505]'}
      >
        <Plus className="w-6 h-6" />
      </ControlButton>
    </div>
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={showControls}
      className="fixed inset-0 z-[300] bg-[#09090b] text-[#fafafa] font-body select-none flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex flex-col items-center gap-[3.5vmin] w-full px-[4vw]">
        {/* Bandeau télé */}
        <div className="flex items-stretch rounded-[2.5vmin] overflow-hidden max-w-full shadow-2xl">
          <TeamTag name={match.teamName('home')} className="bg-[#81ecff] text-[#003840]" />
          <div className="bg-[#18181b] px-[4vmin] py-[1.5vmin] flex items-center gap-[3vmin] font-headline font-black tabular-nums leading-none text-[min(22vmin,13vw)]">
            <AnimatedScore value={homeScore} />
            <span className="text-[#52525b] text-[0.45em]">-</span>
            <AnimatedScore value={awayScore} />
          </div>
          <TeamTag name={match.teamName('away')} className="bg-[#ff7436] text-[#3a1505]" />
        </div>

        {/* Chrono et période */}
        <div className="flex items-center gap-[2.5vmin]">
          <span className="font-headline font-black tabular-nums text-[#81ecff] leading-none text-[min(12vmin,8vw)]">
            {formatTime(seconds)}
          </span>
          {extraTime > 0 && (
            <span className="font-headline font-black tabular-nums text-amber-400 text-[min(5vmin,3.5vw)]">+{formatTime(extraTime)}</span>
          )}
          <span className="font-headline font-black uppercase bg-[#3f3f46] rounded-[1.2vmin] px-[1.8vmin] py-[0.6vmin] text-[min(4.5vmin,3vw)]">
            {getPeriodShortName(currentPeriodIndex, totalPeriods)}
          </span>
          {!isActive && seconds > 0 && (
            <span className="font-headline font-black uppercase text-zinc-500 text-[min(3.6vmin,2.4vw)] tracking-wider">Pause</span>
          )}
        </div>

        {/* Derniers buts */}
        {recentGoals.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-x-[3vmin] gap-y-[1vmin] text-zinc-400 text-[min(3.8vmin,2.6vw)] font-bold">
            {recentGoals.map((g) => (
              <span key={g.id} className="flex items-center gap-[1vmin]">
                <span className={`w-[1.4vmin] h-[1.4vmin] rounded-full ${g.team === 'home' ? 'bg-[#81ecff]' : 'bg-[#ff7436]'}`} />
                {g.scorer ?? match.teamName(g.team)} {match.eventMinute(g)}
              </span>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {controlsVisible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 inset-x-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
              {match.lastActionLabel ? (
                <button
                  onClick={match.undo}
                  className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#81ecff]/40 text-[#81ecff] bg-[#09090b]/80 text-xs font-bold max-w-[60vw]"
                >
                  <Undo2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Annuler : {match.lastActionLabel}</span>
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={close}
                className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 text-zinc-200 text-xs font-black uppercase tracking-wider"
              >
                <Minimize2 className="w-4 h-4" />
                Quitter
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {scoreButtons('home')}
              <ControlButton
                label={isActive ? 'Pause' : 'Lancer le chrono'}
                onClick={() => setIsActive(!isActive)}
                className={isActive ? 'bg-white/10 text-white' : 'bg-[#81ecff] text-[#003840]'}
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              </ControlButton>
              {scoreButtons('away')}
            </div>

            {isPortrait && (
              <p className="absolute bottom-24 inset-x-0 flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-bold">
                <RotateCw className="w-3.5 h-3.5" />
                Tournez le téléphone pour un affichage plus grand
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}

function TeamTag({ name, className }: { name: string; className: string }) {
  return (
    <div className={`flex items-center px-[3vmin] max-w-[26vw] font-headline font-black uppercase tracking-wide text-[min(6.5vmin,4.5vw)] ${className}`}>
      <span className="truncate">{name}</span>
    </div>
  );
}

function AnimatedScore({ value }: { value: number }) {
  return (
    <motion.span key={value} initial={{ y: '0.15em', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
      {value}
    </motion.span>
  );
}

function ControlButton({ label, onClick, className, children }: { label: string; onClick: () => void; className: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg ${className}`}
    >
      {children}
    </button>
  );
}
