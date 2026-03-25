import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Plus, GraduationCap, Gamepad2, Moon, Palette, 
  Trash2, GripVertical, BookOpen, Music, Film, Dumbbell,
  FlaskConical, Calculator, Languages, ArrowLeft, Book,
  Globe, Landmark, Monitor, Heart, Coffee, Utensils,
  Users, Church, Calendar, ChevronLeft, ChevronRight,
  Smile, Frown, Meh, Save
} from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { logSessionEvent } from '../lib/sessionEvents';

// --- Icon Mapping for Persistence ---
const ICON_MAP: Record<string, React.ElementType> = {
  Calculator, FlaskConical, BookOpen, Book, Globe, Landmark, Monitor, Heart, Church,
  Gamepad2, Dumbbell, Coffee, Utensils, Users, Moon, Palette, Music, Star, Smile, Meh, Frown,
  GraduationCap, Film, Languages, Trash2, GripVertical, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Save
};

// --- Types ---

type StickerCategory = 'School' | 'Play' | 'Rest' | 'Custom';

interface StickerTemplate {
  id: string;
  label: string;
  iconName: string;
  type: StickerCategory;
  color: string;
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

type PlannerSlot = 'morning' | 'afternoon' | 'evening';

// --- Constants ---

const STICKER_TEMPLATES: StickerTemplate[] = [
  // School icon colours match subject feel (maths blue, science green, etc.)
  { id: 's1', label: 'Maths', iconName: 'Calculator', type: 'School', color: 'text-sky-400' },
  { id: 's2', label: 'Science', iconName: 'FlaskConical', type: 'School', color: 'text-emerald-400' },
  { id: 's3', label: 'Reading', iconName: 'BookOpen', type: 'School', color: 'text-amber-400' },
  { id: 's4', label: 'English', iconName: 'Book', type: 'School', color: 'text-purple-400' },
  { id: 's11', label: 'Geography', iconName: 'Globe', type: 'School', color: 'text-teal-400' },
  { id: 's12', label: 'History', iconName: 'Landmark', type: 'School', color: 'text-orange-400' },
  { id: 's13', label: 'Computing', iconName: 'Monitor', type: 'School', color: 'text-cyan-400' },
  { id: 's14', label: 'PSHE', iconName: 'Heart', type: 'School', color: 'text-rose-400' },
  { id: 's15', label: 'RE', iconName: 'Church', type: 'School', color: 'text-yellow-400' },
  { id: 's9', label: 'Art', iconName: 'Palette', type: 'School', color: 'text-fuchsia-400' },
  { id: 's10', label: 'Music', iconName: 'Music', type: 'School', color: 'text-violet-400' },
  { id: 's18', label: 'Assembly', iconName: 'Users', type: 'School', color: 'text-indigo-400' },
  { id: 's6', label: 'P.E.', iconName: 'Dumbbell', type: 'School', color: 'text-lime-400' },

  // Play
  { id: 's5', label: 'Gaming', iconName: 'Gamepad2', type: 'Play', color: 'text-blue-400' },

  // Rest
  { id: 's8', label: 'Rest', iconName: 'Moon', type: 'Rest', color: 'text-indigo-300' },
];

const CATEGORIES: StickerCategory[] = ['School', 'Play', 'Rest', 'Custom'];

/** Shown in the vault so category tabs and zones are self-explanatory */
const CATEGORY_INFO: Record<
  StickerCategory,
  { label: string; description: string }
> = {
  School: {
    label: 'School',
    description: 'Lessons, subjects, and school activities.',
  },
  Play: {
    label: 'Play',
    description: 'Games, hobbies, and activities after school.',
  },
  Rest: {
    label: 'Rest',
    description: 'Breaks, sleep, and quiet time.',
  },
  Custom: {
    label: 'Custom',
    description: 'Stickers you make yourself.',
  },
};

const ICON_OPTIONS = [
  { name: 'Book', icon: Book },
  { name: 'Star', icon: Star },
  { name: 'Palette', icon: Palette },
  { name: 'Music', icon: Music },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Heart', icon: Heart },
  { name: 'Smile', icon: Smile },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Coffee', icon: Coffee },
  { name: 'Utensils', icon: Utensils },
  { name: 'Moon', icon: Moon },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'Calculator', icon: Calculator },
  { name: 'Globe', icon: Globe },
  { name: 'Landmark', icon: Landmark },
  { name: 'Monitor', icon: Monitor },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Film', icon: Film },
  { name: 'Languages', icon: Languages },
];

const COLOUR_OPTIONS = [
  { name: 'Primary', text: 'text-primary', bg: 'bg-primary' },
  { name: 'Blue', text: 'text-blue-400', bg: 'bg-blue-400' },
  { name: 'Rose', text: 'text-rose-400', bg: 'bg-rose-400' },
  { name: 'Emerald', text: 'text-emerald-400', bg: 'bg-emerald-400' },
  { name: 'Amber', text: 'text-amber-400', bg: 'bg-amber-400' },
  { name: 'Violet', text: 'text-violet-400', bg: 'bg-violet-400' },
  { name: 'Indigo', text: 'text-indigo-400', bg: 'bg-indigo-400' },
  { name: 'Orange', text: 'text-orange-400', bg: 'bg-orange-400' },
  { name: 'Cyan', text: 'text-cyan-400', bg: 'bg-cyan-400' },
  { name: 'Pink', text: 'text-pink-400', bg: 'bg-pink-400' },
];

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const INITIAL_PLANNER: Record<string, DayData> = Object.fromEntries(
  WEEKDAYS.map((d) => [d, { morning: [], afternoon: [], evening: [] }])
) as Record<string, DayData>;

function normalizePlanner(raw: Record<string, DayData>): Record<string, DayData> {
  const out: Record<string, DayData> = {} as Record<string, DayData>;
  for (const d of WEEKDAYS) {
    const v = raw[d];
    out[d] =
      v && Array.isArray(v.morning) && Array.isArray(v.afternoon) && Array.isArray(v.evening)
        ? {
            morning: v.morning,
            afternoon: v.afternoon,
            evening: v.evening,
            reflection: v.reflection,
            success: v.success,
          }
        : { morning: [], afternoon: [], evening: [] };
  }
  return out;
}

/** Keep tasks aligned with vault templates (e.g. P.E. moved to School, new subject colours). */
function applyTemplateStylesToPlanner(planner: Record<string, DayData>): Record<string, DayData> {
  const styleByLabel = new Map(
    STICKER_TEMPLATES.map((s) => [s.label, { type: s.type, color: s.color }])
  );
  const slots = ['morning', 'afternoon', 'evening'] as const;
  const out: Record<string, DayData> = { ...planner };
  for (const day of WEEKDAYS) {
    const d = out[day];
    if (!d) continue;
    let changed = false;
    const nextMorning = d.morning.map((t) => {
      const style = styleByLabel.get(t.title);
      if (!style || (t.type === style.type && t.color === style.color)) return t;
      changed = true;
      return { ...t, type: style.type, color: style.color };
    });
    const nextAfternoon = d.afternoon.map((t) => {
      const style = styleByLabel.get(t.title);
      if (!style || (t.type === style.type && t.color === style.color)) return t;
      changed = true;
      return { ...t, type: style.type, color: style.color };
    });
    const nextEvening = d.evening.map((t) => {
      const style = styleByLabel.get(t.title);
      if (!style || (t.type === style.type && t.color === style.color)) return t;
      changed = true;
      return { ...t, type: style.type, color: style.color };
    });
    if (changed) {
      out[day] = {
        ...d,
        morning: nextMorning,
        afternoon: nextAfternoon,
        evening: nextEvening,
      };
    }
  }
  return out;
}

// --- Components ---

interface DraggableStickerProps {
  sticker: StickerTemplate;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
  key?: React.Key;
}

const DraggableSticker = ({ sticker, isOverlay = false, onDelete }: DraggableStickerProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${sticker.id}`,
    data: { sticker, type: 'template' }
  });

  const Icon = (ICON_MAP[sticker.iconName] || Star) as React.ComponentType<{ className?: string }>;

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      title={sticker.label}
      className={cn(
        'group/sticker relative flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 transition-all cursor-grab select-none active:cursor-grabbing',
        'touch-manipulation [-webkit-tap-highlight-color:transparent]',
        isOverlay
          ? 'z-[200] min-w-[5rem] scale-110 border-primary/40 bg-primary/20 shadow-2xl'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
        isDragging && !isOverlay && 'opacity-40'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', sticker.color)} />
      <span className="w-full break-words text-center text-[8px] font-bold leading-tight text-white/90 line-clamp-3">
        {sticker.label}
      </span>
      
      {onDelete && !isOverlay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(sticker.id);
          }}
          className="absolute -top-1 -right-1 p-1.5 bg-rose-500 rounded-full text-white shadow-lg opacity-100 min-h-8 min-w-8 flex items-center justify-center sm:opacity-0 sm:group-hover/sticker:opacity-100 sm:min-h-0 sm:min-w-0 sm:p-1"
        >
          <Plus className="w-2 h-2 rotate-45" />
        </button>
      )}
    </div>
  );
};

interface DraggableTaskProps {
  task: PlannerTask;
  day: string;
  slot: PlannerSlot;
  isOverlay?: boolean;
  key?: React.Key;
}

const DraggableTask = ({ task, day, slot, isOverlay = false }: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { task, day, slot, type: 'task' }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const Icon = (ICON_MAP[task.iconName] || Star) as React.ComponentType<{ className?: string }>;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...listeners} 
      {...attributes}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-grab select-none active:cursor-grabbing bg-white/5 border-white/10 hover:bg-white/10 relative group",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        isOverlay && "z-[200] bg-white/10 border-white/20 shadow-2xl scale-105",
        isDragging && !isOverlay && "opacity-0"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <Icon className={cn("w-4 h-4", task.color)} />
          </div>
          <h5 className="text-sm font-bold text-white/90">{task.title}</h5>
        </div>
        <div className="flex items-center gap-2">
          {task.enjoyment === 'good' && <Smile className="w-3 h-3 text-emerald-400/60" />}
          {task.enjoyment === 'meh' && <Meh className="w-3 h-3 text-amber-400/60" />}
          {task.enjoyment === 'bad' && <Frown className="w-3 h-3 text-rose-400/60" />}
          <GripVertical className="w-4 h-4 shrink-0 text-white/35 transition-colors sm:w-3 sm:h-3 sm:text-white/10 sm:group-hover:text-white/30" />
        </div>
      </div>
    </div>
  );
};

interface DroppableSlotProps {
  day: string;
  slot: PlannerSlot;
  children: React.ReactNode;
  key?: React.Key;
}

const DroppableSlot = ({ day, slot, children }: DroppableSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${slot}`,
    data: { day, slot }
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 p-4 rounded-[24px] transition-all min-h-[min(140px,22dvh)] border border-white/5 sm:min-h-[140px]",
        isOver ? "bg-primary/10 border-primary/30" : "bg-white/[0.02]"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-[0.2em]",
          slot === 'morning' ? "text-primary/60" : 
          slot === 'afternoon' ? "text-blue-400/60" : "text-rose-400/60"
        )}>
          {slot}
        </span>
        <Plus className="w-3 h-3 text-white/10" />
      </div>
      <div className="flex flex-col gap-3">
        <SortableContext 
          items={React.Children.toArray(children).map((child: any) => child.key)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </div>
    </div>
  );
};

const Bin = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bin',
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "mt-auto flex w-full min-h-[52px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed py-5 transition-all touch-manipulation sm:min-h-0 sm:py-6",
        isOver 
          ? "bg-rose-500/20 border-rose-500/40 text-rose-400 scale-105" 
          : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10 hover:border-white/20"
      )}
    >
      <Trash2 className={cn("w-6 h-6", isOver && "animate-bounce")} />
      <span className="text-[10px] font-bold uppercase tracking-widest">Drop here to remove</span>
    </div>
  );
};

// --- Main Component ---

export const Planner = () => {
  const [planner, setPlanner] = useState<Record<string, DayData>>(() => {
    const saved = localStorage.getItem('evid_glow_planner');
    if (saved) {
      try {
        return applyTemplateStylesToPlanner(normalizePlanner(JSON.parse(saved)));
      } catch (e) {
        return INITIAL_PLANNER;
      }
    }
    return INITIAL_PLANNER;
  });

  const [customStickers, setCustomStickers] = useState<StickerTemplate[]>(() => {
    const saved = localStorage.getItem('evid_glow_custom_stickers');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<StickerCategory>('School');
  
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newSticker, setNewSticker] = useState({
    label: '',
    iconName: 'Star',
    color: 'text-primary'
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [isVaultOpen, setIsVaultOpen] = useState(true);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);

  const showCelebration = (text: string) => {
    setCelebrationText(text);
    if (celebrationTimerRef.current) {
      window.clearTimeout(celebrationTimerRef.current);
    }
    celebrationTimerRef.current = window.setTimeout(() => setCelebrationText(null), 1800);
  };

  /* Mouse: distance activation. Touch: press-and-drag (does not fight vertical scroll like PointerSensor). */
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 12,
      },
    })
  );

  React.useEffect(() => {
    localStorage.setItem('evid_glow_planner', JSON.stringify(planner));
  }, [planner]);

  React.useEffect(() => {
    localStorage.setItem('evid_glow_custom_stickers', JSON.stringify(customStickers));
  }, [customStickers]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveData(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const targetId = over.id as string;
    const targetData = over.data.current;

    // Handle Deletion
    if (targetId === 'bin') {
      if (activeType === 'task') {
        const { day, slot, task } = active.data.current! as {
          day: string;
          slot: PlannerSlot;
          task: PlannerTask;
        };
        setPlanner((prev: any) => ({
          ...prev,
          [day]: {
            ...prev[day],
            [slot]: prev[day][slot].filter((t: PlannerTask) => t.id !== task.id)
          }
        }));
        showCelebration(`Removed "${task.title}"`);
        logSessionEvent('planner_task_removed', {
          day,
          slot,
          title: task.title,
        });
      }
      return;
    }

    // Determine target day and slot from the target's data
    const day = targetData?.day as string | undefined;
    const slot = targetData?.slot as PlannerSlot | undefined;

    if (!day || !slot) return;

    if (activeType === 'template') {
      const sticker = active.data.current?.sticker as StickerTemplate;
      const newTask: PlannerTask = {
        id: `${sticker.id}-${Date.now()}`,
        title: sticker.label,
        type: sticker.type,
        iconName: sticker.iconName,
        color: sticker.color,
      };

      setPlanner((prev: any) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: [...prev[day][slot], newTask]
        }
      }));
      showCelebration(`Added "${sticker.label}" to ${slot}`);
      logSessionEvent('planner_task_added', {
        day,
        slot,
        title: sticker.label,
        from: 'template',
      });
    } else if (activeType === 'task') {
      const { day: sourceDay, slot: sourceSlot, task } = active.data.current! as {
        day: string;
        slot: PlannerSlot;
        task: PlannerTask;
      };
      
      // If moving within same slot (reordering)
      if (sourceDay === day && sourceSlot === slot) {
        const oldIndex = planner[day][slot].findIndex((t: PlannerTask) => t.id === active.id);
        const newIndex = planner[day][slot].findIndex((t: PlannerTask) => t.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setPlanner((prev: any) => ({
            ...prev,
            [day]: {
              ...prev[day],
              [slot]: arrayMove(prev[day][slot], oldIndex, newIndex)
            }
          }));
          showCelebration(`Reordered tasks in ${slot}`);
          logSessionEvent('planner_task_moved', {
            day,
            fromSlot: slot,
            toSlot: slot,
            title: task.title,
            moveType: 'reorder',
          });
        }
        return;
      }

      setPlanner((prev: any) => {
        // Remove from source
        const newSourceSlot = prev[sourceDay][sourceSlot].filter((t: PlannerTask) => t.id !== task.id);
        
        // Add to target
        const newTargetSlot = [...prev[day][slot], task];

        // If moving within same day
        if (sourceDay === day) {
          return {
            ...prev,
            [day]: {
              ...prev[day],
              [sourceSlot]: newSourceSlot,
              [slot]: newTargetSlot
            }
          };
        }

        // If moving between different days
        return {
          ...prev,
          [sourceDay]: {
            ...prev[sourceDay],
            [sourceSlot]: newSourceSlot
          },
          [day]: {
            ...prev[day],
            [slot]: newTargetSlot
          }
        };
      });
      showCelebration(
        sourceDay === day
          ? `Moved "${task.title}" to ${slot}`
          : `Moved "${task.title}" to ${day} ${slot}`
      );
      logSessionEvent('planner_task_moved', {
        title: task.title,
        fromDay: sourceDay,
        fromSlot: sourceSlot,
        toDay: day,
        toSlot: slot,
      });
    }
  };

  const addCustomSticker = () => {
    if (!newSticker.label) return;
    const sticker: StickerTemplate = {
      id: `custom-${Date.now()}`,
      label: newSticker.label,
      iconName: newSticker.iconName,
      type: 'Custom',
      color: newSticker.color
    };
    setCustomStickers(prev => [...prev, sticker]);
    setNewSticker({ label: '', iconName: 'Star', color: 'text-primary' });
    setShowCustomForm(false);
    showCelebration(`Added custom sticker "${sticker.label}"`);
  };

  const updateTaskReflection = (day: string, slot: PlannerSlot, taskId: string, enjoyment: 'good' | 'meh' | 'bad') => {
    const task = planner[day]?.[slot]?.find((t: PlannerTask) => t.id === taskId);
    setPlanner((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: prev[day][slot].map((t: PlannerTask) => 
          t.id === taskId ? { ...t, enjoyment } : t
        )
      }
    }));
    if (task) {
      showCelebration(`Marked "${task.title}"`);
      logSessionEvent('planner_task_reflection', {
        day,
        slot,
        title: task.title,
        enjoyment,
      });
    }
  };

  const updateDayReflection = (day: string, field: 'reflection' | 'success', value: string) => {
    setPlanner((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const allStickers = [...STICKER_TEMPLATES, ...customStickers];
  const filteredStickers = allStickers.filter(s => s.type === activeCategory);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      autoScroll
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex min-h-0 w-full flex-1 flex-col gap-4 p-4 sm:p-6 lg:h-[calc(100dvh-140px)] lg:max-h-[calc(100dvh-140px)] lg:flex-row lg:gap-8 lg:p-8"
      >
        <AnimatePresence>
          {celebrationText && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-none absolute right-4 top-3 z-[90] rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-white shadow-lg"
            >
              {celebrationText}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Vault toggle: side rail on desktop, FAB on phones / iPad portrait */}
        <button
          type="button"
          aria-expanded={isVaultOpen}
          aria-label={isVaultOpen ? 'Hide sticker vault' : 'Show sticker vault'}
          onClick={() => setIsVaultOpen(!isVaultOpen)}
          className={cn(
            'glass-panel z-[60] flex touch-manipulation items-center justify-center gap-2 rounded-full border border-white/10 transition-all hover:bg-white/10',
            'min-h-12 min-w-12 px-3 sm:min-h-[44px]',
            'max-lg:fixed max-lg:bottom-[max(1rem,env(safe-area-inset-bottom))] max-lg:right-[max(1rem,env(safe-area-inset-right))] max-lg:left-auto max-lg:top-auto max-lg:translate-y-0 max-lg:shadow-xl',
            'lg:absolute lg:left-3 lg:top-1/2 lg:h-24 lg:w-8 lg:min-h-0 lg:min-w-0 lg:translate-y-[-50%] lg:flex-col lg:px-0',
            !isVaultOpen && 'lg:left-6'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 shrink-0 text-white/60 transition-transform lg:h-4 lg:w-4',
              !isVaultOpen && 'rotate-180'
            )}
          />
          <span className="text-[10px] font-bold uppercase tracking-wide text-white/80 lg:hidden">
            {isVaultOpen ? 'Hide' : 'Stickers'}
          </span>
        </button>

        {/* Sidebar: full-width + bounded height on small screens so stickers stay visible; fixed width on lg+ */}
        <AnimatePresence>
          {isVaultOpen && (
            <motion.aside
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex w-full shrink-0 flex-col overflow-hidden max-lg:max-h-[min(42dvh,400px)] max-lg:min-h-[200px] lg:h-full lg:w-[280px] lg:max-w-[280px]"
            >
              <div
                className={cn(
                  'glass-panel flex flex-1 flex-col gap-4 rounded-[32px] p-4 sm:p-5',
                  'min-h-0 max-lg:max-h-full max-lg:overflow-y-auto max-lg:overscroll-y-contain [-webkit-overflow-scrolling:touch]',
                  'lg:overflow-hidden lg:gap-5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Sticker list</h3>
                    <p className="text-[8px] uppercase tracking-wider text-white/40">
                      Hold and drag on touch, or drag with mouse
                    </p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        title={CATEGORY_INFO[cat].description}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all',
                          activeCategory === cat
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        )}
                      >
                        {CATEGORY_INFO[cat].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] leading-snug text-white/35">
                    {CATEGORY_INFO[activeCategory].description}
                  </p>
                </div>

                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col gap-2',
                    'max-lg:flex-none max-lg:overflow-visible',
                    'lg:min-h-0 lg:overflow-hidden'
                  )}
                >
                  <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/45">
                    Available stickers
                  </p>
                  <div
                    className={cn(
                      'hide-scrollbar pr-1',
                      'max-lg:overflow-visible',
                      'lg:min-h-0 lg:flex-1 lg:overflow-y-auto'
                    )}
                  >
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {filteredStickers.map((sticker) => (
                      <DraggableSticker 
                        key={sticker.id} 
                        sticker={sticker} 
                        onDelete={sticker.type === 'Custom' ? (id) => setCustomStickers(prev => prev.filter(s => s.id !== id)) : undefined}
                      />
                    ))}
                    
                    {activeCategory === 'Custom' && (
                      <button 
                        type="button"
                        onClick={() => setShowCustomForm(true)}
                        className="group flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/5 px-1 py-2 transition-all hover:bg-white/10"
                      >
                        <Plus className="h-5 w-5 text-white/40 transition-colors group-hover:text-primary" />
                        <span className="text-[8px] font-bold uppercase tracking-wide text-white/35 group-hover:text-white/50">
                          New
                        </span>
                      </button>
                    )}
                  </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                    Remove task
                  </p>
                  <p className="text-[9px] leading-snug text-white/35">
                    Drag a task here to remove it from this day.
                  </p>
                  <Bin />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Area */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pb-20 sm:gap-6 lg:pb-0">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Planner</h2>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {weekOffset === 0
                    ? 'This Week'
                    : weekOffset > 0
                      ? `In ${weekOffset} Weeks`
                      : `${Math.abs(weekOffset)} Weeks Ago`}
                </span>
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Saved</span>
            </div>
          </div>

          {/* Day picker: Mon–Sun */}
          <div className="mb-4 shrink-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Day
            </p>
            <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
              {WEEKDAYS.map((day) => {
                const dayData = planner[day];
                const totalTasks =
                  dayData.morning.length +
                  dayData.afternoon.length +
                  dayData.evening.length;
                const isActive = selectedDay === day;
                const hasReflection = !!(dayData.reflection || dayData.success);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2.5 py-2 text-center transition-all sm:min-w-[4.75rem] sm:px-3',
                      isActive
                        ? 'border-primary bg-primary/20 text-white shadow-[0_0_24px_rgba(45,212,191,0.12)]'
                        : 'border-white/10 bg-white/[0.03] text-white/45 hover:border-white/25 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide sm:text-[11px]">
                      <span className="sm:hidden">{day.slice(0, 3)}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </span>
                    <span className="text-[9px] font-bold tabular-nums text-white/35">
                      {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                    </span>
                    {hasReflection && (
                      <span className="h-1 w-8 rounded-full bg-emerald-400/50" title="Reflection saved" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col gap-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary/40" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Day plan
                    </p>
                    <h3 className="text-2xl font-bold text-white sm:text-3xl">{selectedDay}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                      isAnalysisOpen
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'
                    )}
                  >
                    {isAnalysisOpen ? 'Close notes' : 'Day notes'}
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-4">
                <div className="glass-panel relative flex min-h-0 min-h-[280px] flex-1 flex-col gap-6 overflow-y-auto rounded-[32px] border border-white/5 p-5 sm:min-h-[360px] sm:rounded-[40px] sm:p-8 lg:min-h-[min(520px,60vh)]">
                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                    {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                      const dayName = selectedDay;
                      return (
                        <div key={slot} className="flex min-h-0 flex-col gap-4">
                          <DroppableSlot day={dayName} slot={slot}>
                            {planner[dayName][slot].map((task: PlannerTask) => (
                              <div key={task.id} className="group relative">
                                <DraggableTask task={task} day={dayName} slot={slot} />
                                <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskReflection(dayName, slot, task.id, 'good')
                                    }
                                    className="rounded-full bg-emerald-500/20 p-1 text-emerald-400 hover:bg-emerald-500/40"
                                  >
                                    <Smile className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskReflection(dayName, slot, task.id, 'meh')
                                    }
                                    className="rounded-full bg-amber-500/20 p-1 text-amber-400 hover:bg-amber-500/40"
                                  >
                                    <Meh className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskReflection(dayName, slot, task.id, 'bad')
                                    }
                                    className="rounded-full bg-rose-500/20 p-1 text-rose-400 hover:bg-rose-500/40"
                                  >
                                    <Frown className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </DroppableSlot>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {isAnalysisOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-panel flex w-full shrink-0 flex-col gap-6 overflow-hidden rounded-[40px] border border-white/5 p-6 sm:p-8 lg:w-80 lg:max-w-[320px]"
                    >
                      <h4 className="whitespace-nowrap text-xl font-bold text-white">Day notes</h4>

                      <div className="flex min-w-[256px] flex-col gap-4">
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                            What felt good today?
                          </label>
                          <textarea
                            value={planner[selectedDay].success || ''}
                            onChange={(e) =>
                              updateDayReflection(selectedDay, 'success', e.target.value)
                            }
                            onBlur={() => {
                              showCelebration(`Saved notes for ${selectedDay}`);
                              logSessionEvent('planner_note_saved', {
                                day: selectedDay,
                                field: 'success',
                              });
                            }}
                            placeholder="I liked art today because..."
                            className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/10 transition-colors focus:border-primary/40 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                            What do you want to do differently tomorrow?
                          </label>
                          <textarea
                            value={planner[selectedDay].reflection || ''}
                            onChange={(e) =>
                              updateDayReflection(selectedDay, 'reflection', e.target.value)
                            }
                            onBlur={() => {
                              showCelebration(`Saved notes for ${selectedDay}`);
                              logSessionEvent('planner_note_saved', {
                                day: selectedDay,
                                field: 'reflection',
                              });
                            }}
                            placeholder="Tomorrow I want to..."
                            className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/10 transition-colors focus:border-primary/40 focus:outline-none"
                          />
                        </div>

                        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                              Note
                            </span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-white/60">
                            Add one short note. It can help you spot what is working for you.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>

      {/* Custom Sticker Modal */}
      <AnimatePresence>
        {showCustomForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-[40px] p-8 flex flex-col gap-6 border-white/10 max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">New custom sticker</h3>
                <button onClick={() => setShowCustomForm(false)} className="text-white/20 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Sticker name</label>
                  <input 
                    type="text"
                    value={newSticker.label}
                    onChange={(e) => setNewSticker(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Swimming"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Icon</label>
                  <div className="grid grid-cols-6 gap-2 max-h-[180px] overflow-y-auto pr-2 hide-scrollbar">
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.name}
                        onClick={() => setNewSticker(prev => ({ ...prev, iconName: opt.name }))}
                        className={cn(
                          "w-full aspect-square rounded-xl flex items-center justify-center border transition-all",
                          newSticker.iconName === opt.name 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <opt.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Colour</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOUR_OPTIONS.map(opt => (
                      <button
                        key={opt.name}
                        onClick={() => setNewSticker(prev => ({ ...prev, color: opt.text }))}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all",
                          newSticker.color === opt.text 
                            ? "border-white scale-110" 
                            : "border-transparent opacity-60 hover:opacity-100",
                          opt.bg
                        )}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addCustomSticker}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 mt-2"
                >
                  Add sticker
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DragOverlay>
        {activeId ? (
          activeData.type === 'template' ? (
            <DraggableSticker sticker={activeData.sticker} isOverlay />
          ) : (
            <DraggableTask task={activeData.task} day={activeData.day} slot={activeData.slot} isOverlay />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
