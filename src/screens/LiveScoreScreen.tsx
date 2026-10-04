import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Tv } from 'lucide-react';
import type { Match } from '../hooks/useMatch';
import { MatchClock } from '../components/live/MatchClock';
import { ScoreControls } from '../components/live/ScoreControls';
import { UndoButton } from '../components/live/UndoButton';
import { EventFeed } from '../components/live/EventFeed';
import { PeriodTable } from '../components/live/PeriodTable';
import { BigScreen, enterBigScreen } from '../components/live/BigScreen';

export function LiveScoreScreen({ match }: { match: Match }) {
  const resetMatch = match.endMatch;
  const [isBigScreen, setIsBigScreen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-3.5 w-full py-1"
    >
      <MatchClock match={match} />
      <ScoreControls match={match} />
      <UndoButton match={match} />
      <EventFeed match={match} />
      <PeriodTable match={match} />

      {/* Action Buttons */}
      <div className="mt-1 flex gap-2">
        <button 
          onClick={() => {
            setIsBigScreen(true);
            enterBigScreen();
          }}
          className="h-12 px-4 rounded-xl bg-surface-high border border-text/10 text-text flex items-center justify-center gap-2 hover:border-primary/40 active:scale-95 transition-all"
          title="Afficher le score en grand, téléphone à l’horizontale"
        >
          <Tv className="w-4 h-4 text-primary" />
          <span className="font-headline font-black uppercase tracking-wider text-xs">Grand écran</span>
        </button>
        <button 
          onClick={resetMatch}
          className="flex-1 bg-gradient-to-r from-primary to-primary-container h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,227,253,0.2)] hover:scale-[1.01] active:scale-95 transition-all group"
        >
          <span className="font-headline font-black text-on-primary uppercase tracking-wider text-xs sm:text-sm">
            Fin du Match
          </span>
          <Flag className="w-4 h-4 text-on-primary/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {isBigScreen && <BigScreen match={match} onClose={() => setIsBigScreen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
