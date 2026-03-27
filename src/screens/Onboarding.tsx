import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Palette, UserRound, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { AVATAR_CHOICES, DEFAULT_AVATAR_KEY, resolveAvatarKey } from '../lib/childAvatar';

export type ChildProfile = {
  nickname: string;
  colorKey: string;
  avatarKey: string;
};

const CHILD_PROFILE_KEY = 'evid_glow_child_profile';

const COLOUR_CHOICES: Array<{ key: string; label: string; cssBg: string; cssText: string }> = [
  { key: 'teal', label: 'Teal', cssBg: 'bg-[#2DD4BF]/15', cssText: 'text-[#2DD4BF]' },
  { key: 'blue', label: 'Blue', cssBg: 'bg-[#3B82F6]/15', cssText: 'text-[#3B82F6]' },
  { key: 'rose', label: 'Rose', cssBg: 'bg-[#FB7185]/15', cssText: 'text-[#FB7185]' },
  { key: 'amber', label: 'Amber', cssBg: 'bg-[#FBBF24]/15', cssText: 'text-[#FBBF24]' },
  { key: 'purple', label: 'Purple', cssBg: 'bg-[#A78BFA]/15', cssText: 'text-[#A78BFA]' },
];

function safeLoadProfile(): ChildProfile | null {
  try {
    const raw = localStorage.getItem(CHILD_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChildProfile> & { nickname?: string };
    if (!parsed || typeof parsed.nickname !== 'string') return null;
    return {
      nickname: parsed.nickname,
      colorKey: typeof parsed.colorKey === 'string' ? parsed.colorKey : 'teal',
      avatarKey: resolveAvatarKey(parsed.avatarKey),
    };
  } catch {
    return null;
  }
}

export function getChildProfile(): ChildProfile | null {
  return safeLoadProfile();
}

export const Onboarding = ({ onComplete }: { onComplete: (profile: ChildProfile) => void }) => {
  const existing = useMemo(() => safeLoadProfile(), []);
  const [nickname, setNickname] = useState(existing?.nickname ?? '');
  const [colorKey, setColorKey] = useState(existing?.colorKey ?? COLOUR_CHOICES[0].key);
  const [avatarKey, setAvatarKey] = useState(existing?.avatarKey ?? DEFAULT_AVATAR_KEY);

  const selectedColour = COLOUR_CHOICES.find((c) => c.key === colorKey) ?? COLOUR_CHOICES[0];

  const canContinue = nickname.trim().length >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4 sm:p-8 flex items-center justify-center"
    >
      <motion.div
        className="w-full max-w-2xl glass-panel rounded-[40px] p-6 sm:p-10 overflow-hidden relative"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Set up your profile
              </h2>
              <p className="text-tier-secondary text-sm sm:text-base mt-1">
                This is your app. You choose your name, a mark, and your colour.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-tier-supporting uppercase tracking-widest mb-2 block">
                Your name
              </label>
              <div className="relative">
                <UserRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tier-supporting" />
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Type a nickname"
                  className="w-full bg-white/5 border border-interactive rounded-2xl pl-12 pr-4 py-3 text-tier-primary placeholder:text-tier-secondary focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <p className="text-xs text-tier-secondary mt-2">
                You do this part. No one else needs to type it for you.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-tier-supporting uppercase tracking-widest mb-2 block">
                Pick a mark
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_CHOICES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAvatarKey(key)}
                    title={label}
                    aria-label={label}
                    aria-pressed={avatarKey === key}
                    className={cn(
                      'rounded-2xl border min-h-12 flex items-center justify-center transition-all',
                      avatarKey === key
                        ? 'border-primary bg-primary/15 scale-105'
                        : 'border-interactive bg-white/5 hover:border-white/25 hover:bg-white/10'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', avatarKey === key ? 'text-primary' : 'text-white/70')} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-tier-secondary mt-2">
                Your mark shows next to your name in the app.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-tier-supporting uppercase tracking-widest mb-2 block flex items-center gap-2">
                <Palette className="w-4 h-4 text-tier-supporting" />
                Pick a colour
              </label>
              <div className="grid grid-cols-5 gap-3">
                {COLOUR_CHOICES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColorKey(c.key)}
                    aria-label={`Select ${c.label}`}
                    aria-pressed={c.key === colorKey}
                    className={cn(
                      'rounded-2xl border transition-all min-h-12 flex items-center justify-center',
                      c.key === colorKey ? 'border-white/35 scale-105' : 'border-interactive hover:border-white/20'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', c.cssBg, c.cssText, c.key === colorKey ? 'border-white/20' : 'border-transparent')}>
                      <span className="text-[11px] font-bold">{c.label.slice(0, 1)}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-tier-secondary mt-2">
                Your colour shows up across the app.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-end">
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                const profile: ChildProfile = {
                  nickname: nickname.trim(),
                  colorKey,
                  avatarKey,
                };
                localStorage.setItem(CHILD_PROFILE_KEY, JSON.stringify(profile));
                onComplete(profile);
              }}
              className={cn(
                'px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20',
                canContinue ? 'bg-primary text-midnight hover:bg-primary/80' : 'bg-white/5 text-white/30 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

