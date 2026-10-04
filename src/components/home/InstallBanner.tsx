import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, X } from 'lucide-react';

const DISMISS_KEY = 'scoreboard_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

/** Propose d'installer l'app sur l'écran d'accueil (Android/Chrome : bouton ; iPhone : mode d'emploi). */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => isStandalone() || wasDismissed());
  const showIosHint = !hidden && !promptEvent && isIos();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignoré
    }
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    if (outcome === 'accepted') setHidden(true);
  };

  const visible = !hidden && (!!promptEvent || showIosHint);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 bg-surface-high/90 border border-primary/20 rounded-2xl p-3 shadow-sm">
            <img src="/icons/icon-192.png" alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black">Installer l'app</p>
              {promptEvent ? (
                <p className="text-xs text-text-muted">Sur l'écran d'accueil, utilisable sans réseau.</p>
              ) : (
                <p className="text-xs text-text-muted">
                  Touchez <Share className="inline w-3.5 h-3.5 -mt-0.5" /> puis « Sur l'écran d'accueil ».
                </p>
              )}
            </div>
            {promptEvent && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Installer</span>
              </button>
            )}
            <button onClick={dismiss} className="p-1 text-text-dim hover:text-text" aria-label="Masquer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
