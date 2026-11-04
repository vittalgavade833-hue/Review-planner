/**
 * KnowledgeTrack Automatic Review Calculator
 * 
 * Rules:
 * NEXT REVIEW DATE = LAST REVIEWED DATE + REVIEW INTERVAL
 * 
 * CURRENT: More than 30 days remaining (> 30)
 * DUE SOON: 30 days or less remaining (0 <= days <= 30)
 * OVERDUE: Review date has passed (< 0 days remaining)
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

export const calculateNextReviewDate = (lastReviewedDate, intervalDays) => {
  const lastDate = parseSafeDate(lastReviewedDate);
  const nextDate = new Date(lastDate.getTime() + Number(intervalDays) * 24 * 60 * 60 * 1000);
  return nextDate;
};

export const calculateReviewStatus = (nextReviewDate, referenceDate = new Date()) => {
  const targetDate = parseSafeDate(nextReviewDate);
  const refDate = parseSafeDate(referenceDate);

  // Normalize midday to avoid local daylight savings or timezone boundary drift
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0).getTime();
  const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 12, 0, 0).getTime();

  const diffMs = targetMidnight - refMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let status = 'CURRENT';
  let badgeColor = 'green';
  let statusText = '';

  if (diffDays < 0) {
    status = 'OVERDUE';
    badgeColor = 'red';
    const overdueCount = Math.abs(diffDays);
    statusText = `Overdue by ${overdueCount} day${overdueCount === 1 ? '' : 's'}`;
  } else if (diffDays <= 30) {
    status = 'DUE SOON';
    badgeColor = 'yellow';
    if (diffDays === 0) {
      statusText = 'Due today';
    } else {
      statusText = `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
    }
  } else {
    status = 'CURRENT';
    badgeColor = 'green';
    statusText = `${diffDays} days remaining`;
  }

  return {
    status,
    daysRemaining: diffDays,
    statusText,
    badgeColor,
    isOverdue: status === 'OVERDUE',
    isDueSoon: status === 'DUE SOON',
    isCurrent: status === 'CURRENT',
  };
};

export const computeArticleReviewFields = (lastReviewedDate, reviewInterval, referenceDate = new Date()) => {
  const nextReviewDate = calculateNextReviewDate(lastReviewedDate, reviewInterval);
  const { status, daysRemaining, statusText, badgeColor } = calculateReviewStatus(nextReviewDate, referenceDate);
  return {
    nextReviewDate,
    status,
    daysRemaining,
    statusText,
    badgeColor,
  };
};
