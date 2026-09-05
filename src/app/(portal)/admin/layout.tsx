'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Leaf,
  Plus,
  LayoutDashboard,
  BarChart2,
  FileText,
  Layers,
  Settings2,
  GitBranch,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on the Admin Homepage (/admin), render clean standalone hub matching user's exact design
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // Dynamic header title based on current route
  const getHeaderTitle = () => {
    if (pathname.startsWith('/admin/services/')) return 'Service Specifications & Deliverables';
    if (pathname === '/admin/stats') return 'Stats & Visual Analytics';
    if (pathname === '/admin/quotations') return 'Client Quotations Registry';
    if (pathname === '/admin/packages') return 'Service Packages Catalog';
    if (pathname === '/admin/services') return 'Manage Services & Pricing Margins';
    if (pathname === '/admin/rules') return 'Recommendation Rules & Logic';
    if (pathname === '/admin/questions') return 'Client Survey Questions';
    return 'Dashboard Overview';
  };

  const navSections = [
    {
      category: 'Analytics',
      items: [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          isActive: pathname === '/admin',
        },
        {
          name: 'Stats Dashboard',
          href: '/admin/stats',
          icon: BarChart2,
          isActive: pathname === '/admin/stats',
        },
      ],
    },
    {
      category: 'Management',
      items: [
        {
          name: 'Client Quotations',
          href: '/admin/quotations',
          icon: FileText,
          isActive: pathname === '/admin/quotations',
        },
        {
          name: 'Service Packages',
          href: '/admin/packages',
          icon: Layers,
          isActive: pathname === '/admin/packages',
        },
        {
          name: 'Manage Services',
          href: '/admin/services',
          icon: Settings2,
          isActive: pathname.startsWith('/admin/services'),
        },
      ],
    },
    {
      category: 'Configuration',
      items: [
        {
          name: 'Recommendation Rules',
          href: '/admin/rules',
          icon: GitBranch,
          isActive: pathname === '/admin/rules',
        },
        {
          name: 'Survey Questions',
          href: '/admin/questions',
          icon: ClipboardList,
          isActive: pathname === '/admin/questions',
        },
      ],
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans h-screen flex overflow-hidden w-full">
      {/* Sidebar Navigation (Permanently docked, no 3-line hamburger button) */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between h-full shadow-sm flex-shrink-0 z-30">
        {/* Top Section: Brand & Primary Action */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
            <Leaf className="w-5 h-5 text-emerald-600 mr-3" />
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">StartupFlora Portal</h1>
          </div>

          {/* Primary Action Button */}
          <div className="p-4 flex-shrink-0">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Client Quote</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 overflow-y-auto flex-1 pb-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${sIdx === 0 ? 'mt-2' : 'mt-6'}`}>
                  {section.category}
                </p>
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const active = item.isActive;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}`} />
                        <span>{item.name}</span>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Footer Links & Telemetry */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors mb-4 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sales Desk</span>
          </Link>
          
          <div className="flex flex-col gap-1 px-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Control Hub Active</span>
            </div>
            <div className="text-xs text-slate-400 pl-4">Live Telemetry Connected</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-8 shadow-2xs flex-shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{getHeaderTitle()}</h2>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              StartupFlora Production Engine
            </span>
          </div>
        </header>
        
        <div className="p-6 lg:p-8 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(99,102,241,0.06),rgba(248,250,252,1))]">
          {children}
        </div>
      </main>
    </div>
  );
}
