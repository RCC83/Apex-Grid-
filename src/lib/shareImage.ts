import type { MatchSummary } from './matchSummary';
import { LOGO } from './logo';

// Image verticale 9:16 (stories, WhatsApp), toujours en thème sombre.
const W = 1080;
const H = 1920;
const PAD = 96;

const C = {
  bg: '#09090b',
  card: '#18181b',
  chip: '#27272a',
  text: '#fafafa',
  muted: '#a1a1aa',
  dim: '#71717a',
  line: 'rgba(250,250,250,0.10)',
  home: '#81ecff',
  away: '#ff7436',
};

const HEADLINE = 'Lexend, Inter, system-ui, sans-serif';
const BODY = 'Inter, system-ui, sans-serif';

const font = (weight: number, size: number, family = HEADLINE) => `${weight} ${size}px ${family}`;

const setSpacing = (ctx: CanvasRenderingContext2D, px: number) => {
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
};

/** Réduit la police jusqu'à ce que le texte tienne dans maxWidth (puis tronque si besoin). */
const fitText = (ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, minSize: number, maxWidth: number) => {
  let s = size;
  ctx.font = font(weight, s);
  while (s > minSize && ctx.measureText(text).width > maxWidth) {
    s -= 2;
    ctx.font = font(weight, s);
  }
  let t = text;
  while (t.length > 1 && ctx.measureText(t).width > maxWidth) t = t.slice(0, -1);
  return t === text ? t : `${t.trimEnd()}…`;
};

/** Découpe un texte en lignes de largeur maxWidth, au plus maxLines (dernière ligne tronquée). */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
};

/** Dessine le logo de l'app (carré cyan, S dans le cercle de chrono) en (x, y), côté size. */
const drawLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const { size: base, radius, background, ink, track, progress, letter } = LOGO;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / base, size / base);
  ctx.fillStyle = background;
  roundRect(ctx, 0, 0, base, base, radius);
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  ctx.globalAlpha = track.opacity;
  ctx.lineWidth = track.width;
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, track.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = progress.width;
  ctx.stroke(new Path2D(progress.d));
  ctx.lineWidth = letter.width;
  ctx.stroke(new Path2D(letter.d));
  ctx.restore();
};

const loadFonts = async () => {
  try {
    await Promise.all([
      document.fonts.load(font(900, 100)),
      document.fonts.load(font(800, 40)),
      document.fonts.load(font(500, 40, BODY)),
      document.fonts.load(font(700, 40, BODY)),
    ]);
  } catch {
    // Polices système en repli
  }
};

export async function renderResultImage(s: MatchSummary): Promise<Blob> {
  await loadFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';

  // Fond + barre aux couleurs des deux équipes
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.home;
  ctx.fillRect(0, 0, W / 2, 18);
  ctx.fillStyle = C.away;
  ctx.fillRect(W / 2, 0, W / 2, 18);

  // En-tête : « Score final » + date
  ctx.textAlign = 'left';
  ctx.fillStyle = C.home;
  ctx.font = font(800, 40);
  setSpacing(ctx, 6);
  ctx.fillText('SCORE FINAL', PAD, 200);
  setSpacing(ctx, 0);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.dim;
  ctx.font = font(500, 38, BODY);
  ctx.fillText(s.date, W - PAD, 200);

  // Bloc score
  const colHome = W * 0.27;
  const colAway = W * 0.73;
  const colWidth = W * 0.42;
  const nameY = 470;
  const scoreY = 760;

  ctx.textAlign = 'center';
  setSpacing(ctx, 2);
  ctx.fillStyle = C.home;
  ctx.fillText(fitText(ctx, s.home.toUpperCase(), 800, 60, 34, colWidth), colHome, nameY);
  ctx.fillStyle = C.away;
  ctx.fillText(fitText(ctx, s.away.toUpperCase(), 800, 60, 34, colWidth), colAway, nameY);
  setSpacing(ctx, 0);

  ctx.fillStyle = C.text;
  ctx.font = font(900, s.homeScore > 99 || s.awayScore > 99 ? 190 : 260);
  ctx.fillText(String(s.homeScore), colHome, scoreY);
  ctx.fillText(String(s.awayScore), colAway, scoreY);
  ctx.fillStyle = '#52525b';
  ctx.font = font(700, 110);
  ctx.fillText('–', W / 2, scoreY - 70);

  // Détail par période (pastilles centrées, sur deux lignes si besoin)
  ctx.font = font(700, 38, BODY);
  const chips = s.periods.map((p) => `${p.label}  ${p.home}-${p.away}`);
  const chipH = 76;
  const gap = 18;
  const widths = chips.map((c) => ctx.measureText(c).width + 56);
  const rows: number[][] = [[]];
  let rowW = 0;
  widths.forEach((w, i) => {
    if (rows[rows.length - 1].length && rowW + gap + w > W - PAD * 2) {
      rows.push([]);
      rowW = 0;
    }
    rowW += (rows[rows.length - 1].length ? gap : 0) + w;
    rows[rows.length - 1].push(i);
  });
  let y = 900;
  for (const row of rows) {
    const total = row.reduce((sum, i) => sum + widths[i], 0) + gap * (row.length - 1);
    let x = (W - total) / 2;
    for (const i of row) {
      ctx.fillStyle = C.chip;
      roundRect(ctx, x, y, widths[i], chipH, 18);
      ctx.fillStyle = C.text;
      ctx.textAlign = 'center';
      ctx.fillText(chips[i], x + widths[i] / 2, y + 52);
      x += widths[i] + gap;
    }
    y += chipH + gap;
  }

  // Buteurs
  y = Math.max(y + 60, 1120);
  if (s.scorers.home || s.scorers.away) {
    ctx.fillStyle = C.line;
    ctx.fillRect(PAD, y, W - PAD * 2, 2);
    y += 90;
    ctx.textAlign = 'left';
    ctx.fillStyle = C.dim;
    ctx.font = font(800, 34);
    setSpacing(ctx, 5);
    ctx.fillText('BUTEURS', PAD, y);
    setSpacing(ctx, 0);
    y += 80;

    const textX = PAD + 44;
    const maxW = W - PAD - textX;
    for (const [line, color] of [[s.scorers.home, C.home], [s.scorers.away, C.away]] as const) {
      if (!line) continue;
      ctx.font = font(500, 42, BODY);
      const lines = wrapText(ctx, line, maxW, 3);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(PAD + 12, y - 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.text;
      for (const l of lines) {
        ctx.fillText(l, textX, y);
        y += 62;
      }
      y += 24;
    }
  }

  // Signature
  const brandY = H - 150;
  drawLogo(ctx, PAD, brandY - 54, 76);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.muted;
  ctx.font = font(800, 40);
  ctx.fillText('ScoreBoard Live', PAD + 104, brandY);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image vide'))), 'image/png')
  );
}
