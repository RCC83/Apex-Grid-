export type Page = 'home' | 'live';

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
