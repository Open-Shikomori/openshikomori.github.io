import type { AvatarOption } from '@/types/contribution';

// Comorian cultural avatars - emoji based with custom backgrounds
export const avatarOptions: AvatarOption[] = [
  // Ocean/Waves
  { id: 'wave-teal', emoji: '🌊', label: 'Wave Teal', bgColor: '#0d9488' },
  { id: 'wave-navy', emoji: '🌊', label: 'Wave Navy', bgColor: '#1e3a5f' },
  { id: 'wave-azure', emoji: '🌊', label: 'Wave Azure', bgColor: '#0ea5e9' },

  // Palms
  { id: 'palm-sunset', emoji: '🌴', label: 'Palm Sunset', bgColor: '#f97316' },
  { id: 'palm-day', emoji: '🌴', label: 'Palm Day', bgColor: '#22c55e' },
  { id: 'palm-night', emoji: '🌴', label: 'Palm Night', bgColor: '#4c1d95' },

  // Mashua (traditional boat)
  { id: 'mashua-golden', emoji: '⛵', label: 'Mashua Golden', bgColor: '#eab308' },
  { id: 'mashua-crimson', emoji: '⛵', label: 'Mashua Crimson', bgColor: '#dc2626' },

  // Instruments
  { id: 'drum-earth', emoji: '🥁', label: 'Drum Earth', bgColor: '#92400e' },
  { id: 'guitar-ocean', emoji: '🎸', label: 'Guitar Ocean', bgColor: '#0369a1' },

  // Nature
  { id: 'turtle-green', emoji: '🐢', label: 'Turtle Green', bgColor: '#15803d' },
  { id: 'fish-blue', emoji: '🐟', label: 'Fish Blue', bgColor: '#2563eb' },
  { id: 'hibiscus-pink', emoji: '🌺', label: 'Hibiscus Pink', bgColor: '#db2777' },
  { id: 'shell-sand', emoji: '🐚', label: 'Shell Sand', bgColor: '#d6d3d1' },

  // Celestial
  { id: 'star-gold', emoji: '⭐', label: 'Star Gold', bgColor: '#713f12' },
  { id: 'moon-silver', emoji: '🌙', label: 'Moon Silver', bgColor: '#475569' },
  { id: 'sun-orange', emoji: '☀️', label: 'Sun Orange', bgColor: '#ea580c' },

  // Cultural
  { id: 'coffee-warm', emoji: '☕', label: 'Coffee Warm', bgColor: '#78350f' },
  { id: 'spice-red', emoji: '🌶️', label: 'Spice Red', bgColor: '#991b1b' },
  { id: 'mountain-green', emoji: '⛰️', label: 'Mountain Green', bgColor: '#365314' },
];

export const getAvatarById = (id: string): AvatarOption | undefined => {
  return avatarOptions.find(avatar => avatar.id === id);
};

export const getDefaultAvatar = (): AvatarOption => avatarOptions[0]!;
