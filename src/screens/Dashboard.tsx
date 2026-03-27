import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Heart, Brain, Palette } from 'lucide-react';
import { cn } from '../lib/utils';

import { readSessionEvents, SessionEvent } from '../lib/sessionEvents';
import { ChildAvatarIcon } from '../lib/childAvatar';

export const Dashboard = ({
  onCheckIn,
  childName,
  childAvatarKey,
  onRenameChildName,
}: {
  onCheckIn: () => void;
  childName?: string;
  childAvatarKey?: string;
  onRenameChildName?: (nextName: string) => void;
}) => {
  const [events, setEvents] = useState<SessionEvent[]>(() => readSessionEvents());
  const heroRef = useRef<HTMLDivElement>(null);
  const [isHeroHovering, setIsHeroHovering] = useState(false);
  const [orbTarget, setOrbTarget] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(childName ?? '');

  useEffect(() => {
    setDraftName(childName ?? '');
  }, [childName]);

  useEffect(() => {
    const handler = () => setEvents(readSessionEvents());
    window.addEventListener('evid_glow_session_events_updated', handler);
    return () => window.removeEventListener('evid_glow_session_events_updated', handler);
  }, []);

  const latestCheckin = useMemo(() => {
    const next = [...events].reverse().find((e) => e.type === 'checkin_saved');
    return next ?? null;
  }, [events]);

  const checkinLabel = (latestCheckin?.payload?.label as string | undefined) ?? null;
  const checkinIntensity = latestCheckin?.payload?.intensity as number | undefined;

  const prompts = useMemo(() => {
    const p1 = checkinLabel
      ? `You logged "${checkinLabel}". You could ask: What was happening when that feeling showed up?`
      : 'You could ask: How does your day feel so far?';
    const p2 = 'Ask: What helped, even a little, today?';
    const p3 = 'Ask: Is there one small thing you want to try tomorrow?';
    return [p1, p2, p3];
  }, [checkinLabel]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    // Keep motion dreamy/subtle: small parallax range around home position.
    setOrbTarget({
      x: (relX - 0.5) * 90,
      y: (relY - 0.5) * 70,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* Hero Bento */}
      <div
        ref={heroRef}
        onMouseEnter={() => setIsHeroHovering(true)}
        onMouseLeave={() => setIsHeroHovering(false)}
        onMouseMove={handleHeroMouseMove}
        className="md:col-span-2 glass-panel rounded-[32px] p-12 flex flex-col justify-between relative overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20"
          animate={
            isHeroHovering
              ? {
                  x: orbTarget.x,
                  y: orbTarget.y,
                  scale: 1.06,
                }
              : {
                  x: [0, -18, 10, 0],
                  y: [0, 12, -8, 0],
                  scale: [1, 1.05, 1],
                }
          }
          transition={
            isHeroHovering
              ? { type: 'spring', stiffness: 90, damping: 20, mass: 0.9 }
              : { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-interactive bg-primary/15"
              aria-hidden
            >
              <ChildAvatarIcon avatarKey={childAvatarKey} className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-5xl font-extrabold text-white tracking-tight">
                Hi,{' '}
                {isEditingName ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={() => {
                      const trimmed = draftName.trim();
                      if (trimmed && trimmed !== (childName ?? '')) {
                        onRenameChildName?.(trimmed);
                      }
                      setIsEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = draftName.trim();
                        if (trimmed && trimmed !== (childName ?? '')) {
                          onRenameChildName?.(trimmed);
                        }
                        setIsEditingName(false);
                      }
                      if (e.key === 'Escape') {
                        setDraftName(childName ?? '');
                        setIsEditingName(false);
                      }
                    }}
                    className="w-[220px] rounded-xl border border-interactive bg-white/10 px-3 py-1 text-3xl text-primary"
                    aria-label="Edit nickname"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
                    aria-label="Edit nickname"
                    title="Click to edit nickname"
                  >
                    {childName ?? 'there'}
                  </button>
                )}
              </h2>
            </div>
          </div>
          <p className="text-tier-secondary text-xl max-w-md leading-relaxed">
            A calm check-in can help you notice how today feels.
          </p>
        </div>

        <button 
          onClick={onCheckIn}
          className="relative z-10 w-fit px-8 py-4 bg-primary text-midnight font-bold rounded-2xl hover:bg-primary/80 transition-all flex items-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Check-in
        </button>
      </div>

      {/* Stats Bento */}
      <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          Things to talk about
        </h3>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px] hide-scrollbar">
          <div className="p-4 bg-white/5 rounded-2xl border border-interactive shrink-0">
            <p className="text-sm text-white/70 leading-relaxed">
              Pick one question. The goal is conversation, not a quiz.
            </p>
          </div>

          {prompts.map((p, idx) => (
            <div
              key={idx}
              className="p-4 bg-white/5 rounded-2xl border border-interactive shrink-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary/70" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-tier-supporting">Prompt {idx + 1}</p>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{p}</p>
              {typeof checkinIntensity === 'number' && idx === 0 && (
                <p className="text-xs text-tier-secondary mt-2">
                  Saved: intensity {checkinIntensity}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bento Row */}
      <div className="glass-panel rounded-[32px] p-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-white">One small step</h4>
          <p className="text-tier-secondary text-sm">Try one calm minute if you need it.</p>
        </div>
      </div>

    </motion.div>
  );
};
