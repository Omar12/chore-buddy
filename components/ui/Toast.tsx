'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

function ToastIcon({ type }: { type: 'success' | 'error' | 'info' }) {
  if (type === 'success') {
    return (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path
          d="M6 10.5l2.5 2.5 5.5-5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 24, animation: 'checkmark-draw 0.4s ease-out 0.15s both' }}
        />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M10 6v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-success-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-md animate-slide-up ${typeStyles[type]}`}
    >
      <ToastIcon type={type} />
      {message}
    </div>
  );
}
