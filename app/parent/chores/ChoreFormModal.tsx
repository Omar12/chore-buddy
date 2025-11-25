'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Profile, CreateChoreInput, Chore } from '@/types';

interface ChoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateChoreInput) => void;
  kidProfiles: Profile[];
  loading: boolean;
  error: string | null;
  title: string;
  initialData?: Chore;
}

export default function ChoreFormModal({
  isOpen,
  onClose,
  onSubmit,
  kidProfiles,
  loading,
  error,
  title,
  initialData,
}: ChoreFormModalProps) {
  const [formData, setFormData] = useState<CreateChoreInput>({
    assignedToProfileId: '',
    title: '',
    description: '',
    pointsValue: 10,
    dueDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        assignedToProfileId: initialData.assignedToProfileId,
        title: initialData.title,
        description: initialData.description || '',
        pointsValue: initialData.pointsValue,
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
      });
    } else {
      // Reset form when modal opens for creation
      if (isOpen) {
        setFormData({
          assignedToProfileId: kidProfiles[0]?.id || '',
          title: '',
          description: '',
          pointsValue: 10,
          dueDate: '',
        });
      }
    }
  }, [isOpen, initialData, kidProfiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign to <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignedToProfileId}
                onChange={(e) => setFormData({ ...formData, assignedToProfileId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a kid</option>
                {kidProfiles.map(kid => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={100}
                placeholder="e.g., Clean your room"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Optional details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Points Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.pointsValue}
                onChange={(e) => setFormData({ ...formData, pointsValue: parseInt(e.target.value) || 0 })}
                required
                min={1}
                max={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
