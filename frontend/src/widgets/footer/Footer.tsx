import Link from "next/link";
import { Lock } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  {
    href: "https://github.com/Olcmyk/Hodlock",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://x.com/hodlockfi",
    icon: FaXTwitter,
    label: "Twitter",
  },
];

const footerLinks = [
  { href: "/lock", label: "Lock" },
  { href: "/swap", label: "Swap" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/invite", label: "Invite" },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Lock className="w-7 h-7 text-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Hodlock
              </span>
            </Link>
            <p className="text-gray-500 text-sm max-w-md">
              Principal-protected on-chain certificate of deposit. Lock your tokens,
              earn rewards from early withdrawers, and build your HODL streak.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Hodlock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
