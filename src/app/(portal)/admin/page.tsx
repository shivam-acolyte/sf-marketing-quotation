'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  FileCheck2, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Info 
} from 'lucide-react';

interface StatsData {
  totalLeads: number;
  totalAssessments: number;
  quotationsGenerated: number;
  quotationsAccepted: number;
  conversionRate: number;
  estimatedRevenue: number;
  funnel: {
    started: number;
    completed: number;
    analyzed: number;
    quotations: number;
    accepted: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Stats fetch failed');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading statistics parameters...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 italic glass-panel rounded-2xl flex items-center justify-center gap-2">
        <Info className="w-4 h-4 text-amber-500" />
        <span>Failed to load admin stats. Verify database connection.</span>
      </div>
    );
  }

  const funnelItems = [
    { name: 'Assessments Initiated', count: stats.funnel.started, pct: 100, color: 'bg-indigo-600' },
    { name: 'Answers Submitted', count: stats.funnel.completed, pct: stats.funnel.started ? Math.round((stats.funnel.completed / stats.funnel.started) * 100) : 0, color: 'bg-cyan-500' },
    { name: 'AI Strategy Generated', count: stats.funnel.analyzed, pct: stats.funnel.completed ? Math.round((stats.funnel.analyzed / stats.funnel.completed) * 100) : 0, color: 'bg-teal-500' },
    { name: 'Quotations Created', count: stats.funnel.quotations, pct: stats.funnel.analyzed ? Math.round((stats.funnel.quotations / stats.funnel.analyzed) * 100) : 0, color: 'bg-purple-500' },
    { name: 'Proposals Accepted', count: stats.funnel.accepted, pct: stats.funnel.quotations ? Math.round((stats.funnel.accepted / stats.funnel.quotations) * 100) : 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-lg font-bold text-slate-100">Stats Overview</h1>
        <p className="text-xs text-slate-500">Live operational conversion funnel metrics and performance indexes.</p>
      </section>

      {/* Stats Widgets Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric Card */}
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.totalLeads}</div>
          <span className="text-[9px] text-slate-500">Unique Clients</span>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Assessments</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.totalAssessments}</div>
          <span className="text-[9px] text-slate-500">Requirements Filed</span>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quotes Created</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.quotationsGenerated}</div>
          <span className="text-[9px] text-slate-500">Drafted Proposal Sheets</span>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Accepted Quotes</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.quotationsAccepted}</div>
          <span className="text-[9px] text-slate-500">Signed Projects</span>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Conversion</span>
            <TrendingUp className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.conversionRate}%</div>
          <span className="text-[9px] text-slate-500">Quotes / Assessments</span>
        </div>

        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">₹{stats.estimatedRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[9px] text-slate-500">From Accepted Quotes</span>
        </div>
      </section>

      {/* Funnel Progress Section */}
      <section className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5 bg-slate-900/10">
        <h3 className="font-bold text-sm text-slate-200">Marketing Conversion Funnel Analysis</h3>
        
        <div className="flex flex-col gap-4">
          {funnelItems.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="w-44 text-slate-300 font-medium flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                  {index + 1}
                </span>
                <span>{item.name}</span>
              </div>
              
              <div className="flex-grow h-6 bg-slate-900/60 border border-slate-800/80 rounded-lg overflow-hidden flex items-center px-1">
                <div 
                  className={`h-4 rounded-md ${item.color} transition-all duration-700 flex items-center justify-end px-2 text-[9px] font-bold text-white`}
                  style={{ width: `${Math.max(8, item.pct)}%` }}
                >
                  {item.count}
                </div>
              </div>
              
              <div className="w-16 text-right font-mono text-slate-400 font-semibold">
                {item.pct}%
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
