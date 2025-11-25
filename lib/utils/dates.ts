import { format, isToday, isTomorrow, isYesterday, isPast, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return 'No due date';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get a human-friendly relative date string
 */
export function getRelativeDateString(dateString: string | null): string {
  if (!dateString) return 'No due date';

  try {
    const date = parseISO(dateString);

    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';

    return formatDate(dateString, 'MMM d');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Check if a chore is overdue
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;

  try {
    const date = parseISO(dueDate);
    return isPast(date) && !isToday(date);
  } catch {
    return false;
  }
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'Unknown';

  try {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    if (isYesterday(date)) {
      return 'Yesterday';
    }

    if (isTomorrow(date)) {
      return 'Tomorrow';
    }

    // For dates more than a day away, show the formatted date
    const now = new Date();
    const diffInDays = Math.abs(Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (diffInDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}
