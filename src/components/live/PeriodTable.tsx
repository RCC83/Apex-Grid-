import { ListOrdered } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import { getPeriodName, getPeriodShortName } from '../../lib/periods';

/** Tableau des scores par période ; un clic sur une période y place le chrono. */
export function PeriodTable({ match }: { match: Match }) {
  const { homeTeamName, awayTeamName, homeScore, awayScore, periodScores, totalPeriods, periodDuration, currentPeriodIndex } = match;
  const handleSelectPeriod = match.selectPeriod;

  return (
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
  );
}
