'use client';

import { InvitePanel } from '@/features/invite';

export default function InvitePage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-white via-pink-50/30 to-white">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Invite{' '}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Friends
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your referral link and earn 30% of your referrals&apos; early withdrawal penalties forever
          </p>
        </div>

        <InvitePanel />
      </div>
    </div>
  );
}
