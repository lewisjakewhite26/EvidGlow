import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, CalendarRange, MessageSquare, MoveRight, PlusCircle, Trash2, FileText, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { readSessionEvents, SessionEvent } from '../lib/sessionEvents';

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 2) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export const Journey = () => {
  const [events, setEvents] = useState<SessionEvent[]>(() => readSessionEvents());

  useEffect(() => {
    const handler = () => setEvents(readSessionEvents());
    window.addEventListener('evid_glow_session_events_updated', handler);
    return () => window.removeEventListener('evid_glow_session_events_updated', handler);
  }, []);

  const recentEvents = useMemo(() => {
    return [...events].slice(-40).reverse();
  }, [events]);

  const items = useMemo(() => {
    return recentEvents.map((e) => {
      const time = formatEventTime(e.createdAt);
      if (e.type === 'checkin_saved') {
        const label = e.payload?.label as string | undefined;
        const intensity = e.payload?.intensity as number | undefined;
        return {
          key: e.id,
          title: 'Check-in saved',
          subtitle: label
            ? intensity != null
              ? `Feeling ${label} at ${intensity}%.`
              : `Feeling ${label}.`
            : 'Your check-in is saved.',
          time,
          icon: CheckCircle2,
          tone: 'border-emerald-400/20 bg-emerald-500/10',
        };
      }

      if (e.type === 'breathing_started') {
        return {
          key: e.id,
          title: 'Breathing started',
          subtitle: 'A calm breathing session started.',
          time,
          icon: Sparkles,
          tone: 'border-primary/20 bg-primary/10',
        };
      }

      if (e.type === 'breathing_finished') {
        return {
          key: e.id,
          title: 'Breathing finished',
          subtitle: 'That reset session is complete.',
          time,
          icon: Sparkles,
          tone: 'border-primary/20 bg-primary/10',
        };
      }

      if (e.type === 'planner_task_added') {
        const day = e.payload?.day as string | undefined;
        const slot = e.payload?.slot as string | undefined;
        const title = e.payload?.title as string | undefined;
        return {
          key: e.id,
          title: 'Task added',
          subtitle: title && day && slot ? `"${title}" added to ${day} ${slot}.` : 'A task was added.',
          time,
          icon: PlusCircle,
          tone: 'border-blue-400/20 bg-blue-400/10',
        };
      }

      if (e.type === 'planner_task_moved') {
        const title = e.payload?.title as string | undefined;
        const toSlot = e.payload?.toSlot as string | undefined;
        const toDay = e.payload?.toDay as string | undefined;
        return {
          key: e.id,
          title: 'Task moved',
          subtitle: title && toDay && toSlot ? `"${title}" moved to ${toDay} ${toSlot}.` : 'A task moved.',
          time,
          icon: MoveRight,
          tone: 'border-indigo-400/20 bg-indigo-400/10',
        };
      }

      if (e.type === 'planner_task_removed') {
        const title = e.payload?.title as string | undefined;
        return {
          key: e.id,
          title: 'Task removed',
          subtitle: title ? `"${title}" removed.` : 'A task was removed.',
          time,
          icon: Trash2,
          tone: 'border-rose-400/20 bg-rose-500/10',
        };
      }

      if (e.type === 'planner_note_saved') {
        const field = e.payload?.field as string | undefined;
        return {
          key: e.id,
          title: 'Notes saved',
          subtitle: field ? `${field === 'success' ? 'What felt good' : 'What you want to do'} updated.` : 'Notes updated.',
          time,
          icon: FileText,
          tone: 'border-amber-400/20 bg-amber-500/10',
        };
      }

      if (e.type === 'planner_task_reflection') {
        const title = e.payload?.title as string | undefined;
        const enjoyment = e.payload?.enjoyment as string | undefined;
        return {
          key: e.id,
          title: 'Task marked',
          subtitle: title && enjoyment ? `"${title}" marked as ${enjoyment}.` : 'A task was marked.',
          time,
          icon: MessageSquare,
          tone: 'border-emerald-400/20 bg-emerald-500/10',
        };
      }

      if (e.type === 'goal_plan_created') {
        const title = e.payload?.title as string | undefined;
        return {
          key: e.id,
          title: 'Goal plan created',
          subtitle: title ? `"${title}" added to your plans.` : 'A goal plan was created.',
          time,
          icon: CalendarRange,
          tone: 'border-primary/20 bg-primary/10',
        };
      }

      if (e.type === 'goal_added') {
        const text = e.payload?.text as string | undefined;
        return {
          key: e.id,
          title: 'Goal added',
          subtitle: text ? `"${text}" added.` : 'A goal was added.',
          time,
          icon: PlusCircle,
          tone: 'border-blue-400/20 bg-blue-400/10',
        };
      }

      if (e.type === 'goal_completed') {
        const text = e.payload?.text as string | undefined;
        return {
          key: e.id,
          title: 'Goal completed',
          subtitle: text ? `"${text}" is done.` : 'A goal was completed.',
          time,
          icon: CheckCircle2,
          tone: 'border-emerald-400/20 bg-emerald-500/10',
        };
      }

      return {
        key: e.id,
        title: 'Activity',
        subtitle: 'Something was saved.',
        time,
        icon: CalendarRange,
        tone: 'border-white/10 bg-white/5',
      };
    });
  }, [recentEvents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4 sm:p-8 glass-panel rounded-[32px] mx-4 my-8 overflow-hidden relative"
    >
      <div className="relative z-10 mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
          Your activity
        </h2>
        <p className="text-white/60 text-lg font-medium">
          A record of what you did.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <CalendarRange className="w-7 h-7 text-white/30" />
          </div>
          <p className="text-white/60">No activity yet.</p>
          <p className="text-white/40 text-sm">Start with a check-in, then your activity will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-8 overflow-y-auto max-h-[60vh] hide-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={cn(
                  'rounded-[24px] border p-4 flex items-start gap-4',
                  item.tone
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    {item.time && <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{item.time}</p>}
                  </div>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
