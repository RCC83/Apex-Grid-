/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence } from 'motion/react';
import { useMatch } from './hooks/useMatch';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { LiveScoreScreen } from './screens/LiveScoreScreen';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <ErrorBoundary>
      <ScoreBoardApp />
    </ErrorBoundary>
  );
}

function ScoreBoardApp() {
  const match = useMatch();

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md w-full mx-auto relative overflow-hidden bg-surface text-text shadow-2xl border-x border-white/5">
      <AppHeader match={match} />

      <main className="pt-16 pb-20 px-4 flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {match.currentPage === 'live' ? (
            <LiveScoreScreen key="live" match={match} />
          ) : (
            <HomeScreen key="home" match={match} />
          )}
        </AnimatePresence>
      </main>

      <BottomNav match={match} />
    </div>
  );
}
