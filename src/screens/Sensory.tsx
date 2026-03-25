import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Waves } from 'lucide-react';
import { cn } from '../lib/utils';
import { SensoryFlowView } from './SensoryFlowView';
import NebulaSphere from '@/Components/NebulaSphere/NebulaSphere.jsx';

type SensoryMode = 'hub' | 'flow' | 'nebula';

const nebulaMoods = [
  { key: 'teal' as const, name: 'Teal', value: '#2DD4BF' },
  { key: 'blue' as const, name: 'Blue', value: '#3B82F6' },
  { key: 'rose' as const, name: 'Rose', value: '#FB7185' },
  { key: 'amber' as const, name: 'Amber', value: '#FBBF24' },
  { key: 'purple' as const, name: 'Purple', value: '#A78BFA' },
];

function SensoryNebulaView({ onBack }: { onBack: () => void }) {
  const [mood, setMood] = useState<(typeof nebulaMoods)[number]['key']>('teal');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-col gap-3 p-4 pb-8 sm:p-8"
    >
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sensory home
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-col gap-4 md:flex-row md:gap-6">
        <aside className="flex shrink-0 justify-center md:w-24 md:flex-col md:justify-start">
          <div className="glass-panel flex w-full flex-row flex-wrap justify-center gap-3 rounded-[32px] px-3 py-4 md:w-24 md:flex-col md:items-center md:gap-8 md:px-0 md:py-8">
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 md:flex-col md:gap-4">
              {nebulaMoods.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  title={m.name}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    'w-12 h-12 rounded-full border-2 transition-all hover:scale-110 shadow-lg',
                    mood === m.key
                      ? 'border-white scale-110 ring-4 ring-white/20'
                      : 'border-white/10'
                  )}
                  style={{ backgroundColor: m.value }}
                />
              ))}
            </div>
          </div>
        </aside>

        <section className="relative min-h-[min(52svh,320px)] h-[min(58svh,480px)] w-full min-w-0 overflow-hidden rounded-[32px] glass-panel p-2 md:h-[min(calc(100svh-220px),720px)] md:min-h-[min(420px,calc(100svh-220px))] md:flex-1">
          <div className="pointer-events-none absolute left-6 top-4 z-20 sm:left-8 sm:top-6">
            <h2 className="text-xl font-bold tracking-tight text-white/80 sm:text-2xl">Nebula Sphere</h2>
          </div>

          <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-900">
            <NebulaSphere
              mood={mood}
              showMoodPicker={false}
              style={{
                borderRadius: 24,
                minHeight: '100%',
                height: '100%',
                width: '100%',
                background: '#0f172a',
              }}
            />
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export const Sensory = () => {
  const [mode, setMode] = useState<SensoryMode>('hub');

  if (mode === 'flow') {
    return <SensoryFlowView onBack={() => setMode('hub')} />;
  }

  if (mode === 'nebula') {
    return <SensoryNebulaView onBack={() => setMode('hub')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col p-4 pb-10 sm:p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Sensory</h2>
        <p className="mt-2 text-sm text-white/50 max-w-xl">
          Choose a space — paint with fluid motion, or explore a breathing nebula sphere.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 flex-1 min-h-0 auto-rows-fr max-w-5xl">
        <button
          type="button"
          onClick={() => setMode('flow')}
          className={cn(
            'glass-panel rounded-[32px] p-8 text-left flex flex-col gap-4',
            'transition-all hover:scale-[1.02] hover:ring-2 hover:ring-primary/40',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/15 text-primary">
              <Waves className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-white">Sensory Flow</span>
          </div>
          <p className="text-sm text-white/50 flex-1 leading-relaxed">
            Fluid canvas with moods, clouds, and wind — touch or drag to spread colour.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('nebula')}
          className={cn(
            'glass-panel rounded-[32px] p-8 text-left flex flex-col gap-4',
            'transition-all hover:scale-[1.02] hover:ring-2 hover:ring-primary/40',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-500/15 text-violet-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-white">Nebula Sphere</span>
          </div>
          <p className="text-sm text-white/50 flex-1 leading-relaxed">
            A 3D nebula that responds to your mood and movement — calm, immersive focus.
          </p>
        </button>
      </div>
    </motion.div>
  );
};
