import React from 'react';
import { LayoutDashboard, Map, Wind, Calendar, User, Target, Palette, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Navbar = ({ activeTab, onTabChange, isFullscreen = false, onToggleFullscreen }: NavbarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journey', label: 'Journey', icon: Map },
    { id: 'sensory', label: 'Sensory', icon: Wind },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Target },
  ];

  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 sm:px-8 py-4 glass-panel z-50 transition-[margin,border-radius] duration-300',
        isFullscreen
          ? 'mx-0 mt-0 w-full rounded-none border-x-0 border-t-0'
          : 'rounded-2xl mx-8 mt-6'
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
              activeTab === item.id ? "text-primary" : "text-white/60"
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
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Super fullscreen'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isFullscreen
                ? 'text-primary bg-primary/15 hover:bg-primary/25'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" aria-hidden />
            ) : (
              <Maximize2 className="w-5 h-5" aria-hidden />
            )}
          </button>
        )}
        <button type="button" className="p-2 text-white/60 hover:text-white transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
