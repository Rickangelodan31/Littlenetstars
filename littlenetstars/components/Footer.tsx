import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              LittleNet<span className="text-yellow-500">Stars</span>
            </span>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Building confidence through netball. Fun, structured training for young players in London & Manchester.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "Our Coaches" },
                { href: "/gallery", label: "Gallery" },
                { href: "/booking", label: "Book a Session" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/cancellation", label: "Cancellation Policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} LittleNetStars. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
