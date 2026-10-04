import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Share2 } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import type { PeriodScore } from '../../types';
import { getPeriodShortName } from '../../lib/periods';

/** Carte « Dernier résultat » affichée sur l'accueil une fois le match terminé. */
export function LastResultCard({ match, onShare }: { match: Match; onShare: () => void }) {
  const { isMatchFinished, homeTeamName, awayTeamName, homeScore, awayScore, periodScores, periodCount, clearAll } = match;
  const handleShareResult = onShare;

  return (
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
  );
}
