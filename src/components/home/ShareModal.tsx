import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Download, Loader2, Share2, X } from 'lucide-react';
import type { Match } from '../../hooks/useMatch';
import { buildMatchSummary, buildShareText } from '../../lib/matchSummary';
import { renderResultImage } from '../../lib/shareImage';

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'equipe';

/** Aperçu de l'image du résultat ; l'utilisateur choisit ensuite de la partager ou de la télécharger. */
export function ShareModal({ match, open, onClose }: { match: Match; open: boolean; onClose: () => void }) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const summary = useMemo(() => (open ? buildMatchSummary(match) : null), [open]);
  const fileName = summary ? `score-${slug(summary.home)}-${slug(summary.away)}.png` : 'score.png';

  useEffect(() => {
    if (!summary) return;
    let url: string | null = null;
    let cancelled = false;
    setError(false);
    renderResultImage(summary)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch((err) => {
        console.error('Share image error:', err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setImage(null);
    };
  }, [summary]);

  const file = image ? new File([image.blob], fileName, { type: 'image/png' }) : null;
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleShare = async () => {
    if (!file || !summary) return;
    try {
      await navigator.share({ files: [file], title: `${summary.home} ${summary.homeScore} - ${summary.awayScore} ${summary.away}`, text: buildShareText(summary) });
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Share error:', err);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image.url;
    a.download = fileName;
    a.click();
    flash('Image téléchargée');
  };

  const handleCopyText = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(buildShareText(summary));
      flash('Texte copié');
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-5"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container border border-text/10 rounded-3xl p-4 w-full max-w-sm flex flex-col gap-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-primary uppercase tracking-widest text-sm">Partager le résultat</h3>
              <button onClick={onClose} className="p-1 text-text-muted hover:text-text" aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mx-auto aspect-[9/16] h-[min(52vh,440px)] rounded-2xl overflow-hidden border border-text/10 bg-[#09090b] flex items-center justify-center">
              {image ? (
                <img src={image.url} alt="Aperçu de l'image du résultat" className="w-full h-full object-contain" />
              ) : error ? (
                <p className="text-xs text-text-muted px-4 text-center">L'image n'a pas pu être créée. Vous pouvez copier le texte.</p>
              ) : (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              {canShareFile && (
                <button
                  onClick={handleShare}
                  className="h-12 rounded-xl bg-primary text-on-primary font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Partager l'image
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!image}
                  className={`flex-1 h-11 rounded-xl font-headline font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 ${
                    canShareFile ? 'bg-surface-bright text-text' : 'bg-primary text-on-primary hover:brightness-110'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex-1 h-11 rounded-xl bg-surface-bright text-text font-headline font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copier le texte
                </button>
              </div>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold text-primary flex items-center justify-center gap-1.5 -mt-1"
                >
                  <Check className="w-4 h-4" />
                  {toast}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
