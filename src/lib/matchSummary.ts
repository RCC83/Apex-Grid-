import type { MatchEvent, MatchRecord, Team } from '../types';
import { formatEventMinute, getPeriodShortName, teamLabel } from './periods';
import { recordScore } from './history';

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

const scorerLine = (events: MatchEvent[], team: Team, periodDuration: number) => {
  const goals = events.filter((e) => e.team === team).sort((a, b) => a.second - b.second);
  const named = new Map<string, string[]>();
  const unnamed: string[] = [];
  for (const goal of goals) {
    const minute = formatEventMinute(goal.second, goal.periodIndex, periodDuration);
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

export const buildMatchSummary = (record: MatchRecord): MatchSummary => {
  const score = recordScore(record);
  return {
    home: teamLabel(record.homeTeamName, 'Domicile'),
    away: teamLabel(record.awayTeamName, 'Extérieur'),
    homeScore: score.home,
    awayScore: score.away,
    periods: record.periodScores.map((p, i) => ({
      label: getPeriodShortName(i, record.periodCount),
      home: p?.home ?? 0,
      away: p?.away ?? 0,
    })),
    scorers: {
      home: scorerLine(record.events, 'home', record.periodDuration),
      away: scorerLine(record.events, 'away', record.periodDuration),
    },
    date: new Date(record.finishedAt).toLocaleDateString('fr-FR'),
  };
};

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
