import type { Match } from '../hooks/useMatch';
import type { Team } from '../types';
import { getPeriodShortName } from './periods';

export interface MatchSummary {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  periods: { label: string; home: number; away: number }[];
  /** Buteurs par équipe, ex. « Diallo 8' · Martin 23', 71' ». Vide si aucun but. */
  scorers: Record<Team, string>;
  date: string;
}

const scorerLine = (match: Match, team: Team) => {
  const goals = match.events.filter((e) => e.team === team).sort((a, b) => a.second - b.second);
  const named = new Map<string, string[]>();
  const unnamed: string[] = [];
  for (const goal of goals) {
    const minute = match.eventMinute(goal);
    if (goal.scorer) {
      named.set(goal.scorer, [...(named.get(goal.scorer) ?? []), minute]);
    } else {
      unnamed.push(minute);
    }
  }
  const parts = [...named].map(([name, minutes]) => `${name} ${minutes.join(', ')}`);
  if (unnamed.length) parts.push(unnamed.join(', '));
  return parts.join(' · ');
};

export const buildMatchSummary = (match: Match): MatchSummary => ({
  home: match.teamName('home'),
  away: match.teamName('away'),
  homeScore: match.homeScore,
  awayScore: match.awayScore,
  periods: match.periodScores.map((p, i) => ({
    label: getPeriodShortName(i, match.periodCount),
    home: p?.home ?? 0,
    away: p?.away ?? 0,
  })),
  scorers: { home: scorerLine(match, 'home'), away: scorerLine(match, 'away') },
  date: new Date().toLocaleDateString('fr-FR'),
});

export const buildShareText = (s: MatchSummary) => {
  const lines = [
    '🏁 Résultat Final',
    `⚽ ${s.home} ${s.homeScore} - ${s.awayScore} ${s.away}`,
    `📊 Détail par période: ${s.periods.map((p) => `${p.label}: ${p.home}-${p.away}`).join(' | ')}`,
  ];
  if (s.scorers.home) lines.push(`🔵 ${s.home} : ${s.scorers.home}`);
  if (s.scorers.away) lines.push(`🟠 ${s.away} : ${s.scorers.away}`);
  lines.push('', 'ScoreBoard Live');
  return lines.join('\n');
};
