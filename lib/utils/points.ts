import type { PointsTransaction } from '@/types';

/**
 * Calculate the total points for a profile from their transactions
 */
export function calculateTotalPoints(transactions: PointsTransaction[]): number {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Check if a profile has enough points for a reward
 */
export function hasEnoughPoints(currentPoints: number, requiredPoints: number): boolean {
  return currentPoints >= requiredPoints;
}

/**
 * Format points display with appropriate styling
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}
