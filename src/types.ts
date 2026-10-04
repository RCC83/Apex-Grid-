export type Page = 'home' | 'live' | 'history';

export type Team = 'home' | 'away';

export interface PeriodScore {
  home: number;
  away: number;
}

/** Un but enregistré dans le fil du match. */
export interface MatchEvent {
  id: string;
  team: Team;
  periodIndex: number;
  /** Temps du chrono (en secondes) au moment du but. */
  second: number;
  scorer?: string;
}

/** Un match terminé, tel qu'enregistré dans l'historique. */
export interface MatchRecord {
  id: string;
  /** Date de fin (ISO). */
  finishedAt: string;
  homeTeamName: string;
  awayTeamName: string;
  periodCount: number;
  periodDuration: number;
  periodScores: PeriodScore[];
  events: MatchEvent[];
}
