import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Cloud, Moon, Sandwich, Sun, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn } from '../lib/utils';
import { logSessionEvent } from '../lib/sessionEvents';

type StickerCategory = 'School' | 'Play' | 'Rest' | 'Custom';
type PlannerSlot = 'morning' | 'afternoon' | 'evening';

interface StickerTemplate {
  id: string;
  label: string;
  iconName: string;
  type: StickerCategory;
  color: string;
  dockBg: string;
  dockText: string;
  dotColor: string;
}

interface PlannerTask {
  id: string;
  title: string;
  type: string;
  iconName: string;
  color: string;
  enjoyment?: 'good' | 'meh' | 'bad';
  reflection?: string;
}

interface DayData {
  morning: PlannerTask[];
  afternoon: PlannerTask[];
  evening: PlannerTask[];
  reflection?: string;
  success?: string;
}

const SUBJECT_STICKERS: StickerTemplate[] = [
  { id: 's1', label: 'Maths', iconName: 'Maths', type: 'School', color: 'text-sky-200', dockBg: 'bg-sky-500/20', dockText: 'text-sky-100', dotColor: 'bg-sky-300' },
  { id: 's2', label: 'Science', iconName: 'Science', type: 'School', color: 'text-rose-200', dockBg: 'bg-rose-500/20', dockText: 'text-rose-100', dotColor: 'bg-rose-300' },
  { id: 's3', label: 'English', iconName: 'English', type: 'School', color: 'text-green-200', dockBg: 'bg-emerald-500/20', dockText: 'text-emerald-100', dotColor: 'bg-emerald-300' },
  { id: 's4', label: 'Reading', iconName: 'Reading', type: 'School', color: 'text-orange-200', dockBg: 'bg-orange-500/20', dockText: 'text-orange-100', dotColor: 'bg-orange-300' },
  { id: 's5', label: 'Art', iconName: 'Art', type: 'School', color: 'text-purple-200', dockBg: 'bg-purple-500/20', dockText: 'text-purple-100', dotColor: 'bg-purple-300' },
  { id: 's6', label: 'PE', iconName: 'PE', type: 'School', color: 'text-amber-200', dockBg: 'bg-amber-500/20', dockText: 'text-amber-100', dotColor: 'bg-amber-300' },
  { id: 's7', label: 'Computing', iconName: 'Computing', type: 'School', color: 'text-cyan-200', dockBg: 'bg-cyan-500/20', dockText: 'text-cyan-100', dotColor: 'bg-cyan-300' },
  { id: 's8', label: 'History', iconName: 'History', type: 'School', color: 'text-orange-200', dockBg: 'bg-orange-700/25', dockText: 'text-orange-100', dotColor: 'bg-orange-300' },
  { id: 's9', label: 'Geography', iconName: 'Geography', type: 'School', color: 'text-emerald-200', dockBg: 'bg-green-600/20', dockText: 'text-green-100', dotColor: 'bg-green-300' },
  { id: 's10', label: 'Music', iconName: 'Music', type: 'School', color: 'text-pink-200', dockBg: 'bg-pink-500/20', dockText: 'text-pink-100', dotColor: 'bg-pink-300' },
  { id: 's11', label: 'PSHE', iconName: 'PSHE', type: 'School', color: 'text-rose-200', dockBg: 'bg-rose-600/20', dockText: 'text-rose-100', dotColor: 'bg-rose-300' },
  { id: 's12', label: 'Play', iconName: 'Play', type: 'Play', color: 'text-yellow-200', dockBg: 'bg-yellow-500/20', dockText: 'text-yellow-100', dotColor: 'bg-yellow-300' },
];

const STICKER_BY_LABEL = new Map(SUBJECT_STICKERS.map((s) => [s.label, s]));
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const INITIAL_PLANNER: Record<string, DayData> = Object.fromEntries(
  WEEKDAYS.map((d) => [d, { morning: [], afternoon: [], evening: [] }])
) as Record<string, DayData>;

function normalizePlanner(raw: Record<string, DayData>): Record<string, DayData> {
  const out = {} as Record<string, DayData>;
  for (const day of WEEKDAYS) {
    const v = raw[day];
    out[day] =
      v && Array.isArray(v.morning) && Array.isArray(v.afternoon) && Array.isArray(v.evening)
        ? { morning: v.morning, afternoon: v.afternoon, evening: v.evening, reflection: v.reflection, success: v.success }
        : { morning: [], afternoon: [], evening: [] };
  }
  return out;
}

function applyTemplateStylesToPlanner(planner: Record<string, DayData>): Record<string, DayData> {
  const out: Record<string, DayData> = { ...planner };
  for (const day of WEEKDAYS) {
    const row = out[day];
    let changed = false;
    const patchSlot = (slot: PlannerSlot) =>
      row[slot].map((task) => {
        const style = STICKER_BY_LABEL.get(task.title);
        if (!style || (task.type === style.type && task.color === style.color)) return task;
        changed = true;
        return { ...task, type: style.type, color: style.color };
      });
    const morning = patchSlot('morning');
    const afternoon = patchSlot('afternoon');
    const evening = patchSlot('evening');
    if (changed) out[day] = { ...row, morning, afternoon, evening };
  }
  return out;
}

/** App uses `data-theme` on <html>, not Tailwind `dark:` — default = dark UI, light pastels only when data-theme=light */
const SLOT_STYLES: Record<
  PlannerSlot,
  {
    label: string;
    emptyText: string;
    icon: React.ComponentType<{ className?: string }>;
    section: string;
    header: string;
    emptyInner: string;
  }
> = {
  morning: {
    label: 'Morning',
    emptyText: 'Drop a lesson here!',
    icon: Sun,
    section:
      'border-amber-400/45 bg-amber-500/[0.12] [data-theme=light]:border-[#FFB74D] [data-theme=light]:bg-[#FFF8E1]',
    header: 'text-amber-100 [data-theme=light]:!text-amber-950',
    emptyInner:
      'border-amber-400/40 bg-black/25 text-amber-100 [data-theme=light]:border-amber-400/70 [data-theme=light]:bg-amber-100/95 [data-theme=light]:!text-amber-950',
  },
  afternoon: {
    label: 'Afternoon',
    emptyText: 'Drop a lesson here!',
    icon: Cloud,
    section:
      'border-sky-400/45 bg-sky-500/[0.12] [data-theme=light]:border-[#64B5F6] [data-theme=light]:bg-[#E3F2FD]',
    header: 'text-sky-100 [data-theme=light]:!text-sky-950',
    emptyInner:
      'border-sky-400/40 bg-black/25 text-sky-100 [data-theme=light]:border-sky-400/70 [data-theme=light]:bg-sky-100/95 [data-theme=light]:!text-sky-950',
  },
  evening: {
    label: 'Evening',
    emptyText: 'What are you doing tonight?',
    icon: Moon,
    section:
      'border-purple-400/45 bg-purple-500/[0.12] [data-theme=light]:border-[#BA68C8] [data-theme=light]:bg-[#F3E5F5]',
    header: 'text-purple-100 [data-theme=light]:!text-purple-950',
    emptyInner:
      'border-purple-400/40 bg-black/25 text-purple-100 [data-theme=light]:border-purple-400/70 [data-theme=light]:bg-purple-100/95 [data-theme=light]:!text-purple-950',
  },
};

const StickerPill = ({
  task,
  onRemove,
  day,
  slot,
  isOverlay = false,
  isDock = false,
  justDropped = false,
}: {
  task: PlannerTask | StickerTemplate;
  onRemove?: () => void;
  day?: string;
  slot?: PlannerSlot;
  isOverlay?: boolean;
  isDock?: boolean;
  justDropped?: boolean;
}) => {
  const taskLabel = 'title' in task ? task.title : task.label;
  const base = STICKER_BY_LABEL.get(taskLabel) || SUBJECT_STICKERS[0];
  const drag = useDraggable({
    id: isDock ? `template-${task.id}` : task.id,
    data: isDock ? { type: 'template', sticker: task } : { type: 'task', day, slot, task },
  });

  return (
    <motion.div
      ref={drag.setNodeRef}
      {...drag.attributes}
      {...drag.listeners}
      initial={false}
      animate={justDropped ? { scale: [0.9, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative inline-flex cursor-grab select-none touch-manipulation items-center gap-3 rounded-[40px] border px-4 py-2.5 font-bold shadow-sm transition-all active:cursor-grabbing',
        'planner-sticker-pill',
        isDock
          ? 'w-full justify-start text-[15px] hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-md'
          : 'text-base px-[18px] py-[10px]',
        base.dockBg,
        base.dockText,
        /* Light theme: dockText uses -100 tints; force dark ink on pale pills */
        '[data-theme=light]:!text-slate-900',
        'border-black/5 [data-theme=light]:border-slate-200/90 dark:border-white/10',
        drag.isDragging && !isOverlay && 'opacity-40',
        isOverlay && 'scale-105 shadow-lg'
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', base.dotColor)} />
      <span>{taskLabel}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${taskLabel}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
};

const TimeBlock = ({
  day,
  slot,
  tasks,
  onRemoveTask,
  justDroppedTaskId,
}: {
  day: string;
  slot: PlannerSlot;
  tasks: PlannerTask[];
  onRemoveTask: (taskId: string) => void;
  justDroppedTaskId: string | null;
}) => {
  const def = SLOT_STYLES[slot];
  const Icon = def.icon;
  const drop = useDroppable({ id: `${day}-${slot}`, data: { day, slot } });

  return (
    <section
      ref={drop.setNodeRef}
      className={cn(
        'rounded-2xl border-2 border-dashed p-5 md:p-6 min-h-[120px]',
        def.section,
        drop.isOver && 'ring-2 ring-primary/35'
      )}
    >
      <div className={cn('mb-4 flex items-center gap-2 text-lg font-extrabold planner-slot-heading', `planner-slot-heading--${slot}`, def.header)}>
        <Icon className="h-5 w-5" />
        <span>{def.label}</span>
      </div>
      {tasks.length === 0 ? (
        <div
          className={cn(
            'rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm font-semibold planner-slot-empty',
            `planner-slot-empty--${slot}`,
            def.emptyInner
          )}
        >
          {def.emptyText}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tasks.map((task) => (
            <StickerPill
              key={task.id}
              task={task}
              day={day}
              slot={slot}
              justDropped={justDroppedTaskId === task.id}
              onRemove={() => onRemoveTask(task.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export const Planner = () => {
  const [planner, setPlanner] = useState<Record<string, DayData>>(() => {
    const saved = localStorage.getItem('evid_glow_planner');
    if (!saved) return INITIAL_PLANNER;
    try {
      return applyTemplateStylesToPlanner(normalizePlanner(JSON.parse(saved)));
    } catch {
      return INITIAL_PLANNER;
    }
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [justDroppedTaskId, setJustDroppedTaskId] = useState<string | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);
  const droppedTimerRef = useRef<number | null>(null);

  const selectedDay = WEEKDAYS[selectedDayIndex];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 110, tolerance: 10 } })
  );

  useEffect(() => {
    localStorage.setItem('evid_glow_planner', JSON.stringify(planner));
  }, [planner]);

  const showCelebration = (text: string) => {
    setCelebrationText(text);
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = window.setTimeout(() => setCelebrationText(null), 1600);
  };

  const markDropped = (taskId: string) => {
    setJustDroppedTaskId(taskId);
    if (droppedTimerRef.current) window.clearTimeout(droppedTimerRef.current);
    droppedTimerRef.current = window.setTimeout(() => setJustDroppedTaskId(null), 320);
  };

  const removeTask = (day: string, slot: PlannerSlot, taskId: string) => {
    const task = planner[day][slot].find((t) => t.id === taskId);
    setPlanner((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: prev[day][slot].filter((t) => t.id !== taskId),
      },
    }));
    if (task) {
      showCelebration(`Removed ${task.title}`);
      logSessionEvent('planner_task_removed', { day, slot, title: task.title });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveData(null);
    if (!over) return;

    const activeType = active.data.current?.type as 'template' | 'task' | undefined;
    const targetData = over.data.current as { day?: string; slot?: PlannerSlot } | undefined;
    if (!targetData?.day || !targetData.slot) return;

    const day = targetData.day;
    const slot = targetData.slot;

    if (activeType === 'template') {
      const sticker = active.data.current?.sticker as StickerTemplate;
      const newTask: PlannerTask = {
        id: `${sticker.id}-${Date.now()}`,
        title: sticker.label,
        type: sticker.type,
        iconName: sticker.iconName,
        color: sticker.color,
      };
      setPlanner((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: [...prev[day][slot], newTask],
        },
      }));
      markDropped(newTask.id);
      showCelebration(`Added ${sticker.label}`);
      logSessionEvent('planner_task_added', { day, slot, title: sticker.label, from: 'dock' });
      return;
    }

    if (activeType === 'task') {
      const payload = active.data.current as { day: string; slot: PlannerSlot; task: PlannerTask };
      const sourceDay = payload.day;
      const sourceSlot = payload.slot;
      const task = payload.task;
      if (sourceDay === day && sourceSlot === slot) return;

      setPlanner((prev) => ({
        ...prev,
        [sourceDay]: {
          ...prev[sourceDay],
          [sourceSlot]: prev[sourceDay][sourceSlot].filter((t) => t.id !== task.id),
        },
        [day]: {
          ...prev[day],
          [slot]: [...prev[day][slot], task],
        },
      }));
      markDropped(task.id);
      showCelebration(`Moved ${task.title}`);
      logSessionEvent('planner_task_moved', {
        title: task.title,
        fromDay: sourceDay,
        fromSlot: sourceSlot,
        toDay: day,
        toSlot: slot,
      });
    }
  };

  const activeOverlayTask = useMemo(() => {
    if (!activeData) return null;
    if (activeData.type === 'template') return activeData.sticker as StickerTemplate;
    if (activeData.type === 'task') return activeData.task as PlannerTask;
    return null;
  }, [activeData]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      autoScroll
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 md:gap-6 md:p-6 [font-family:'Nunito',ui-sans-serif,system-ui,sans-serif]"
      >
        <AnimatePresence>
          {celebrationText && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-none absolute right-4 top-2 z-20 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-bold text-white [data-theme=light]:!text-slate-900 [data-theme=light]:border-emerald-300/60 [data-theme=light]:bg-emerald-100/90"
            >
              {celebrationText}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <aside className="glass-panel shrink-0 rounded-2xl border border-white/10 p-4 md:sticky md:top-4 md:h-[calc(100dvh-180px)] md:w-[260px] md:overflow-y-auto [data-theme=light]:border-slate-200/90">
            <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.2em] text-white/45 [data-theme=light]:!text-slate-500">
              Drag a sticker onto your day
            </p>
            <div className="flex flex-col gap-2">
              {SUBJECT_STICKERS.map((sticker) => (
                <StickerPill key={sticker.id} task={sticker} isDock />
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <header className="glass-panel rounded-2xl px-4 py-4 md:px-6 [data-theme=light]:border-slate-200/90">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedDayIndex((idx) => (idx - 1 + WEEKDAYS.length) % WEEKDAYS.length)}
                  className="rounded-full border border-white/15 bg-white/5 p-3 text-white/80 transition hover:bg-white/10 hover:text-white [data-theme=light]:border-slate-200 [data-theme=light]:bg-white [data-theme=light]:text-slate-600 [data-theme=light]:hover:bg-slate-50 [data-theme=light]:hover:text-slate-900"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-[170px] text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45 [data-theme=light]:!text-slate-500">
                    This week
                  </p>
                  <h2 className="text-4xl font-black text-white [data-theme=light]:!text-slate-900 md:text-5xl">
                    {selectedDay}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayIndex((idx) => (idx + 1) % WEEKDAYS.length)}
                  className="rounded-full border border-white/15 bg-white/5 p-3 text-white/80 transition hover:bg-white/10 hover:text-white [data-theme=light]:border-slate-200 [data-theme=light]:bg-white [data-theme=light]:text-slate-600 [data-theme=light]:hover:bg-slate-50 [data-theme=light]:hover:text-slate-900"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </header>

            <main className="flex flex-col gap-4">
              <TimeBlock
                day={selectedDay}
                slot="morning"
                tasks={planner[selectedDay].morning}
                justDroppedTaskId={justDroppedTaskId}
                onRemoveTask={(taskId) => removeTask(selectedDay, 'morning', taskId)}
              />

              <div className="planner-lunch-card rounded-2xl border border-emerald-500/35 bg-emerald-950/35 px-5 py-3">
                <div className="planner-lunch-text flex items-center justify-center gap-2 text-base font-extrabold text-emerald-200">
                  <Sandwich className="h-4 w-4" />
                  <span>Lunchtime!</span>
                </div>
              </div>

              <TimeBlock
                day={selectedDay}
                slot="afternoon"
                tasks={planner[selectedDay].afternoon}
                justDroppedTaskId={justDroppedTaskId}
                onRemoveTask={(taskId) => removeTask(selectedDay, 'afternoon', taskId)}
              />

              <TimeBlock
                day={selectedDay}
                slot="evening"
                tasks={planner[selectedDay].evening}
                justDroppedTaskId={justDroppedTaskId}
                onRemoveTask={(taskId) => removeTask(selectedDay, 'evening', taskId)}
              />
            </main>
          </div>
        </div>
      </motion.div>

      <DragOverlay>
        {activeId && activeOverlayTask ? <StickerPill task={activeOverlayTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
