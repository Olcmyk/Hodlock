"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LockForm } from "@/features/lock";

function LockPageContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lock Your Tokens
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deposit your tokens and earn rewards from early withdrawers.
            Your principal is always 100% protected.
          </p>
        </div>

        <LockForm initialTokenAddress={tokenParam || undefined} />
      </div>
    </div>
  );
}

export default function LockPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center">Loading...</div>}>
      <LockPageContent />
    </Suspense>
  );
}
