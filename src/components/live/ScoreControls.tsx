import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';

/** Score des deux équipes avec les boutons + / −. */
export function ScoreControls({ match }: { match: Match }) {
  const { homeTeamName, awayTeamName, homeScore, awayScore } = match;
  const handleHomeScoreChange = (delta: number) => (delta > 0 ? match.addGoal('home') : match.removeGoal('home'));
  const handleAwayScoreChange = (delta: number) => (delta > 0 ? match.addGoal('away') : match.removeGoal('away'));

  return (
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
  );
}
