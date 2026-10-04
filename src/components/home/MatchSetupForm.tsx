import { Plus, Minus, Shield } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import { getPeriodName } from '../../lib/periods';

/** Noms des équipes, nombre et durée des périodes. */
export function MatchSetupForm({ match }: { match: Match }) {
  const { homeTeamName, setHomeTeamName, awayTeamName, setAwayTeamName, periodCount, setPeriodCount, periodDuration, setPeriodDuration } = match;

  return (
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
  );
}
