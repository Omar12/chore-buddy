import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

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
