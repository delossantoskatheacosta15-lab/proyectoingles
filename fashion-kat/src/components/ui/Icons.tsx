import { cn } from '@/lib/utils';

type IconProps = { className?: string };

const base = 'h-5 w-5';

export function IconHanger({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 7a2 2 0 1 1 2-2" strokeLinecap="round" />
      <path d="M12 7v2.2L3.6 15.2A1.4 1.4 0 0 0 4.4 18h15.2a1.4 1.4 0 0 0 .8-2.8L12 9.2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(base, className)}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        d="M12 20s-7.5-4.7-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.3 12 20 12 20z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5.5 8h13l1 12h-15l1-12z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTruck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 7h11v9H2zM13 10h4.5l2.5 3v3h-7z" strokeLinejoin="round" />
      <circle cx="6" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3l7 3v6c0 4.2-2.9 7.7-7 9-4.1-1.3-7-4.8-7-9V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" strokeLinecap="round" />
    </svg>
  );
}

export function IconRefresh({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" strokeLinecap="round" />
      <path d="M20 4v4.5h-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHeadset({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
      <rect x="2.5" y="13.5" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13.5" width="4" height="6" rx="1.5" />
      <path d="M20 19.5v.5a3 3 0 0 1-3 3h-2" strokeLinecap="round" />
    </svg>
  );
}

export function IconWhatsapp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.1 15.1l-.3-.2-3.1.9.9-3-.2-.3A8.1 8.1 0 0 1 12.04 3.8zm-3.1 4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.7c-.2-.4-.4-.4-.5-.4z" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="currentColor">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}

export function IconTiktok({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="currentColor">
      <path d="M16.5 3c.3 2 1.5 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.6-1v5.9c0 5-4.3 6.6-7 4.9-2.4-1.5-2.6-5.2-.4-6.9 1-.8 2.4-1.1 3.6-.8v2.7c-1.3-.4-2.4.5-2.2 1.8.2 1.1 1.5 1.7 2.5 1.1.6-.4.9-1 .9-1.9V3h2.7z" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" strokeLinecap="round" />
      <path d="M6 7l1 13h10l1-13" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconMinus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17v2.5h14V17" strokeLinecap="round" />
    </svg>
  );
}

export function IconBox({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" strokeLinejoin="round" />
      <path d="M4 7l8 4 8-4M12 11v10" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12.5V4h8.5L21 13.5 13.5 21 3 12.5z" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3.5 7l8.5 6 8.5-6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5L14 12l4 1.5V17a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15.9H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 5.6V5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19a6 6 0 0 1 12 0" strokeLinecap="round" />
      <path d="M16 6.2a3.2 3.2 0 0 1 0 6M17.5 19a6 6 0 0 0-1.5-4" strokeLinecap="round" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M12 3.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 10.1l6.2-.9L12 3.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(base, className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 7V5.5A1.5 1.5 0 0 0 12.5 4h-6A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h6a1.5 1.5 0 0 0 1.5-1.5V17" strokeLinecap="round" />
      <path d="M10 12h10m0 0l-3-3m3 3l-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
