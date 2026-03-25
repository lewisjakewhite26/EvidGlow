import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Star, Heart, Leaf, Zap, Sun, Moon, Compass, CircleDot } from 'lucide-react';

export const DEFAULT_AVATAR_KEY = 'star';

export const AVATAR_CHOICES: ReadonlyArray<{ key: string; label: string; Icon: LucideIcon }> = [
  { key: 'star', label: 'Star', Icon: Star },
  { key: 'heart', label: 'Heart', Icon: Heart },
  { key: 'leaf', label: 'Leaf', Icon: Leaf },
  { key: 'bolt', label: 'Bolt', Icon: Zap },
  { key: 'sun', label: 'Sun', Icon: Sun },
  { key: 'moon', label: 'Moon', Icon: Moon },
  { key: 'compass', label: 'Compass', Icon: Compass },
  { key: 'dot', label: 'Ring', Icon: CircleDot },
];

const KEY_SET = new Set(AVATAR_CHOICES.map((a) => a.key));

export function isValidAvatarKey(key: string | undefined | null): key is string {
  return typeof key === 'string' && KEY_SET.has(key);
}

export function resolveAvatarKey(key: string | undefined | null): string {
  return isValidAvatarKey(key) ? key : DEFAULT_AVATAR_KEY;
}

export function getAvatarIcon(key: string | undefined | null): LucideIcon {
  const k = resolveAvatarKey(key);
  return AVATAR_CHOICES.find((a) => a.key === k)?.Icon ?? Star;
}

export function ChildAvatarIcon({
  avatarKey,
  className,
  'aria-hidden': ariaHidden = true,
}: {
  avatarKey?: string | null;
  className?: string;
  'aria-hidden'?: boolean;
}) {
  const Icon = getAvatarIcon(avatarKey);
  return <Icon className={className} aria-hidden={ariaHidden} />;
}
