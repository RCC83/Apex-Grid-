import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, History, Share2, Trash2 } from 'lucide-react';
import type { Match } from '../hooks/useMatch';
import type { MatchRecord } from '../types';
import { recordScore } from '../lib/history';
import { formatEventMinute, getPeriodShortName, teamLabel } from '../lib/periods';
import { buildMatchSummary, type MatchSummary } from '../lib/matchSummary';
import { ShareModal } from '../components/home/ShareModal';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const formatDay = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

const formatHour = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function HistoryScreen({ match }: { match: Match }) {
  const { history } = match;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = history.find((r) => r.id === selectedId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-3 w-full py-1"
    >
      <AnimatePresence mode="wait" initial={false}>
        {selected ? (
          <MatchDetail key="detail" match={match} record={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h2 className="font-headline font-black uppercase tracking-wider text-sm">Historique</h2>
              </div>
              {history.length > 0 && (
                <span className="text-[10px] text-text-dim font-bold bg-surface-high px-2 py-0.5 rounded-md border border-text/5">
                  {history.length} {history.length > 1 ? 'matchs' : 'match'}
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-surface-high/90 border border-text/10 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
                <History className="w-8 h-8 text-text-dim" />
                <div>
                  <p className="font-black text-sm">Aucun match pour l'instant</p>
                  <p className="text-xs text-text-muted mt-1">Chaque match terminé avec « Fin du match » est enregistré ici.</p>
                </div>
                <button
                  onClick={() => match.setCurrentPage('home')}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
                >
                  Préparer un match
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {history.map((record) => (
                  <li key={record.id}>
                    <HistoryCard record={record} onOpen={() => setSelectedId(record.id)} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HistoryCard({ record, onOpen }: { record: MatchRecord; onOpen: () => void }) {
  const score = recordScore(record);
  const row = (name: string, value: number, color: string, wins: boolean) => (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm font-bold truncate ${color}`}>{name}</span>
      <span className={`font-headline text-lg tabular-nums leading-tight ${wins ? 'font-black text-text' : 'font-bold text-text-muted'}`}>{value}</span>
    </div>
  );

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-surface-high/90 border border-text/10 rounded-2xl p-3 pl-4 flex items-center gap-3 hover:border-primary/30 active:scale-[0.99] transition-all shadow-sm"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted font-bold mb-1">
          {formatDay(record.finishedAt)} · {formatHour(record.finishedAt)} · {record.periodCount}×{record.periodDuration}
        </p>
        {row(teamLabel(record.homeTeamName, 'Domicile'), score.home, 'text-primary', score.home > score.away)}
        {row(teamLabel(record.awayTeamName, 'Extérieur'), score.away, 'text-secondary', score.away > score.home)}
      </div>
      <ChevronRight className="w-4 h-4 text-text-dim flex-shrink-0" />
    </button>
  );
}

function MatchDetail({ match, record, onBack }: { match: Match; record: MatchRecord; onBack: () => void }) {
  const [shareSummary, setShareSummary] = useState<MatchSummary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const score = recordScore(record);
  const home = teamLabel(record.homeTeamName, 'Domicile');
  const away = teamLabel(record.awayTeamName, 'Extérieur');
  const goals = [...record.events].sort((a, b) => a.second - b.second);

  const remove = () => {
    match.deleteFromHistory(record.id);
    onBack();
  };

  return (
    <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-3">
      <button onClick={onBack} className="self-start flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary px-1 py-1">
        <ChevronLeft className="w-4 h-4" />
        Historique
      </button>

      <section className="bg-surface-high/90 border border-text/10 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
        <p className="text-[11px] text-text-muted font-bold text-center">
          {new Date(record.finishedAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {formatHour(record.finishedAt)}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="flex-1 text-right text-sm font-black uppercase tracking-wider text-primary truncate">{home}</span>
          <div className="flex items-center gap-2.5 bg-surface px-4 py-2 rounded-xl border border-text/5">
            <span className="font-headline text-3xl font-black tabular-nums">{score.home}</span>
            <span className="text-text-dim font-bold">-</span>
            <span className="font-headline text-3xl font-black tabular-nums">{score.away}</span>
          </div>
          <span className="flex-1 text-left text-sm font-black uppercase tracking-wider text-secondary truncate">{away}</span>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {record.periodScores.map((p, i) => (
            <span key={i} className="text-xs font-bold bg-surface px-3 py-1.5 rounded-lg border border-text/10 text-text-muted flex items-center gap-1.5">
              <span className="text-text-dim uppercase text-[10px] font-black">{getPeriodShortName(i, record.periodCount)}</span>
              <strong className="text-primary font-black">{p?.home ?? 0}</strong>-<strong className="text-secondary font-black">{p?.away ?? 0}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="bg-surface-high/90 border border-text/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-1 shadow-md">
        <span className="text-[11px] font-black uppercase tracking-wider text-text-muted px-1 mb-1">Buts</span>
        {goals.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-2">Aucun but enregistré dans le fil.</p>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="flex items-center gap-2.5 py-1.5 px-1 border-b border-text/5 last:border-0">
              <span className="w-11 text-xs font-bold text-text-muted tabular-nums">{formatEventMinute(g.second, g.periodIndex, record.periodDuration)}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${g.team === 'home' ? 'bg-primary' : 'bg-secondary'}`} />
              <span className="text-sm truncate">
                {g.scorer ?? <span className="text-text-muted">{g.team === 'home' ? home : away}</span>}
              </span>
            </div>
          ))
        )}
      </section>

      <div className="flex gap-2">
        <button
          onClick={() => setShareSummary(buildMatchSummary(record))}
          className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </button>
        <button
          onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
          onBlur={() => setConfirmDelete(false)}
          className={`h-12 px-4 rounded-xl font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all ${
            confirmDelete ? 'bg-error text-white' : 'bg-error/10 text-error hover:bg-error/20'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          {confirmDelete ? 'Confirmer' : 'Supprimer'}
        </button>
      </div>

      <ShareModal summary={shareSummary} onClose={() => setShareSummary(null)} />
    </motion.div>
  );
}
