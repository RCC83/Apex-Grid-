import { Home, Timer } from 'lucide-react';
import type { Match } from '../hooks/useMatch';

export function BottomNav({ match }: { match: Match }) {
  const { currentPage, setCurrentPage } = match;

  return (
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/95 backdrop-blur-2xl border-t border-white/10 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-4 w-full">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl transition-all ${currentPage === 'home' ? 'text-primary bg-primary/10 font-black shadow-sm' : 'text-text-muted hover:text-primary font-bold'}`}
          >
            <Home className="w-5 h-5" />
            <span className="font-headline text-xs uppercase tracking-wider">Accueil</span>
          </button>
          <button 
            onClick={() => setCurrentPage('live')}
            className={`flex items-center justify-center gap-2 h-11 px-5 rounded-xl transition-all ${currentPage === 'live' ? 'text-primary bg-primary/10 font-black shadow-sm' : 'text-text-muted hover:text-primary font-bold'}`}
          >
            <Timer className="w-5 h-5" />
            <span className="font-headline text-xs uppercase tracking-wider">Live Score</span>
          </button>
        </div>
      </nav>
  );
}
