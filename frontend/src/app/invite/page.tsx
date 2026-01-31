import { InvitePanel } from "@/features/invite";

export default function InvitePage() {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Invite Friends
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your referral link and earn a portion of your referrals&apos;
            early withdrawal penalties.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <InvitePanel />
        </div>
      </div>
    </div>
  );
}
