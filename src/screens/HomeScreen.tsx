import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Match } from '../hooks/useMatch';
import { LastResultCard } from '../components/home/LastResultCard';
import { MatchSetupForm } from '../components/home/MatchSetupForm';
import { ShareModal } from '../components/home/ShareModal';
import { buildMatchSummary, type MatchSummary } from '../lib/matchSummary';
import { InstallBanner } from '../components/home/InstallBanner';

export function HomeScreen({ match }: { match: Match }) {
  const { setCurrentPage } = match;
  const [shareSummary, setShareSummary] = useState<MatchSummary | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-3.5 w-full py-1"
    >
      <InstallBanner />
      <LastResultCard match={match} onShare={() => setShareSummary(buildMatchSummary(match.toRecord()))} />
      <ShareModal summary={shareSummary} onClose={() => setShareSummary(null)} />
      <MatchSetupForm match={match} />

      <button 
        onClick={() => setCurrentPage('live')}
        className="w-full mt-2 bg-primary h-13 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,227,253,0.2)] hover:brightness-110 active:scale-95 transition-all group"
      >
        <span className="font-headline font-black text-on-primary uppercase tracking-widest text-sm">
          Rejoindre le Live
        </span>
        <ChevronRight className="w-5 h-5 text-on-primary group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
