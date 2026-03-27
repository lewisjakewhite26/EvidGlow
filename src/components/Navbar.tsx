import React from 'react';
import { LayoutDashboard, Map, Wind, Calendar, Target, Palette, Maximize2, Minimize2, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChildAvatarIcon } from '../lib/childAvatar';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  childName?: string;
  childAvatarKey?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar = ({
  activeTab,
  onTabChange,
  isFullscreen = false,
  onToggleFullscreen,
  childName,
  childAvatarKey,
  theme = 'dark',
  onToggleTheme,
}: NavbarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journey', label: 'Activity', icon: Map },
    { id: 'sensory', label: 'Sensory', icon: Wind },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'focus', label: 'Goals', icon: Target },
  ];

  return (
    <>
      <header
        className={cn(
          'flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 glass-panel z-50 transition-[margin,border-radius] duration-300',
          isFullscreen
            ? 'mx-0 mt-0 w-full rounded-none border-x-0 border-t-0'
            : 'mx-3 mt-3 rounded-2xl sm:mx-8 sm:mt-6'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Evid Glow</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative py-2 text-sm font-medium transition-colors hover:text-white",
                activeTab === item.id ? "text-primary" : "text-tier-secondary"
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'light'}
            aria-label={theme === 'light' ? 'Use dark theme' : 'Use light theme'}
            title={theme === 'light' ? 'Use dark theme' : 'Use light theme'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              theme === 'light'
                ? 'text-amber-600 bg-amber-100/80 hover:bg-amber-100'
                : 'text-tier-secondary hover:text-tier-primary hover:bg-white/5'
            )}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" aria-hidden />
            ) : (
              <Sun className="w-5 h-5" aria-hidden />
            )}
          </button>
        )}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Super fullscreen'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isFullscreen
                ? 'text-primary bg-primary/15 hover:bg-primary/25'
                : 'text-tier-secondary hover:text-tier-primary hover:bg-white/5'
            )}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" aria-hidden />
            ) : (
              <Maximize2 className="w-5 h-5" aria-hidden />
            )}
          </button>
        )}
        <button
          type="button"
          className="p-2 text-tier-secondary hover:text-tier-primary transition-colors flex items-center gap-2"
          aria-label="Child profile"
        >
          <div className="w-8 h-8 rounded-xl border border-interactive bg-primary/15 flex items-center justify-center">
            <ChildAvatarIcon avatarKey={childAvatarKey} className="w-5 h-5 text-primary" />
          </div>
          <span className="hidden sm:inline text-sm font-bold text-tier-secondary">
            {childName ? childName : 'Child'}
          </span>
        </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-[80] border-t border-interactive bg-midnight/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center justify-center rounded-xl px-1 py-2 transition-colors',
                  isActive ? 'bg-primary/15 text-primary' : 'text-tier-secondary hover:bg-white/5'
                )}
              >
                <span className="flex flex-col items-center gap-1 leading-none">
                  <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                  <span className="text-[11px] font-bold">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
