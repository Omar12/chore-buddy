'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createManualAdjustment } from '@/app/api/points/actions';
import type { Profile } from '@/types';

interface KidWithPoints {
  profile: Profile;
  points: number;
}

interface PointsAdjustmentSectionProps {
  kidsWithPoints: KidWithPoints[];
}

export default function PointsAdjustmentSection({ kidsWithPoints }: PointsAdjustmentSectionProps) {
  const router = useRouter();
  const [selectedKid, setSelectedKid] = useState<string>(kidsWithPoints[0]?.profile.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (kidsWithPoints.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No kids to adjust points for
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createdByProfileId = sessionStorage.getItem('selected_profile_id');
      if (!createdByProfileId) {
        setError('Profile not selected');
        return;
      }

      await createManualAdjustment(selectedKid, amount, notes || '', createdByProfileId);

      // Reset form
      setAmount(0);
      setNotes('');
      router.refresh();
    } catch (err) {
      console.error('Failed to adjust points:', err);
      setError('Failed to adjust points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedKidData = kidsWithPoints.find(k => k.profile.id === selectedKid);

  return (
    <Card>
      <CardContent className="py-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manually add or remove points from a kid&apos;s balance. Use positive numbers to add points, negative to remove.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kid Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Kid <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKid}
              onChange={(e) => setSelectedKid(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {kidsWithPoints.map(({ profile, points }) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} (Current: {points} points)
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance Display */}
          {selectedKidData && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{selectedKidData.profile.name}</span> currently has{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedKidData.points} points
                </span>
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              required
              placeholder="e.g., 10 or -5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use positive numbers to add points, negative to subtract
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Bonus for good behavior, Penalty for breaking rules..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Preview */}
          {amount !== 0 && selectedKidData && (
            <div className={`p-3 rounded-md ${amount > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                New balance will be:{' '}
                <span className={`font-bold ${amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {selectedKidData.points + amount} points
                </span>
                {' '}({amount > 0 ? '+' : ''}{amount} points)
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || amount === 0}
            fullWidth
          >
            {loading ? 'Adjusting...' : 'Adjust Points'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
