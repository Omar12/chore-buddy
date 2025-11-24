import { calculateTotalPoints, hasEnoughPoints, formatPoints } from '../points';
import type { PointsTransaction } from '@/types';

describe('Points Utilities', () => {
  describe('calculateTotalPoints', () => {
    it('should calculate total points from transactions correctly', () => {
      const transactions: PointsTransaction[] = [
        {
          id: '1',
          profileId: 'kid1',
          amount: 10,
          reason: 'chore_completion',
          relatedChoreId: 'chore1',
          relatedRedemptionId: null,
          notes: null,
          createdByProfileId: 'parent1',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          profileId: 'kid1',
          amount: 15,
          reason: 'chore_completion',
          relatedChoreId: 'chore2',
          relatedRedemptionId: null,
          notes: null,
          createdByProfileId: 'parent1',
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          profileId: 'kid1',
          amount: -5,
          reason: 'reward_redemption',
          relatedChoreId: null,
          relatedRedemptionId: 'redemption1',
          notes: null,
          createdByProfileId: 'parent1',
          createdAt: '2024-01-03T00:00:00Z',
        },
      ];

      const total = calculateTotalPoints(transactions);
      expect(total).toBe(20); // 10 + 15 - 5 = 20
    });

    it('should return 0 for empty transactions', () => {
      const total = calculateTotalPoints([]);
      expect(total).toBe(0);
    });

    it('should handle negative totals', () => {
      const transactions: PointsTransaction[] = [
        {
          id: '1',
          profileId: 'kid1',
          amount: 5,
          reason: 'chore_completion',
          relatedChoreId: 'chore1',
          relatedRedemptionId: null,
          notes: null,
          createdByProfileId: 'parent1',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          profileId: 'kid1',
          amount: -10,
          reason: 'reward_redemption',
          relatedChoreId: null,
          relatedRedemptionId: 'redemption1',
          notes: null,
          createdByProfileId: 'parent1',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      const total = calculateTotalPoints(transactions);
      expect(total).toBe(-5);
    });
  });

  describe('hasEnoughPoints', () => {
    it('should return true when user has enough points', () => {
      expect(hasEnoughPoints(100, 50)).toBe(true);
      expect(hasEnoughPoints(50, 50)).toBe(true);
    });

    it('should return false when user does not have enough points', () => {
      expect(hasEnoughPoints(30, 50)).toBe(false);
      expect(hasEnoughPoints(0, 1)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(hasEnoughPoints(0, 0)).toBe(true);
      expect(hasEnoughPoints(-10, 5)).toBe(false);
    });
  });

  describe('formatPoints', () => {
    it('should format points with comma separators', () => {
      expect(formatPoints(1000)).toBe('1,000');
      expect(formatPoints(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatPoints(0)).toBe('0');
      expect(formatPoints(5)).toBe('5');
      expect(formatPoints(99)).toBe('99');
    });

    it('should handle negative numbers', () => {
      expect(formatPoints(-10)).toBe('-10');
      expect(formatPoints(-1000)).toBe('-1,000');
    });
  });
});
