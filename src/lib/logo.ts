// Logo ScoreBoard Live : un S dans un cercle de chrono en marche, sur fond cyan.
// Coordonnées dans un carré de 96 × 96. Utilisé par <Logo />, l'image partagée et les icônes (public/icons).

export const LOGO = {
  size: 96,
  radius: 24,
  background: '#81ecff',
  ink: '#003840',
  /** Cercle complet du chrono, en transparence */
  track: { cx: 48, cy: 48, r: 30, width: 7, opacity: 0.25 },
  /** Portion du cercle déjà « parcourue » */
  progress: { d: 'M48 18A30 30 0 0 1 76.5 38.7', width: 7 },
  /** Le S central, d'un seul trait */
  letter: { d: 'M56.5 34.5A9.5 9.5 0 1 0 48 48A9.5 9.5 0 1 1 39.5 61.5', width: 7.5 },
} as const;
