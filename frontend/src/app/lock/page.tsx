import { Suspense } from 'react';
import { LockForm } from '@/features/lock';

export default function LockPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lock Your{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Tokens
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Deposit your tokens and earn rewards from early withdrawals. Your principal is always protected.
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LockForm />
        </Suspense>
      </div>
    </div>
  );
}
