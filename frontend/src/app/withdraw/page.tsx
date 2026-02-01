'use client';

import { WithdrawList } from '@/features/withdraw';

export default function WithdrawPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Deposits
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your locked token deposits
          </p>
        </div>

        <WithdrawList />
      </div>
    </div>
  );
}
