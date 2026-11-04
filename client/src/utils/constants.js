export const CATEGORIES = [
  'HR',
  'IT',
  'Finance',
  'Operations',
  'Security',
  'Product',
  'Engineering',
  'Other',
];

export const REVIEW_INTERVALS = [
  { value: 30, label: '30 days (Monthly review)' },
  { value: 60, label: '60 days (Bi-monthly review)' },
  { value: 90, label: '90 days (Quarterly review)' },
  { value: 180, label: '180 days (Semi-annual review)' },
  { value: 365, label: '365 days (Annual review)' },
];

export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Knowledge Owner',
  VIEWER: 'Viewer',
};

export const STATUS_COLORS = {
  CURRENT: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    label: 'Current',
  },
  'DUE SOON': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
    iconColor: 'text-amber-600',
    label: 'Due Soon',
  },
  OVERDUE: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dot: 'bg-rose-500 animate-ping',
    iconColor: 'text-rose-600',
    label: 'Overdue',
  },
};
