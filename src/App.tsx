import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundOrbs } from './components/BackgroundOrbs';
import { Navbar } from './components/Navbar';
import { useFullscreen } from './hooks/useFullscreen';
import { Dashboard } from './screens/Dashboard';
import { Journey } from './screens/Journey';
import { Sensory } from './screens/Sensory';
import { Planner } from './screens/Planner';
import { CheckIn } from './screens/CheckIn';
import { LongTermFocus } from './screens/LongTermFocus';

export default function App() {
  const appShellRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(appShellRef);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCheckIn, setShowCheckIn] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onCheckIn={() => setShowCheckIn(true)} />;
      case 'journey':
        return <Journey />;
      case 'sensory':
        return <Sensory />;
      case 'planner':
        return <Planner />;
      case 'focus':
        return <LongTermFocus />;
      default:
        return <Dashboard onCheckIn={() => setShowCheckIn(true)} />;
    }
  };

  return (
    <div
      ref={appShellRef}
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0a0a0f]"
    >
      <BackgroundOrbs />
      
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCheckIn && (
          <CheckIn onBack={() => setShowCheckIn(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}
