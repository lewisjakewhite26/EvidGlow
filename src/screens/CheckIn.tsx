import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowLeft, Check, Frown, Moon, Smile, Wind } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAnalysis, MoodScores, AnalysisResult } from '../lib/moodAnalysis';
import { logSessionEvent } from '../lib/sessionEvents';

const moods = [
  { id: 'happy', label: 'Happy', icon: Smile, hex: '#FACC15' },
  { id: 'calm', label: 'Calm', icon: Wind, hex: '#4ADE80' },
  { id: 'worried', label: 'Worried', icon: AlertCircle, hex: '#FB7185' },
  { id: 'sad', label: 'Sad', icon: Frown, hex: '#60A5FA' },
  { id: 'angry', label: 'Angry', icon: Frown, hex: '#F87171' },
  { id: 'tired', label: 'Tired', icon: Moon, hex: '#94A3B8' },
];

const CLOSURE_MESSAGES = [
  'Good check-in. You noticed what is going on.',
  'You did that clearly. Nice work.',
  'Thanks for being honest with yourself.',
  'That is useful information for today.',
  'You took a moment to notice. That helps.',
  'Well done. You named it clearly.',
  'That check-in is now saved.',
  'You handled that calmly.',
  'Clear and simple. Nice work.',
  'You paused and checked in. Good choice.',
  'Good awareness. Keep that going.',
  'You gave this moment your attention.',
  'You were direct. That is strong.',
  'You are tracking how today feels. Good move.',
  'You took this seriously. Nice.',
  'That was a solid check-in.',
  'You made time for yourself.',
  'You noticed it and named it.',
  'Good input. Keep building that habit.',
  'That gives you a clear next step.',
  'You have done your part for this moment.',
  'Nice and steady. Well done.',
  'You checked in with care.',
  'You gave a clear signal to yourself.',
  'That is progress for today.',
  'Good work. You stayed honest.',
  'You just built useful self-awareness.',
  'Strong check-in. Keep it up.',
  'You showed up for this.',
  'You took one useful step.',
  'This helps you understand your day better.',
  'Good pace. Keep it simple like this.',
  'You did this thoughtfully.',
  'You chose clarity over guessing.',
  'That was clean and focused.',
  'You are getting better at this.',
  'Good work noticing your state.',
  'That check-in is complete.',
  'You gave yourself a useful update.',
  'This is a strong routine to keep.',
  'You made a clear record of this moment.',
  'You did exactly what was needed.',
  'You stayed present for this.',
  'Good reset point for the rest of the day.',
  'You captured the moment well.',
  'This gives you something clear to work with.',
  'Nice work. One step at a time.',
  'You handled this with good focus.',
  'You are building consistency here.',
  'That was practical and honest.',
  'Good check-in. Keep moving from here.',
  'You took a useful pause.',
  'You stayed clear and direct.',
  'That is a meaningful update.',
  'You checked in without overthinking it.',
  'Well done. That is real progress.',
  'You now have a clear picture of this moment.',
  'You took ownership of how you feel.',
  'You did this in a calm way.',
  'Good awareness. That matters.',
  'You put words to it. Nice work.',
  'You are learning your patterns.',
  'You stayed honest and grounded.',
  'That was a smart step.',
  'You gave yourself clear feedback.',
];

function pickRandomClosureMessage() {
  return CLOSURE_MESSAGES[Math.floor(Math.random() * CLOSURE_MESSAGES.length)];
}

export const CheckIn = ({
  onBack,
  onStartBreathing,
}: {
  onBack: () => void;
  onStartBreathing?: () => void;
}) => {
  const moodRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [intensityLevel, setIntensityLevel] = useState<'little' | 'some' | 'lot' | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [intensities, setIntensities] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [savedFeeling, setSavedFeeling] = useState<{ label: string; level: number } | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [closureMessage, setClosureMessage] = useState<string>(CLOSURE_MESSAGES[0]);

  const pickIntensityPercent = (level: 'little' | 'some' | 'lot'): number => {
    if (level === 'little') return 35;
    if (level === 'some') return 65;
    return 90;
  };

  const buildScores = (selectedMood: string, intensity: number): MoodScores => {
    const scores = {} as MoodScores;
    moods.forEach((m) => {
      scores[m.id] = m.id === selectedMood ? intensity : 0;
    });
    return scores;
  };

  const runAnalysis = (selectedMood: string, intensity: number) => {
    const result = getAnalysis(buildScores(selectedMood, intensity));
    setAnalysis(result);
    const selectedMoodDef = moods.find((m) => m.id === selectedMood);
    if (!selectedMoodDef) return;
    setSavedFeeling({ label: selectedMoodDef.label, level: intensity });
    logSessionEvent('checkin_saved', {
      mood: selectedMoodDef.id,
      label: selectedMoodDef.label,
      intensity,
    });
    setClosureMessage(pickRandomClosureMessage());
    setStep(3);
  };

  const handleSelectMood = (id: string) => {
    setSelected(id);
    if (!advancedMode) {
      setStep(2);
      return;
    }
    if (!intensities[id]) {
      setIntensities((prev) => ({ ...prev, [id]: 50 }));
    }
  };

  const handleMoodKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number, moodId: string) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (index + 1) % moods.length;
      moodRefs.current[next]?.focus();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (index - 1 + moods.length) % moods.length;
      moodRefs.current[prev]?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectMood(moodId);
    }
  };

  const shortAnalysis = useMemo(() => {
    if (!analysis?.analysis) return '';
    const parts = analysis.analysis.split(/(?<=[.!?])\s+/).filter(Boolean);
    return parts.slice(0, 2).join(' ');
  }, [analysis]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-y-contain bg-midnight p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex sm:items-center sm:justify-center sm:p-6 cursor-default"
      onClick={() => {}}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        className="sticky left-0 top-2 z-[110] mb-3 flex items-center gap-2 text-tier-secondary transition-colors hover:text-tier-primary sm:absolute sm:left-8 sm:top-8 sm:mb-0 sm:gap-4"
        aria-label="Close check-in"
      >
        <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium">Close</span>
      </button>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ layout: { duration: 0.6, type: "spring", damping: 25, stiffness: 120 } }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[640px] flex-col items-center justify-center overflow-y-auto rounded-[32px] glass-panel p-5 md:p-8 min-h-[500px] max-h-[90vh]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <AnimatePresence mode="wait">
          {step !== 3 ? (
            <motion.div
              key="steps"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-tier-primary tracking-tight mb-1">
                  {step === 1 ? 'How are you feeling?' : 'How much?'}
                </h2>
                <p className="text-tier-secondary text-sm font-medium">
                  {step === 1 ? 'Pick one feeling to start.' : 'Pick one. We will save it right away.'}
                </p>
              </div>

              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-[520px] sm:grid-cols-3" role="radiogroup" aria-label="Mood options">
                    {moods.map((mood, idx) => {
                      const isSelected = selected === mood.id;
                      return (
                        <button
                          key={mood.id}
                          ref={(el) => {
                            moodRefs.current[idx] = el;
                          }}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={mood.label}
                          aria-pressed={isSelected}
                          onKeyDown={(e) => handleMoodKeyDown(e, idx, mood.id)}
                          onClick={() => handleSelectMood(mood.id)}
                          className={cn(
                            'min-h-20 rounded-2xl border border-interactive bg-white/5 p-4 transition-all hover:bg-white/10',
                            isSelected && 'border-primary bg-primary/10'
                          )}
                        >
                          <span className="flex flex-col items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                              <mood.icon className="h-5 w-5 text-tier-primary" />
                            </span>
                            <span className="text-sm font-bold text-tier-primary">{mood.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdvancedMode((v) => !v)}
                    className="mt-5 text-sm font-semibold text-tier-secondary underline underline-offset-4"
                  >
                    {advancedMode ? 'Hide more options' : 'More options'}
                  </button>

                  {advancedMode && selected ? (
                    <div className="mt-4 w-full max-w-[360px] space-y-3 rounded-2xl border border-interactive bg-white/5 p-4 text-left">
                      <label className="block text-xs font-bold uppercase tracking-wide text-tier-supporting" htmlFor="advanced-intensity">
                        Intensity
                      </label>
                      <input
                        id="advanced-intensity"
                        type="range"
                        min={0}
                        max={100}
                        value={intensities[selected] ?? 50}
                        onChange={(e) =>
                          setIntensities((prev) => ({ ...prev, [selected]: Number(e.target.value) || 50 }))
                        }
                        className="goal-slider w-full"
                        aria-label="Adjust feeling intensity"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const level = intensities[selected] ?? 50;
                          runAnalysis(selected, level);
                        }}
                        className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-midnight"
                      >
                        Save
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="w-full max-w-[460px] space-y-3">
                  {[
                    { id: 'little' as const, label: 'A little', hint: 'Small feeling' },
                    { id: 'some' as const, label: 'Some', hint: 'Medium feeling' },
                    { id: 'lot' as const, label: 'A lot', hint: 'Big feeling' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={intensityLevel === option.id}
                      onClick={() => {
                        if (!selected) return;
                        setIntensityLevel(option.id);
                        runAnalysis(selected, pickIntensityPercent(option.id));
                      }}
                      className={cn(
                        'w-full rounded-2xl border border-interactive bg-white/5 px-5 py-4 text-left transition-all hover:bg-white/10',
                        intensityLevel === option.id && 'border-primary bg-primary/10'
                      )}
                    >
                      <span className="block text-lg font-extrabold text-tier-primary">{option.label}</span>
                      <span className="block text-sm text-tier-secondary">{option.hint}</span>
                    </button>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-tier-secondary underline underline-offset-4"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center text-center py-4"
            >
              <h3 className="text-3xl md:text-4xl font-black text-tier-primary tracking-tight mb-3 leading-tight">
                Check-in complete
              </h3>

              <div className="space-y-4 mb-8 w-full max-w-[540px] text-left">
                {savedFeeling && (
                  <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/10 px-5 py-3">
                    <p className="text-sm text-tier-primary">
                      You are feeling <span className="font-semibold">{savedFeeling.level}% {savedFeeling.label.toLowerCase()}</span> today.
                    </p>
                  </div>
                )}
                <p className="text-base leading-relaxed text-tier-secondary">
                  {shortAnalysis}
                </p>
                {analysis && analysis.analysis.length > shortAnalysis.length ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowReadMore((v) => !v)}
                      className="text-sm font-semibold text-tier-secondary underline underline-offset-4"
                    >
                      {showReadMore ? 'Read less' : 'Read more'}
                    </button>
                    {showReadMore ? <p className="mt-2 text-sm text-tier-secondary">{analysis.analysis}</p> : null}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-interactive bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-tier-supporting">Today's tip</p>
                  <p className="mt-1 text-base font-semibold text-tier-primary">{analysis?.tip}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (onStartBreathing) {
                      logSessionEvent('breathing_started', { source: 'checkin_closure' });
                      onStartBreathing();
                    }
                  }}
                  className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-midnight transition-all hover:bg-primary/85"
                >
                  Try 1-minute breathing
                </button>
                <button
                  onClick={onBack}
                  className="group relative flex items-center gap-4 rounded-full border border-interactive bg-white/5 px-8 py-4 transition-all hover:bg-white/10 active:scale-95"
                >
                  <span className="font-black uppercase tracking-[0.2em] text-xs text-tier-primary">Done</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Check className="w-4 h-4 text-tier-primary" />
                  </div>
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-tier-secondary">
                {closureMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
