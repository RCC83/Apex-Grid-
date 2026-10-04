import { motion, AnimatePresence } from 'motion/react';
import { Undo2 } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';

/** Pastille « Annuler : … » qui indique toujours ce qu'elle va défaire. */
export function UndoButton({ match }: { match: Match }) {
  const { lastActionLabel, undo } = match;

  return (
    <AnimatePresence initial={false}>
      {lastActionLabel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex justify-center -my-1 overflow-hidden"
        >
          <button
            type="button"
            onClick={undo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 my-1 rounded-full border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all text-xs font-bold max-w-full"
            title="Annuler la dernière action"
          >
            <Undo2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Annuler : {lastActionLabel}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
