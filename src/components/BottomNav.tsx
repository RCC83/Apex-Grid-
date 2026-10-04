import { History, Home, Timer, type LucideIcon } from 'lucide-react';
import type { Match } from '../hooks/useMatch';
import type { Page } from '../types';

const TABS: { page: Page; label: string; Icon: LucideIcon }[] = [
  { page: 'home', label: 'Accueil', Icon: Home },
  { page: 'live', label: 'Live', Icon: Timer },
  { page: 'history', label: 'Historique', Icon: History },
];

export function BottomNav({ match }: { match: Match }) {
  const { currentPage, setCurrentPage } = match;

  return (
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/95 backdrop-blur-2xl border-t border-white/10 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2 w-full">
          {TABS.map(({ page, label, Icon }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex items-center justify-center gap-1.5 h-11 px-3 sm:px-4 rounded-xl transition-all ${currentPage === page ? 'text-primary bg-primary/10 font-black shadow-sm' : 'text-text-muted hover:text-primary font-bold'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-headline text-[11px] uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </nav>
  );
}
