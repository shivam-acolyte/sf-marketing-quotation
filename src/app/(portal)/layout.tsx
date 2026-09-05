'use client';

import { Outfit } from 'next/font/google';
import '../globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // If in admin panel, render clean container matching exact warm neutral admin background
  if (isAdmin) {
    return (
      <div className="font-sans antialiased min-h-screen w-full flex flex-col bg-[#f6f6f1] text-slate-900">
        {children}
      </div>
    );
  }

  // Customer facing portal (e.g. /quotation/[id])
  return (
    <div className={`${outfit.className} dark-portal antialiased min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern relative overflow-x-hidden flex flex-col`}>
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none z-0" />
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-orange-400 bg-clip-text text-transparent tracking-wide">
                StartupFlora
              </span>
              <span className="text-xs uppercase bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-semibold tracking-wider">
                Portal
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/50 px-3.5 py-1.5 rounded-lg transition-all"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="z-10 border-t border-white/5 py-6 text-center text-xs text-slate-500 bg-slate-950/20 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Antigravity Solutions. All rights reserved. Empowered by AI.</p>
      </footer>
    </div>
  );
}
