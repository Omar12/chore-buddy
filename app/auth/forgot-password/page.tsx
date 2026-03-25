'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '../actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Chore Buddy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Reset your password</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {success ? (
            <div className="space-y-4">
              <div className="bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 px-4 py-3 rounded-lg text-sm">
                Check your email for a password reset link.
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We&apos;ve sent you an email with instructions to reset your password.
                If you don&apos;t see it, check your spam folder.
              </p>
              <Link
                href="/auth/login"
                className="block w-full text-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/auth/login"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
