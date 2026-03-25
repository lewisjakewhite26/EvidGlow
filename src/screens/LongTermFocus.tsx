import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CalendarRange, Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { logSessionEvent } from '../lib/sessionEvents';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

interface FocusPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'Week' | 'Fortnight' | 'Month' | 'Custom';
  goals: Goal[];
}

const PERIOD_TYPES = ['Week', 'Fortnight', 'Month'] as const;

export const LongTermFocus = () => {
  const [periods, setPeriods] = useState<FocusPeriod[]>([]);
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [newPeriod, setNewPeriod] = useState({
    title: '',
    type: 'Week' as 'Week' | 'Fortnight' | 'Month' | 'Custom',
    duration: 7
  });

  const [newGoalText, setNewGoalText] = useState('');

  const resolvedActiveId = activePeriodId ?? (periods[0]?.id ?? null);
  const activePeriod = periods.find(p => p.id === activePeriodId) || periods[0];

  const addPeriod = () => {
    if (!newPeriod.title) return;
    
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + newPeriod.duration);

    const period: FocusPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPeriod.title,
      type: newPeriod.type,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      goals: []
    };

    setPeriods([period, ...periods]);
    setActivePeriodId(period.id);
    setShowAddPeriod(false);
    setNewPeriod({ title: '', type: 'Week', duration: 7 });
    setCelebrationText(`Plan created: ${period.title}`);
    window.setTimeout(() => setCelebrationText(null), 2200);
    logSessionEvent('goal_plan_created', {
      title: period.title,
      type: period.type,
      durationDays: newPeriod.duration,
    });
  };

  const addGoal = () => {
    if (!newGoalText.trim() || resolvedActiveId == null) return;

    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      text: newGoalText,
      completed: false,
      category: 'General'
    };

    setPeriods(periods.map(p => 
      p.id === resolvedActiveId 
        ? { ...p, goals: [...p.goals, goal] }
        : p
    ));
    setNewGoalText('');
    setCelebrationText(`Goal added: ${goal.text}`);
    window.setTimeout(() => setCelebrationText(null), 2200);
    logSessionEvent('goal_added', {
      periodId: resolvedActiveId,
      text: goal.text,
    });
  };

  const toggleGoal = (goalId: string) => {
    if (resolvedActiveId == null) return;
    let completedNow: Goal | null = null;
    setPeriods(periods.map(p =>
      p.id === resolvedActiveId
        ? {
            ...p,
            goals: p.goals.map(g => {
              if (g.id !== goalId) return g;
              const nextCompleted = !g.completed;
              if (nextCompleted) completedNow = g;
              return { ...g, completed: nextCompleted };
            })
          }
        : p
    ));
    if (completedNow) {
      setCelebrationText(`Done: ${completedNow.text}`);
      window.setTimeout(() => setCelebrationText(null), 2200);
      logSessionEvent('goal_completed', {
        periodId: resolvedActiveId,
        text: completedNow.text,
      });
    }
  };

  const deleteGoal = (goalId: string) => {
    if (resolvedActiveId == null) return;
    setPeriods(periods.map(p => 
      p.id === resolvedActiveId 
        ? { ...p, goals: p.goals.filter(g => g.id !== goalId) }
        : p
    ));
  };

  const calculateProgress = (goals: Goal[]) => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 max-w-7xl mx-auto w-full">
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Long-term goals
          </h2>
          <p className="text-white/40 mt-1 text-sm">Plan and track goals over time</p>
        </div>
        <button 
          onClick={() => setShowAddPeriod(true)}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary/80 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New goal plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Sidebar: Periods List */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 px-2">Goal plans</h3>
          {periods.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
              <p className="text-sm text-white/35">No plans yet. Create one to start.</p>
            </div>
          ) : (
          periods.map(period => (
            <button
              key={period.id}
              type="button"
              onClick={() => setActivePeriodId(period.id)}
              className={cn(
                "p-6 rounded-3xl border transition-all text-left group relative overflow-hidden",
                resolvedActiveId === period.id 
                  ? "bg-white/10 border-white/20" 
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  period.type === 'Week' ? "bg-blue-400/20 text-blue-400" :
                  period.type === 'Fortnight' ? "bg-violet-400/20 text-violet-400" :
                  period.type === 'Month' ? "bg-emerald-400/20 text-emerald-400" :
                  "bg-amber-400/20 text-amber-400"
                )}>
                  {period.type === 'Custom' ? `${Math.round((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days` : period.type}
                </div>
                <span className="text-[10px] font-bold text-white/20">{calculateProgress(period.goals)}%</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{period.title}</h4>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Clock className="w-3 h-3" />
                <span>{period.startDate} to {period.endDate}</span>
              </div>
              
              {/* Progress Bar Background */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(period.goals)}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </button>
          ))
          )}
        </div>

        {/* Main Content: Goals for Active Period */}
        <div className="lg:col-span-8 flex flex-col gap-6 glass-panel rounded-[40px] p-8 min-h-0">
          {activePeriod == null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
              <Target className="h-16 w-16 text-white/15" />
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-white">No goal plan selected</h3>
                <p className="text-sm text-white/40">
                  Add a goal plan for a week, fortnight, month, or custom length.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPeriod(true)}
                className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/80"
              >
                <Plus className="h-4 w-4" />
                New goal plan
              </button>
            </div>
          ) : (
            <>
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{activePeriod.title}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <CalendarRange className="w-4 h-4" />
                  <span>{activePeriod.startDate} to {activePeriod.endDate}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-primary text-sm font-bold">{activePeriod.goals.length} goals</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-white tracking-tighter">{calculateProgress(activePeriod.goals)}%</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Done</div>
            </div>
          </div>

          {/* Add Goal Input */}
          <div className="flex gap-3">
            <input 
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Add your next goal"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
            />
            <button 
              type="button"
              onClick={addGoal}
              className="p-4 bg-white/10 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Goals List */}
          <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar flex flex-col gap-3">
            {activePeriod.goals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                <Target className="w-12 h-12 opacity-20" />
                <p className="font-medium">No goals added yet.</p>
              </div>
            ) : (
              activePeriod.goals.map((goal) => (
                <motion.div
                  layout
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "group flex items-center gap-4 p-5 rounded-3xl border transition-all",
                    goal.completed 
                      ? "bg-emerald-400/5 border-emerald-400/20" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <button 
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "transition-all",
                      goal.completed ? "text-emerald-400" : "text-white/20 group-hover:text-white/40"
                    )}
                  >
                    {goal.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  
                  <span className={cn(
                    "flex-1 font-medium transition-all",
                    goal.completed ? "text-white/40 line-through" : "text-white"
                  )}>
                    {goal.text}
                  </span>

                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-white/0 group-hover:text-white/20 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Add Period Modal */}
      <AnimatePresence>
        {showAddPeriod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPeriod(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-midnight border border-white/10 p-8 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">New goal plan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Plan name</label>
                  <input 
                    type="text"
                    value={newPeriod.title}
                    onChange={(e) => setNewPeriod(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Reading plan"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 block">Length</label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {PERIOD_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setNewPeriod(prev => ({ 
                          ...prev, 
                          type, 
                          duration: type === 'Week' ? 7 : type === 'Fortnight' ? 14 : 30 
                        }))}
                        className={cn(
                          "py-3 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                          newPeriod.type === type 
                            ? "bg-primary border-primary text-white" 
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-white/60">Custom days</span>
                      <span className="text-primary font-bold">{newPeriod.duration} days</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="31"
                      value={newPeriod.duration}
                      onChange={(e) => setNewPeriod(prev => ({ 
                        ...prev, 
                        duration: parseInt(e.target.value),
                        type: 'Custom'
                      }))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <button 
                  onClick={addPeriod}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 mt-4"
                >
                  Create plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
