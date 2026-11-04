/**
 * Date and Review Calculation Utilities
 */

export const parseSafeDate = (input) => {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = parseSafeDate(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = parseSafeDate(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = parseSafeDate(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return formatDate(dateString);
  }
  if (diffDay > 1) {
    return `${diffDay} days ago`;
  }
  if (diffDay === 1) {
    return 'Yesterday';
  }
  if (diffHour >= 1) {
    return `${diffHour} hr${diffHour === 1 ? '' : 's'} ago`;
  }
  if (diffMin >= 1) {
    return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  }
  return 'Just now';
};

export const calculateNextReviewDate = (lastReviewedDate, intervalDays) => {
  if (!lastReviewedDate || !intervalDays) return new Date();
  const last = parseSafeDate(lastReviewedDate);
  return new Date(last.getTime() + Number(intervalDays) * 24 * 60 * 60 * 1000);
};

export const calculateStatusInfo = (nextReviewDate, referenceDate = new Date()) => {
  if (!nextReviewDate) {
    return { status: 'CURRENT', daysRemaining: 0, statusText: 'Current', badgeColor: 'green' };
  }

  const targetDate = parseSafeDate(nextReviewDate);
  const refDate = parseSafeDate(referenceDate);

  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0).getTime();
  const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 12, 0, 0).getTime();

  const diffMs = targetMidnight - refMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueCount = Math.abs(diffDays);
    return {
      status: 'OVERDUE',
      daysRemaining: diffDays,
      statusText: `Overdue by ${overdueCount} day${overdueCount === 1 ? '' : 's'}`,
      badgeColor: 'red',
    };
  } else if (diffDays <= 30) {
    return {
      status: 'DUE SOON',
      daysRemaining: diffDays,
      statusText: diffDays === 0 ? 'Due today' : `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`,
      badgeColor: 'yellow',
    };
  } else {
    return {
      status: 'CURRENT',
      daysRemaining: diffDays,
      statusText: `${diffDays} days remaining`,
      badgeColor: 'green',
    };
  }
};
