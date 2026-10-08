import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import type { Team } from '../../types';

/** Score des deux équipes, avec les boutons − / + sous chaque score. */
export function ScoreControls({ match }: { match: Match }) {
  return (
    <section className="bg-surface-high/80 border border-text/10 rounded-2xl p-4 shadow-md">
      <div className="flex items-start w-full gap-2">
        <TeamScore match={match} team="home" />
        {/* Tiret aligné sur la ligne des chiffres */}
        <div className="h-[64px] mt-[26px] flex items-center flex-shrink-0">
          <span className="font-headline text-2xl sm:text-3xl font-black text-primary/40">-</span>
        </div>
        <TeamScore match={match} team="away" />
      </div>
    </section>
  );
}

function TeamScore({ match, team }: { match: Match; team: Team }) {
  const isHome = team === 'home';
  const score = isHome ? match.homeScore : match.awayScore;
  const name = isHome ? match.homeTeamName || 'DOMICILE' : match.awayTeamName || 'EXTÉRIEUR';
  const label = isHome ? 'Domicile' : 'Extérieur';

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="h-5 flex items-center justify-center w-full overflow-hidden mb-1.5">
        <span className={`text-sm sm:text-base font-black uppercase tracking-wider text-center truncate w-full ${isHome ? 'text-primary' : 'text-secondary'}`}>
          {name}
        </span>
      </div>

      {/* Case de largeur fixe : le score change sans faire bouger les boutons */}
      <div className="h-[64px] w-full relative flex items-center justify-center overflow-hidden">
        <motion.span
          key={`${team}-${score}`}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={`font-headline font-black text-text tabular-nums leading-none ${score >= 100 ? 'text-5xl' : 'text-6xl'}`}
        >
          {score}
        </motion.span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => match.removeGoal(team)}
          className="w-14 h-12 rounded-xl bg-surface-bright text-text-muted hover:text-text border border-text/5 flex items-center justify-center active:scale-95 transition-all shadow-sm"
          title={`-1 ${label}`}
          aria-label={`-1 ${label}`}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => match.addGoal(team)}
          className="w-14 h-12 rounded-xl bg-primary text-on-primary shadow-md hover:brightness-110 flex items-center justify-center active:scale-95 transition-all"
          title={`+1 ${label}`}
          aria-label={`+1 ${label}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
