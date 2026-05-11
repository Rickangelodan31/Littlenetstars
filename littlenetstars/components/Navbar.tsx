import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/kit", label: "Kit" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/join-the-team", label: "Join the Team" },
  { href: "/contact", label: "Contact" },
];

const dropdownLinks = [
  { href: "/camp", label: "Camp" },
  { href: "/schools", label: "Schools & Nurseries" },
  { href: "/subscriptions", label: "Monthly Plans" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo1.png"
              alt="LittleNetStars"
              width={200}
              height={80}
              className="h-22 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {/* Programmes dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Programmes
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1">
                  {dropdownLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/booking"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Book Now
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {open ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {l.label}
            </Link>
          ))}
          {dropdownLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            className="block bg-purple-600 text-white text-center px-4 py-2 rounded-full text-sm font-semibold"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
