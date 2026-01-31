import { DepositList } from "@/features/withdraw";

export default function WithdrawPage() {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Deposits
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage your locked deposits. Withdraw when unlocked or
            pay the penalty for early withdrawal.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <DepositList />
        </div>
      </div>
    </div>
  );
}
