export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  // Web's deliberate custom form/filter field rhythm value (space-y-[18px]/gap-[18px]),
  // sits between the default lg (16) and xl (24) steps.
  formGap: 18,
  xl: 24,
  xxl: 32,
} as const;

// Matches the web app's tailwind.config.ts borderRadius scale exactly
// ("4321-Drive design system v3 — Sunset Coral"): control/lg 11px, card 18px, etc.
export const radii = {
  sm: 7,
  md: 11, // web's rounded-control/rounded-lg — used by AppButton and AppInput
  lg: 14, // web's rounded-media
  card: 18, // web's rounded-card — used by AppCard
  chip: 8, // web's rounded-chip
  sheet: 26, // web's rounded-sheet, for future modals/bottom-sheets
  full: 999,
} as const;

// Matches AppText's variant sizes exactly (title/subtitle/body/caption+label) — this is
// the single source of truth AppText reads from, not a separate/duplicate scale.
export const fontSize = {
  sm: 13, // caption, label
  md: 15, // body
  lg: 18, // subtitle
  xl: 24, // title
} as const;

// Warm-tinted shadows (rgba(60,20,30,...)) matching web's boxShadow scale — grey shadows
// read as dirt on a warm page, per the web design system's own comment. iOS uses the
// shadow* props, Android uses elevation (approximated, RN can't replicate multi-layer
// CSS box-shadows exactly).
export const shadows = {
  xs: { shadowColor: '#3C141E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sm: { shadowColor: '#3C141E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#3C141E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 24, elevation: 4 },
  lg: { shadowColor: '#3C141E', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.16, shadowRadius: 60, elevation: 8 },
  // Coral glow, for the primary CTA button only — matches web's shadow-coral.
  coral: { shadowColor: '#FF4E64', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 6 },
} as const;

// Matches the web app's tailwind.config.ts + app/globals.css "4321-Drive design system v3
// — Sunset Coral" palette exactly (hex values, not the legacy HSL shadcn twins).
const brand = {
  primaryLight: '#FF4E64', // brand-600
  primaryDark: '#FF6B7D', // lightened for contrast on a dark background — web has no dark mode to match, so this is our own extrapolation
};

// Matches web's tailwind.config.ts colors.status.* dot values exactly.
const statusTones = {
  neutral: '#64748B', // slate
  info: '#2563EB', // blue
  success: '#059669', // emerald
  warning: '#D97706', // amber
  danger: '#DC2626', // red
  accent: '#7C3AED', // violet (CONTACTED)
  complete: '#0D9488', // teal (COMPLETED)
};

export const lightColors = {
  background: '#FFF7F3', // web: page
  surface: '#FFFFFF', // web: surface
  surfaceAlt: '#FFF1EA', // web: surface-hover
  border: '#F0DFD7', // web: border-subtle
  borderStrong: '#E2CBC1', // web: border-strong — default Input/control border
  text: '#1A0F14', // web: ink
  textMuted: '#7A5F68', // web: text-muted
  textFaint: '#A98D96', // web: text-faint — placeholders, helper text
  textInverse: '#FFFFFF',
  primary: brand.primaryLight,
  primaryText: '#FFFFFF',
  ...statusTones,
};

export const darkColors = {
  // Web is light-mode only (color-scheme forced light), so this dark palette is our own
  // warm-dark extrapolation of the same brand identity, not a direct web port.
  background: '#150C10',
  surface: '#241419',
  surfaceAlt: '#2E1922',
  border: '#3D232C',
  borderStrong: '#4F2E39',
  text: '#FFF7F3',
  textMuted: '#C9A3AC',
  textFaint: '#9C7A83',
  textInverse: '#1A0F14',
  primary: brand.primaryDark,
  primaryText: '#FFFFFF',
  ...statusTones,
};

export type ThemeColors = typeof lightColors;

// bg/fg pairs mirror web's tailwind.config.ts colors.status.* exactly in light mode;
// dark mode uses the existing saturated-900/light-200 pattern (web has no dark badges).
export const statusToneColors = {
  light: {
    neutral: { bg: '#F8FAFC', fg: '#334155' }, // slate
    info: { bg: '#EFF6FF', fg: '#1E3A8A' }, // blue
    success: { bg: '#ECFDF5', fg: '#065F46' }, // emerald
    warning: { bg: '#FFFBEB', fg: '#92400E' }, // amber
    danger: { bg: '#FEF2F2', fg: '#991B1B' }, // red
    accent: { bg: '#F5F3FF', fg: '#5B21B6' }, // violet
    complete: { bg: '#F0FDFA', fg: '#115E59' }, // teal
  },
  dark: {
    neutral: { bg: '#1F2937', fg: '#CBD5E1' },
    info: { bg: '#1E3A8A', fg: '#BFDBFE' },
    success: { bg: '#064E3B', fg: '#A7F3D0' },
    warning: { bg: '#78350F', fg: '#FDE68A' },
    danger: { bg: '#7F1D1D', fg: '#FECACA' },
    accent: { bg: '#4C1D95', fg: '#DDD6FE' },
    complete: { bg: '#134E4A', fg: '#99F6E4' },
  },
} as const;
