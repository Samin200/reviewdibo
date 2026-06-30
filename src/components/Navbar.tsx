"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setUser(await res.json());
      }
    } catch {
      // unauthenticated users are allowed
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return null;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 py-2 shadow-lg shadow-slate-200/50 backdrop-blur-2xl"
          : "bg-transparent py-4"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg transition-all duration-300 ${scrolled ? "bg-gradient-to-br from-indigo-600 to-blue-600 shadow-indigo-500/25" : "bg-white/15 shadow-white/10 ring-1 ring-white/20"}`}>
            R
          </div>
          <div className="leading-none">
            <span className={`block text-xl font-black tracking-[-0.04em] transition-colors ${scrolled ? "text-slate-950" : "text-white"}`}>
              Review<span className={scrolled ? "text-indigo-600" : "text-white/80"}>Dibo</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#products"
            className={`hidden rounded-2xl px-4 py-2 text-sm font-semibold transition-all sm:inline-flex ${
              scrolled
                ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            Products
          </Link>

          {loaded && user && user.role === "admin" && (
            <Link
              href="/admin"
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
                scrolled
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 hover:bg-indigo-600"
                  : "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/20"
              }`}
            >
              Admin
            </Link>
          )}

          {loaded && user ? (
            <button
              onClick={handleLogout}
              className={`min-h-10 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
                scrolled
                  ? "border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  : "border border-white/20 bg-white/8 text-white hover:bg-white/15"
              }`}
            >
              Logout
            </button>
          ) : loaded ? (
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/35 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Sign In
            </Link>
          ) : (
            <div className="h-10 w-20 animate-pulse rounded-2xl bg-white/10" />
          )}
        </div>
      </nav>
    </header>
  );
}
