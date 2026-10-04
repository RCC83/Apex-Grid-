import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import type { MatchEvent } from '../../types';

interface ScorerSheetProps {
  match: Match;
  event: MatchEvent | null;
  onClose: () => void;
}

/** Panneau qui monte du bas de l'écran pour nommer le buteur d'un but déjà compté. */
export function ScorerSheet({ match, event, onClose }: ScorerSheetProps) {
  return (
    <AnimatePresence>
      {event && <SheetContent key={event.id} match={match} event={event} onClose={onClose} />}
    </AnimatePresence>
  );
}

function SheetContent({ match, event, onClose }: { match: Match; event: MatchEvent; onClose: () => void }) {
  const [name, setName] = useState(event.scorer ?? '');

  const suggestions = match.knownScorers(event.team).filter((s) => s !== name.trim()).slice(0, 6);
  const teamColor = event.team === 'home' ? 'text-primary' : 'text-secondary';

  const save = () => {
    match.setEventScorer(event.id, name);
    onClose();
  };

  const remove = () => {
    match.deleteEvent(event.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-container border-t border-x border-text/10 rounded-t-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col gap-3 shadow-2xl"
      >
        <div className="w-10 h-1 rounded-full bg-text-dim/60 mx-auto -mt-1 mb-1" />

        <div>
          <h3 className="font-headline font-black text-base">
            But pour <span className={teamColor}>{match.teamName(event.team)}</span> · {match.eventMinute(event)}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Buteur (facultatif)</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex flex-col gap-3"
        >
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Martin"
            maxLength={40}
            className="w-full h-12 bg-surface-high border border-text/10 rounded-xl px-4 text-base font-bold text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-dim/60"
          />

          {suggestions.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="px-3 py-1.5 rounded-full bg-surface-bright text-xs font-bold text-text hover:brightness-110 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={remove}
              className="h-12 px-3.5 rounded-xl text-error bg-error/10 hover:bg-error/20 active:scale-95 transition-all flex items-center justify-center"
              title="Supprimer ce but"
              aria-label="Supprimer ce but"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-surface-bright text-text font-headline font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
            >
              Valider
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
