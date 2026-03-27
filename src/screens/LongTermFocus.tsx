import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Plus, Repeat2, Target, Trophy, CalendarDays, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { logSessionEvent } from '../lib/sessionEvents';

interface Habit {
  id: string;
  text: string;
  periodType: 'week' | 'fortnight' | 'month' | 'custom';
  durationDays: number;
  startDate: string;
  endDate: string;
  checkIns: Record<string, boolean>;
  successTarget: number;
  color: 'green' | 'blue' | 'amber' | 'purple' | 'coral' | 'teal';
  category: string;
}

type PeriodPreset = 'week' | 'fortnight' | 'month' | 'custom';
type TargetPreset = 'every' | 'most' | 'half' | 'custom';

const STORAGE_KEY = 'evid-glow-habits';

/** Custom goal length slider: 1 day up to ~2 months. */
const MAX_CUSTOM_GOAL_DAYS = 60;

const COLOUR_THEMES: Record<
  Habit['color'],
  {
    card: string;
    border: string;
    fill: string;
    badge: string;
    badgeText: string;
    strongText: string;
    softText: string;
    checkinBg: string;
    checkinBorder: string;
  }
> = {
  green: {
    card: 'bg-emerald-500/15',
    border: 'border-emerald-400/45',
    fill: 'bg-emerald-500',
    badge: 'bg-emerald-400/20',
    badgeText: 'text-emerald-100',
    strongText: 'text-emerald-100',
    softText: 'text-emerald-100/80',
    checkinBg: 'bg-emerald-500/10',
    checkinBorder: 'border-emerald-400/40',
  },
  blue: {
    card: 'bg-sky-500/15',
    border: 'border-sky-400/45',
    fill: 'bg-sky-500',
    badge: 'bg-sky-400/20',
    badgeText: 'text-sky-100',
    strongText: 'text-sky-100',
    softText: 'text-sky-100/80',
    checkinBg: 'bg-sky-500/10',
    checkinBorder: 'border-sky-400/40',
  },
  amber: {
    card: 'bg-amber-500/15',
    border: 'border-amber-400/45',
    fill: 'bg-amber-500',
    badge: 'bg-amber-400/20',
    badgeText: 'text-amber-100',
    strongText: 'text-amber-100',
    softText: 'text-amber-100/80',
    checkinBg: 'bg-amber-500/10',
    checkinBorder: 'border-amber-400/40',
  },
  purple: {
    card: 'bg-purple-500/15',
    border: 'border-purple-400/45',
    fill: 'bg-purple-500',
    badge: 'bg-purple-400/20',
    badgeText: 'text-purple-100',
    strongText: 'text-purple-100',
    softText: 'text-purple-100/80',
    checkinBg: 'bg-purple-500/10',
    checkinBorder: 'border-purple-400/40',
  },
  coral: {
    card: 'bg-orange-500/15',
    border: 'border-orange-400/45',
    fill: 'bg-orange-500',
    badge: 'bg-orange-400/20',
    badgeText: 'text-orange-100',
    strongText: 'text-orange-100',
    softText: 'text-orange-100/80',
    checkinBg: 'bg-orange-500/10',
    checkinBorder: 'border-orange-400/40',
  },
  teal: {
    card: 'bg-teal-500/15',
    border: 'border-teal-400/45',
    fill: 'bg-teal-500',
    badge: 'bg-teal-400/20',
    badgeText: 'text-teal-100',
    strongText: 'text-teal-100',
    softText: 'text-teal-100/80',
    checkinBg: 'bg-teal-500/10',
    checkinBorder: 'border-teal-400/40',
  },
};

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(isoDate: string, daysToAdd: number): string {
  const d = parseIsoDate(isoDate);
  d.setDate(d.getDate() + daysToAdd);
  return toIsoDate(d);
}

function calculateProgress(habit: Habit): { done: number; total: number; percent: number } {
  const today = startOfToday();
  const start = parseIsoDate(habit.startDate);
  const end = parseIsoDate(habit.endDate);
  const currentEnd = today < end ? today : end;

  let total = 0;
  let done = 0;
  const cursor = new Date(start);
  while (cursor <= currentEnd) {
    total += 1;
    const key = toIsoDate(cursor);
    if (habit.checkIns[key]) done += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

function getDaysLeft(habit: Habit): number {
  const today = startOfToday();
  const end = parseIsoDate(habit.endDate);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function habitDates(habit: Habit): string[] {
  const out: string[] = [];
  const start = parseIsoDate(habit.startDate);
  for (let i = 0; i < habit.durationDays; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toIsoDate(d));
  }
  return out;
}

function formatStarted(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function formatDayName(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, { weekday: 'long' });
}

function badgeLabel(habit: Habit): string {
  if (habit.periodType === 'month') return 'This month';
  if (habit.periodType === 'fortnight') return '2 weeks';
  if (habit.periodType === 'week') return '1 week';
  return `${habit.durationDays} days`;
}

function targetLabel(habit: Habit): string {
  return `${habit.successTarget}% of days`;
}

function isComplete(habit: Habit): boolean {
  return startOfToday() > parseIsoDate(habit.endDate);
}

export const LongTermFocus = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftPeriod, setDraftPeriod] = useState<PeriodPreset>('fortnight');
  const [draftCustomDays, setDraftCustomDays] = useState(10);
  const [draftTargetPreset, setDraftTargetPreset] = useState<TargetPreset>('most');
  const [draftCustomTarget, setDraftCustomTarget] = useState(80);
  const [draftColour, setDraftColour] = useState<Habit['color']>('green');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Habit[];
      if (!Array.isArray(parsed)) return;
      setHabits(parsed);
    } catch {
      /* ignore bad storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const nextRotationColour = useMemo<Habit['color']>(() => {
    const keys = Object.keys(COLOUR_THEMES) as Habit['color'][];
    return keys[habits.length % keys.length];
  }, [habits.length]);

  useEffect(() => {
    setDraftColour(nextRotationColour);
  }, [nextRotationColour, showAddHabit]);

  const activeHabits = habits.filter((h) => !isComplete(h));
  const finishedHabits = habits.filter((h) => isComplete(h));

  const showCelebration = (text: string) => {
    setCelebrationText(text);
    window.setTimeout(() => setCelebrationText(null), 2200);
  };

  const computeDuration = (): number => {
    if (draftPeriod === 'week') return 7;
    if (draftPeriod === 'fortnight') return 14;
    if (draftPeriod === 'month') return 30;
    return Math.min(MAX_CUSTOM_GOAL_DAYS, Math.max(1, draftCustomDays));
  };

  const computeTarget = (): number => {
    if (draftTargetPreset === 'every') return 100;
    if (draftTargetPreset === 'most') return 80;
    if (draftTargetPreset === 'half') return 50;
    return Math.min(100, Math.max(1, draftCustomTarget));
  };

  const createHabit = () => {
    const text = draftText.trim();
    if (!text) return;
    const today = toIsoDate(startOfToday());
    const durationDays = computeDuration();
    const target = computeTarget();
    const habit: Habit = {
      id: Math.random().toString(36).slice(2, 11),
      text,
      periodType: draftPeriod,
      durationDays,
      startDate: today,
      endDate: addDays(today, durationDays - 1),
      checkIns: {},
      successTarget: target,
      color: draftColour,
      category: 'General',
    };
    setHabits((prev) => [habit, ...prev]);
    setShowAddHabit(false);
    setDraftText('');
    setDraftPeriod('fortnight');
    setDraftCustomDays(10);
    setDraftTargetPreset('most');
    setDraftCustomTarget(80);
    showCelebration(`Started: ${habit.text}`);
    logSessionEvent('goal_plan_created', {
      habitId: habit.id,
      text: habit.text,
      durationDays: habit.durationDays,
      target: habit.successTarget,
    });
  };

  const toggleTodayCheckIn = (habitId: string) => {
    const todayKey = toIsoDate(startOfToday());
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const next = { ...h.checkIns };
        if (next[todayKey]) {
          delete next[todayKey];
          return { ...h, checkIns: next };
        }
        next[todayKey] = true;
        showCelebration(`Nice work: ${h.text}`);
        logSessionEvent('goal_completed', {
          habitId: h.id,
          text: h.text,
          date: todayKey,
        });
        return { ...h, checkIns: next };
      })
    );
  };

  const repeatHabit = (habit: Habit) => {
    const today = toIsoDate(startOfToday());
    const nextHabit: Habit = {
      ...habit,
      id: Math.random().toString(36).slice(2, 11),
      startDate: today,
      endDate: addDays(today, habit.durationDays - 1),
      checkIns: {},
    };
    setHabits((prev) => [nextHabit, ...prev]);
    showCelebration(`Started again: ${habit.text}`);
    logSessionEvent('goal_plan_created', {
      habitId: nextHabit.id,
      text: nextHabit.text,
      durationDays: nextHabit.durationDays,
      target: nextHabit.successTarget,
      repeatedFrom: habit.id,
    });
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const renderHabitCard = (habit: Habit) => {
    const theme = COLOUR_THEMES[habit.color];
    const progress = calculateProgress(habit);
    const daysLeft = getDaysLeft(habit);
    const todayKey = toIsoDate(startOfToday());
    const checkedToday = !!habit.checkIns[todayKey];
    const dates = habitDates(habit);
    const finished = isComplete(habit);
    const hitTarget = progress.percent >= habit.successTarget;

    return (
      <motion.div
        key={habit.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl border-2 p-5 sm:p-6',
          theme.card,
          theme.border
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-extrabold text-white">{habit.text}</h3>
            <p className={cn('mt-1 text-[13px]', theme.softText)}>
              Started {formatStarted(habit.startDate)} · {daysLeft} days left
            </p>
          </div>
          <div className={cn('rounded-full px-3 py-1 text-xs font-bold', theme.badge, theme.badgeText)}>
            {badgeLabel(habit)}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-white/80">
            <span>{progress.done} out of {Math.max(progress.total, 1)} days</span>
            <span>{progress.percent}%</span>
          </div>
          <div
            className="h-[14px] w-full overflow-hidden rounded-full bg-black/20 [data-theme=light]:bg-black/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            aria-label={`${habit.text} progress`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              className={cn('h-full rounded-full', theme.fill)}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {dates.map((iso, idx) => {
            const d = parseIsoDate(iso);
            const done = !!habit.checkIns[iso];
            const today = iso === todayKey;
            const past = d < startOfToday();
            const future = d > startOfToday();
            return (
              <React.Fragment key={iso}>
                {idx > 0 && idx % 7 === 0 ? <span className="w-2" aria-hidden /> : null}
                <div
                  className={cn(
                    'relative flex h-[38px] w-[38px] flex-col items-center justify-center rounded-[10px] border text-center',
                    done && 'border-emerald-400 bg-emerald-100/90 text-emerald-900',
                    !done && today && 'border-[2.5px] border-[#7C4DFF] bg-violet-500/15 text-white',
                    !done && past && 'border-white/30 text-white/70 opacity-50',
                    !done && future && 'border-white/20 text-white/60 opacity-35'
                  )}
                  aria-label={`${d.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })} — ${done ? 'done' : future ? 'not yet' : 'missed'}`}
                >
                  <span className="text-[10px] leading-none">{d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</span>
                  <span className="text-[13px] font-bold leading-none">{d.getDate()}</span>
                  {done ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {!finished ? (
          <button
            type="button"
            onClick={() => toggleTodayCheckIn(habit.id)}
            className={cn(
              'mt-5 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99]',
              theme.checkinBg,
              theme.checkinBorder
            )}
            aria-label={`Check in today for ${habit.text}`}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                checkedToday ? 'border-[#7C4DFF] bg-[#7C4DFF] text-white' : 'border-[#7C4DFF] text-[#7C4DFF]'
              )}
            >
              {checkedToday ? <Check className="h-4 w-4" /> : null}
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-white">
                {checkedToday ? 'Done today!' : 'Did I do it today?'}
              </span>
              <span className={cn('block text-xs', theme.softText)}>
                {checkedToday
                  ? `Checked in for ${formatDayName(todayKey)}`
                  : `Tap to check in for ${formatDayName(todayKey)}`}
              </span>
            </span>
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                Completed!
              </span>
              {hitTarget ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  <Trophy className="h-3.5 w-3.5" />
                  Target hit
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-white/90">
              You did it {progress.done} out of {Math.max(progress.total, 1)} days ({progress.percent}%).
            </p>
            <p className="mt-1 text-xs text-white/70">
              {hitTarget
                ? 'Amazing consistency. You reached your target.'
                : 'Great effort. You still built a strong habit.'}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => repeatHabit(habit)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary/80"
              >
                <Repeat2 className="h-3.5 w-3.5" />
                Do it again
              </button>
              <button
                type="button"
                onClick={() => deleteHabit(habit.id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/80 hover:bg-white/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/15 px-3 py-2 text-[13px] text-white/85 [data-theme=light]:bg-black/5">
          <Target className="h-4 w-4 shrink-0 text-primary" />
          <span>
            My target: <strong>{targetLabel(habit)}</strong>
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6 [font-family:'Nunito',ui-sans-serif,system-ui,sans-serif] sm:p-8">
      <AnimatePresence>
        {celebrationText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-6 top-24 z-[120] rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 shadow-lg backdrop-blur-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Nice work</p>
            <p className="text-sm text-white/90">{celebrationText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[26px] font-extrabold tracking-tight text-white">My goals</h2>
        <button
          type="button"
          onClick={() => {
            setDraftCustomDays((d) => Math.min(MAX_CUSTOM_GOAL_DAYS, Math.max(1, d)));
            setShowAddHabit(true);
          }}
          className="rounded-full bg-[#7C4DFF] px-5 py-3 text-[15px] font-bold text-white shadow-lg shadow-[#7C4DFF]/30 transition-all hover:bg-[#6d40ef]"
        >
          + New goal
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-base font-semibold text-white/70">No goals yet</p>
          <p className="mt-1 text-sm text-white/45">Tap the button above to set your first goal!</p>
        </div>
      ) : null}

      {activeHabits.length > 0 ? (
        <div className="flex flex-col gap-4">{activeHabits.map(renderHabitCard)}</div>
      ) : null}

      {finishedHabits.length > 0 ? (
        <div className="mt-2">
          <div className="mb-3 flex items-center gap-2 text-white/70">
            <CalendarDays className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wide">Finished goals</h3>
          </div>
          <div className="flex flex-col gap-4">{finishedHabits.map(renderHabitCard)}</div>
        </div>
      ) : null}

      {createPortal(
        <AnimatePresence>
          {showAddHabit && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto overscroll-y-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddHabit(false)}
                className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
                aria-label="Close create goal"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                className="relative z-10 flex max-h-[min(88dvh,calc(100dvh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-midnight shadow-2xl sm:max-h-[min(92dvh,calc(100dvh-3rem))] sm:rounded-[28px]"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:p-6 sm:pb-6">
                  <h3 className="text-xl font-extrabold text-white">Start a new goal</h3>

                  <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/80">What is your goal?</label>
                  <input
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="I want to..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-base text-white placeholder:text-white/40 focus:border-primary/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/80">How long?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'week', label: '1 week' },
                      { id: 'fortnight', label: '2 weeks' },
                      { id: 'month', label: '1 month' },
                      { id: 'custom', label: 'Custom' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDraftPeriod(p.id as PeriodPreset)}
                        className={cn(
                          'rounded-full px-4 py-2.5 text-sm font-bold transition-all',
                          draftPeriod === p.id
                            ? 'bg-[#7C4DFF] text-white'
                            : 'border border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {draftPeriod === 'custom' ? (
                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-semibold text-white/60">How many days?</label>
                      <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setDraftCustomDays((v) => Math.max(1, v - 1))}
                            className="h-11 min-w-11 rounded-full border border-white/15 bg-white/10 px-3 text-lg font-extrabold text-white/90 transition hover:bg-white/20"
                            aria-label="Decrease custom days"
                          >
                            -
                          </button>
                          <span className="text-base font-extrabold text-white">{draftCustomDays} days</span>
                          <button
                            type="button"
                            onClick={() => setDraftCustomDays((v) => Math.min(MAX_CUSTOM_GOAL_DAYS, v + 1))}
                            className="h-11 min-w-11 rounded-full border border-white/15 bg-white/10 px-3 text-lg font-extrabold text-white/90 transition hover:bg-white/20"
                            aria-label="Increase custom days"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={MAX_CUSTOM_GOAL_DAYS}
                          value={draftCustomDays}
                          onChange={(e) => setDraftCustomDays(Number(e.target.value) || 1)}
                          style={
                            {
                              '--goal-slider-progress': `${((draftCustomDays - 1) / (MAX_CUSTOM_GOAL_DAYS - 1)) * 100}%`,
                            } as React.CSSProperties
                          }
                          className="goal-slider w-full"
                          aria-label="Custom days slider"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/80">How often do you want to do it?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'every', label: 'Every day (100%)' },
                      { id: 'most', label: 'Most days (80%)' },
                      { id: 'half', label: 'Half the time (50%)' },
                      { id: 'custom', label: 'Custom' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDraftTargetPreset(t.id as TargetPreset)}
                        className={cn(
                          'rounded-full px-4 py-2.5 text-sm font-bold transition-all',
                          draftTargetPreset === t.id
                            ? 'bg-[#7C4DFF] text-white'
                            : 'border border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {draftTargetPreset === 'custom' ? (
                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-semibold text-white/60">Custom percentage</label>
                      <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setDraftCustomTarget((v) => Math.max(1, v - 1))}
                            className="h-11 min-w-11 rounded-full border border-white/15 bg-white/10 px-3 text-lg font-extrabold text-white/90 transition hover:bg-white/20"
                            aria-label="Decrease target percentage"
                          >
                            -
                          </button>
                          <span className="text-base font-extrabold text-white">{draftCustomTarget}%</span>
                          <button
                            type="button"
                            onClick={() => setDraftCustomTarget((v) => Math.min(100, v + 1))}
                            className="h-11 min-w-11 rounded-full border border-white/15 bg-white/10 px-3 text-lg font-extrabold text-white/90 transition hover:bg-white/20"
                            aria-label="Increase target percentage"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={draftCustomTarget}
                          onChange={(e) => setDraftCustomTarget(Number(e.target.value) || 1)}
                          style={
                            {
                              '--goal-slider-progress': `${((draftCustomTarget - 1) / (100 - 1)) * 100}%`,
                            } as React.CSSProperties
                          }
                          className="goal-slider w-full"
                          aria-label="Custom percentage slider"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/80">Pick a colour</label>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(COLOUR_THEMES) as Habit['color'][]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDraftColour(c)}
                        className={cn(
                          'h-10 w-10 rounded-full border-4 transition-all',
                          c === draftColour ? 'border-white scale-105' : 'border-transparent opacity-80 hover:opacity-100',
                          COLOUR_THEMES[c].fill
                        )}
                        aria-label={`Choose ${c} colour`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={createHabit}
                  className="w-full rounded-full bg-[#7C4DFF] px-5 py-3.5 text-base font-extrabold text-white transition-all hover:bg-[#6d40ef]"
                >
                  Start my goal!
                </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
