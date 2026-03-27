'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [formData, setFormData] = useState<CreateProfileInput>({
    familyId: '',
    name: '',
    role: type === 'kid' ? 'kid' : 'parent',
    avatarUrl: '',
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        const firstInput = dialogRef.current?.querySelector<HTMLElement>('input, select');
        firstInput?.focus();
      });
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      const elToFocus = previousFocusRef.current;
      requestAnimationFrame(() => elToFocus?.focus());
    };
  }, [isOpen, handleKeyDown]);

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

  const titleId = 'profile-modal-title';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={loading ? undefined : onClose}
        />

        {/* Modal */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <h2 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="profile-name"
                type="text"
                data-1p-ignore
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                aria-required="true"
                maxLength={100}
                placeholder={type === 'kid' ? "Kid's name" : "Parent/Helper's name"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Role (only for adults) */}
            {type !== 'kid' && (
              <div>
                <label htmlFor="profile-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="profile-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as ProfileRole })}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="parent">Parent</option>
                  <option value="helper">Helper</option>
                </select>
              </div>
            )}

            {/* Avatar URL */}
            <div>
              <label htmlFor="profile-avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar URL (optional)
              </label>
              <input
                id="profile-avatar"
                type="url"
                data-1p-ignore
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                aria-describedby="profile-avatar-hint"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p id="profile-avatar-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
