import { LOGO } from '../lib/logo';

/** Logo de l'app (carré arrondi cyan). La taille se règle avec className (ex. « w-9 h-9 »). */
export function Logo({ className = '' }: { className?: string }) {
  const { size, radius, background, ink, track, progress, letter } = LOGO;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label="ScoreBoard Live">
      <rect width={size} height={size} rx={radius} fill={background} />
      <circle cx={track.cx} cy={track.cy} r={track.r} fill="none" stroke={ink} strokeOpacity={track.opacity} strokeWidth={track.width} />
      <path d={progress.d} fill="none" stroke={ink} strokeWidth={progress.width} strokeLinecap="round" />
      <path d={letter.d} fill="none" stroke={ink} strokeWidth={letter.width} strokeLinecap="round" />
    </svg>
  );
}
