'use client';

import { useEffect, useRef, useCallback } from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional text input for prompts (e.g., rejection reason) */
  input?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
  };
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  input,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    [onCancel, loading]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      // Focus the cancel button by default (safer default for destructive actions)
      requestAnimationFrame(() => {
        cancelButtonRef.current?.focus();
      });
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const titleId = 'confirm-dialog-title';
  const descId = 'confirm-dialog-desc';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={loading ? undefined : onCancel}
        />

        {/* Dialog */}
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6"
        >
          <h2
            id={titleId}
            className="text-lg font-bold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h2>
          <p
            id={descId}
            className="text-sm text-gray-600 dark:text-gray-400 mb-4"
          >
            {message}
          </p>

          {input && (
            <div className="mb-4">
              {input.label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {input.label}
                </label>
              )}
              <input
                type="text"
                data-1p-ignore
                value={input.value}
                onChange={(e) => input.onChange(e.target.value)}
                placeholder={input.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              className="flex-1"
            >
              {loading ? 'Loading...' : confirmLabel}
            </Button>
            <Button
              ref={cancelButtonRef}
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
