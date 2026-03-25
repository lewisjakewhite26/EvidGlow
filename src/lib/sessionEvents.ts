export type SessionEventType =
  | 'checkin_saved'
  | 'breathing_started'
  | 'breathing_finished'
  | 'planner_task_added'
  | 'planner_task_moved'
  | 'planner_task_removed'
  | 'planner_note_saved'
  | 'planner_task_reflection'
  | 'goal_completed'
  | 'goal_added'
  | 'goal_plan_created';

export interface SessionEvent {
  id: string;
  type: SessionEventType;
  createdAt: string;
  payload?: Record<string, unknown>;
}

const SESSION_EVENTS_KEY = 'evid_glow_session_events';
const MAX_EVENTS = 400;

export function readSessionEvents(): SessionEvent[] {
  try {
    const raw = localStorage.getItem(SESSION_EVENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as SessionEvent[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logSessionEvent(type: SessionEventType, payload?: Record<string, unknown>): void {
  const nextEvent: SessionEvent = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    createdAt: new Date().toISOString(),
    payload,
  };
  const existing = readSessionEvents();
  const next = [...existing, nextEvent].slice(-MAX_EVENTS);
  localStorage.setItem(SESSION_EVENTS_KEY, JSON.stringify(next));

  try {
    window.dispatchEvent(new CustomEvent('evid_glow_session_events_updated'));
  } catch {
    // ignore
  }
}
