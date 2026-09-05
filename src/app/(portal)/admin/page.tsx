'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboardHomePage() {
  return (
    <div className="min-h-screen bg-[#f6f6f1] text-[#1a202c] py-8 px-4 sm:px-6">
      <div className="max-w-[736px] mx-auto flex flex-col gap-6">
        
        {/* 1. Primary Action Banner: "New client quote" */}
        <Link
          href="/"
          className="group relative overflow-hidden bg-[#205c3e] hover:bg-[#1d5438] rounded-2xl px-7 py-5 text-white transition-all flex items-center justify-between gap-6 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          {/* Subtle Ambient Decorative Arch on the right */}
          <div className="absolute -top-12 -right-10 w-[300px] h-[300px] rounded-full bg-[#276846] pointer-events-none" />

          {/* Left Text Block */}
          <div className="relative z-10 flex flex-col">
            <span className="text-[#9cd3ad] text-[11.5px] font-medium tracking-normal">
              Start here
            </span>
            <h1 className="text-[22px] font-bold text-white tracking-tight mt-0.5 leading-snug">
              New client quote
            </h1>
            <p className="text-[#c4e4cd] text-[12.5px] font-normal mt-1 leading-normal max-w-lg">
              Build a service quote from your packages and send it in minutes.
            </p>
          </div>

          {/* Right Circular CTA Button */}
          <div className="relative z-10 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#205c3e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 2. Section: Analytics (2 items) */}
        <section className="flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <span className="w-[3px] h-[14px] bg-[#4b3fe0] rounded-full inline-block" />
            <h2 className="text-[13.5px] font-bold text-[#1a202c]">Analytics</h2>
            <span className="text-[12px] text-[#8c9ba5] font-normal">2</span>
          </div>

          {/* Analytics Cards Grid (2 cols) */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Card 1: Dashboard */}
            <Link
              href="/admin/stats"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eeeffe] text-[#4b3fe0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Dashboard
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Today's quotes, wins, and pending client replies at a glance.
              </p>
            </Link>

            {/* Card 2: Stats dashboard */}
            <Link
              href="/admin/stats"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eeeffe] text-[#4b3fe0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="20" x2="6" y2="13" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="18" y1="20" x2="18" y2="10" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Stats dashboard
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Conversion rate and quote value trends over time.
              </p>
            </Link>
          </div>
        </section>

        {/* 3. Section: Management (3 items) */}
        <section className="flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <span className="w-[3px] h-[14px] bg-[#2f5fe0] rounded-full inline-block" />
            <h2 className="text-[13.5px] font-bold text-[#1a202c]">Management</h2>
            <span className="text-[12px] text-[#8c9ba5] font-normal">3</span>
          </div>

          {/* Management Cards Grid (3 cols) */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* Card 1: Client quotations */}
            <Link
              href="/admin/quotations"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eaf0fe] text-[#2f5fe0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Client quotations
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Every quote you've sent, with status and follow-up dates.
              </p>
            </Link>

            {/* Card 2: Service packages */}
            <Link
              href="/admin/packages"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eaf0fe] text-[#2f5fe0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Service packages
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                The bundles and pricing tiers clients can be quoted on.
              </p>
            </Link>

            {/* Card 3: Manage services */}
            <Link
              href="/admin/services"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eaf0fe] text-[#2f5fe0] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="7" r="2.5" />
                  <circle cx="18" cy="17" r="2.5" />
                  <path d="M9 12h3c2 0 3-1.5 3-3.5V7" />
                  <path d="M12 12c1 0 3 1.5 3 3.5V17" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Manage services
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Add, edit, or retire the individual services you offer.
              </p>
            </Link>
          </div>
        </section>

        {/* 4. Section: Configuration (2 items in 3-col grid with empty 3rd slot) */}
        <section className="flex flex-col gap-2">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <span className="w-[3px] h-[14px] bg-[#276b4a] rounded-full inline-block" />
            <h2 className="text-[13.5px] font-bold text-[#1a202c]">Configuration</h2>
            <span className="text-[12px] text-[#8c9ba5] font-normal">2</span>
          </div>

          {/* Configuration Cards Grid */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* Card 1: Recommendation rules */}
            <Link
              href="/admin/rules"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#e7f1ea] text-[#276b4a] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="6" r="3" />
                  <circle cx="17" cy="18" r="3" />
                  <path d="M7 9v4a5 5 0 0 0 5 5h2" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Recommendation rules
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                The logic that suggests the right package for each survey.
              </p>
            </Link>

            {/* Card 2: Survey questions */}
            <Link
              href="/admin/questions"
              className="bg-white rounded-2xl border border-[#dee3d7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-150 flex flex-col cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#e7f1ea] text-[#276b4a] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <line x1="9" y1="11" x2="15" y2="11" />
                  <line x1="9" y1="15" x2="13" y2="15" />
                </svg>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a202c] mt-4 mb-1">
                Survey questions
              </h3>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                The intake questions clients answer before a quote is built.
              </p>
            </Link>

            {/* Empty 3rd column placeholder to preserve 3-column layout sizing */}
            <div className="hidden sm:block pointer-events-none" />
          </div>
        </section>

        {/* 5. Bottom Footer Navigation & Telemetry */}
        <footer className="border-t border-[#dee3d7] pt-5 mt-2 flex items-center justify-between text-[12px] text-[#5a6578]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-normal text-[#5a6578] hover:text-[#1a202c] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="m12 19-7-7 7-7"/>
            </svg>
            <span>Return to sales desk</span>
          </Link>

          <span className="font-normal text-[#8c9ba5] text-[11.5px]">
            Live telemetry connected
          </span>
        </footer>

      </div>
    </div>
  );
}
