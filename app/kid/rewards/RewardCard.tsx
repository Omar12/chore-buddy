'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { requestRedemption } from '@/app/api/rewards/actions';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  currentPoints: number;
  profileId: string;
}

export default function RewardCard({ reward, currentPoints, profileId }: RewardCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');
  const [showConfirm, setShowConfirm] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);
  const canAfford = currentPoints >= reward.pointsCost;

  const handleRedeem = () => {
    if (!canAfford) {
      setToastMessage(`You need ${reward.pointsCost - currentPoints} more points to redeem this reward!`);
      setToastType('info');
      setShowToast(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmRedeem = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await requestRedemption(reward.id, profileId);
      setToastMessage('Requested! Your parents will review it soon.');
      setToastType('success');
      setShowToast(true);
      setJustRedeemed(true);
      router.refresh();
    } catch (error) {
      console.error('Failed to request redemption:', error);
      setToastMessage('Failed to request redemption. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className={`transition-all duration-200 ${!canAfford ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-0.5'} ${justRedeemed ? 'border-success-300 dark:border-success-700' : ''}`}>
        <CardContent className="py-6">
          <div className="flex flex-col h-full">
            <div className="flex-1 mb-4">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                {reward.name}
              </h3>
              {reward.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {reward.description}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {reward.pointsCost}
                </span>
                <span className="text-gray-600 dark:text-gray-400">points</span>
              </div>
              {!canAfford && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Need {reward.pointsCost - currentPoints} more points
                </p>
              )}
            </div>
            <Button
              onClick={handleRedeem}
              disabled={!canAfford || loading}
              fullWidth
              variant={canAfford ? 'primary' : 'outline'}
            >
              {loading ? 'Requesting...' : canAfford ? <><span aria-hidden="true">🎁</span> Redeem</> : <><span aria-hidden="true">🔒</span> Not Enough Points</>}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Redeem Reward"
        message={`Are you sure you want to request "${reward.name}" for ${reward.pointsCost} points?`}
        confirmLabel="Request"
        cancelLabel="Cancel"
        variant="primary"
        loading={false}
        onConfirm={handleConfirmRedeem}
        onCancel={() => setShowConfirm(false)}
      />
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
