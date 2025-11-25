'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import type { CreateProfileInput, Profile, ProfileRole } from '@/types';

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProfileInput) => void;
  loading: boolean;
  error: string | null;
  title: string;
  type: 'parent' | 'kid';
  initialData?: Profile;
}

export default function ProfileFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  title,
  type,
  initialData,
}: ProfileFormModalProps) {
  const [formData, setFormData] = useState<CreateProfileInput>({
    familyId: '',
    name: '',
    role: type === 'kid' ? 'kid' : 'parent',
    avatarUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        familyId: initialData.familyId,
        name: initialData.name,
        role: initialData.role,
        avatarUrl: initialData.avatarUrl || '',
      });
    } else {
      // Reset form when modal opens for creation
      if (isOpen) {
        setFormData({
          familyId: '',
          name: '',
          role: type === 'kid' ? 'kid' : 'parent',
          avatarUrl: '',
        });
      }
    }
  }, [isOpen, initialData, type]);

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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                placeholder={type === 'kid' ? "Kid's name" : "Parent/Helper's name"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Role (only for adults) */}
            {type !== 'kid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as ProfileRole })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="parent">Parent</option>
                  <option value="helper">Helper</option>
                </select>
              </div>
            )}

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Or use default avatars from DiceBear
              </p>
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
