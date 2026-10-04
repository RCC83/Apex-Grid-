import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTree, UserPlus } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import { ScorerSheet } from './ScorerSheet';

/** Fil du match : les buts du plus récent au plus ancien. Toucher une ligne pour ajouter le buteur. */
export function EventFeed({ match }: { match: Match }) {
  const { events, eventMinute, teamName } = match;
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingEvent = events.find((e) => e.id === editingId) ?? null;

  // Du plus récent au plus ancien ; à temps égal, le dernier saisi en premier
  const ordered = [...events].reverse().sort((a, b) => b.second - a.second);

  return (
    <section className="bg-surface-high/90 border border-text/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shadow-md">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <ListTree className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">Fil du match</span>
        </div>
        {events.length > 0 && (
          <span className="text-[10px] text-text-dim font-bold bg-surface px-2 py-0.5 rounded-md border border-text/5">
            {events.length} {events.length > 1 ? 'buts' : 'but'}
          </span>
        )}
      </div>

      {ordered.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-3">
          Les buts apparaîtront ici. Touchez un but pour ajouter le buteur.
        </p>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {ordered.map((event) => (
              <motion.li
                key={event.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-text/5 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setEditingId(event.id)}
                  className="w-full flex items-center gap-2.5 py-2 px-1 text-left rounded-lg hover:bg-text/5 active:bg-text/10 transition-colors"
                >
                  <span className="w-11 text-xs font-bold text-text-muted tabular-nums">{eventMinute(event)}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${event.team === 'home' ? 'bg-primary' : 'bg-secondary'}`} />
                  <span className="flex-1 min-w-0 text-sm truncate">
                    <span className="font-bold">But</span>
                    {event.scorer ? (
                      <span className="text-text"> — {event.scorer}</span>
                    ) : (
                      <span className="text-text-muted"> {teamName(event.team)}</span>
                    )}
                  </span>
                  {!event.scorer && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-text-dim uppercase tracking-wider">
                      <UserPlus className="w-3.5 h-3.5" />
                      Buteur
                    </span>
                  )}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ScorerSheet match={match} event={editingEvent} onClose={() => setEditingId(null)} />
    </section>
  );
}
