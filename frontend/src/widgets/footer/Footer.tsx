'use client';

import Link from 'next/link';
import { Lock, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <Lock className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Hodlock
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/Olcmyk/Hodlock"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </Link>
            <Link
              href="https://x.com/hodlockfi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="text-sm">Twitter</span>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Hodlock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
