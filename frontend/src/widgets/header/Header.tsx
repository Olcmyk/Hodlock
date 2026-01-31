"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { href: "/lock", label: "Lock" },
  { href: "/swap", label: "Swap" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/invite", label: "Invite" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Lock className="w-7 h-7 text-primary-500 group-hover:text-primary-600 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Hodlock
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:text-primary-600 hover:bg-primary-50/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side: Connect Wallet */}
          <div className="flex items-center gap-4">
            <appkit-button />
          </div>
        </div>
      </div>
    </header>
  );
}
