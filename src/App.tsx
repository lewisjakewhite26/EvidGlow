import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { BackgroundOrbs } from './components/BackgroundOrbs';
import { Navbar } from './components/Navbar';
import { useFullscreen } from './hooks/useFullscreen';
import { Dashboard } from './screens/Dashboard';
import { Journey } from './screens/Journey';
import { Sensory } from './screens/Sensory';
import { Planner } from './screens/Planner';
import { CheckIn } from './screens/CheckIn';
import { LongTermFocus } from './screens/LongTermFocus';
import { Onboarding, getChildProfile } from './screens/Onboarding';

const THEME_STORAGE_KEY = 'evid_glow_theme';

function readStoredTheme(): 'dark' | 'light' {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function App() {
  const appShellRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(appShellRef);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sensoryInitialMode, setSensoryInitialMode] = useState<'hub' | 'flow' | 'nebula'>('hub');
  const [childProfile, setChildProfile] = useState(() => getChildProfile());
  const [theme, setTheme] = useState<'dark' | 'light'>(readStoredTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('eg-light-body', theme === 'light');
  }, [theme]);

  // Use the child's chosen colour as the app accent (Tailwind `primary` is backed by `--color-primary`).
  useEffect(() => {
    const basePrimary = '#2DD4BF';
    const accentByKey: Record<string, string> = {
      teal: '#2DD4BF',
      blue: '#3B82F6',
      rose: '#FB7185',
      amber: '#FBBF24',
      purple: '#A78BFA',
    };
    const hex = childProfile?.colorKey ? accentByKey[childProfile.colorKey] : undefined;
    const next = hex || basePrimary;
    document.documentElement.style.setProperty('--color-primary', next);
    return () => {
      document.documentElement.style.setProperty('--color-primary', basePrimary);
    };
  }, [childProfile]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'sensory') {
      // Manual navigation should open the hub by default.
      setSensoryInitialMode('hub');
    }
  };

  const renderScreen = () => {
    if (!childProfile) {
      return (
        <Onboarding
          onComplete={(profile) => {
            setChildProfile(profile);
            setActiveTab('dashboard');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            childName={childProfile.nickname}
            childAvatarKey={childProfile.avatarKey}
            onCheckIn={() => setShowCheckIn(true)}
          />
        );
      case 'journey':
        return <Journey />;
      case 'sensory':
        return <Sensory initialMode={sensoryInitialMode} />;
      case 'planner':
        return <Planner />;
      case 'focus':
        return <LongTermFocus />;
      default:
        return (
          <Dashboard
            childName={childProfile?.nickname}
            childAvatarKey={childProfile?.avatarKey}
            onCheckIn={() => setShowCheckIn(true)}
          />
        );
    }
  };

  return (
    <div
      ref={appShellRef}
      className={cn(
        'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden',
        theme === 'light' ? 'eg-light bg-slate-50' : 'bg-[#0a0a0f]'
      )}
    >
      <BackgroundOrbs />
      
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        childName={childProfile?.nickname}
        childAvatarKey={childProfile?.avatarKey}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-0 flex-1 flex-col pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCheckIn && (
          <CheckIn
            onBack={() => setShowCheckIn(false)}
            onStartBreathing={() => {
              setShowCheckIn(false);
              setSensoryInitialMode('nebula');
              setActiveTab('sensory');
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
