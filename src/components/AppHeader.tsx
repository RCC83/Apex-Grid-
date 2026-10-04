import { motion } from 'motion/react';
import { Trophy, Sun, Moon } from 'lucide-react';
import type { Match } from '../hooks/useMatch';

export function AppHeader({ match }: { match: Match }) {
  const { theme, setTheme, setCurrentPage } = match;

  return (
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/90 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between px-4 h-14">
          {/* Logo Section (Left) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 z-10 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-[0_3px_10px_rgba(0,227,253,0.25)] border border-white/10">
              <Trophy className="w-4 h-4 text-on-primary" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-text font-headline font-black italic tracking-tighter text-sm leading-none">
                SCOREBOARD
              </span>
              <span className="text-primary font-headline font-black italic tracking-tighter text-sm leading-none">
                LIVE
              </span>
            </div>
          </motion.div>

          {/* Actions Section (Right) */}
          <div className="flex items-center z-10">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-surface-bright text-text-muted hover:text-primary transition-all active:scale-90"
              aria-label="Changer de thème"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
  );
}
