'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Layers, 
  HelpCircle, 
  FileSignature, 
  ArrowLeft 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: 'Stats Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Services', href: '/admin/services', icon: Layers },
    { name: 'Survey Questions', href: '/admin/questions', icon: HelpCircle },
    { name: 'Recommendation Rules', href: '/admin/rules', icon: ShieldAlert },
    { name: 'Client Quotations', href: '/admin/quotations', icon: FileSignature },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4">
      {/* Sidebar Admin Menu */}
      <aside className="w-full lg:w-64 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-5 self-start bg-slate-900/40">
        <div className="border-b border-white/5 pb-3 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Control Hub</span>
          <h2 className="text-sm font-bold text-slate-100">Portal Settings</h2>
        </div>
        
        <nav className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-white/5 pt-4 mt-auto hidden lg:block">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Section */}
      <div className="flex-grow flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
