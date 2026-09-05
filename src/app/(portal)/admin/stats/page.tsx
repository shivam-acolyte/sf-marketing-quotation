'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  DollarSign, 
  Activity, 
  FileCheck2, 
  Layers 
} from 'lucide-react';
import { 
  RevenueTrendChart, 
  ConversionFunnelChart, 
  ServiceDonutChart, 
  PerformanceGauge 
} from '../components/AdminCharts';

interface StatsData {
  totalLeads: number;
  totalAssessments: number;
  quotationsGenerated: number;
  quotationsAccepted: number;
  conversionRate: number;
  estimatedRevenue: number;
  pipelineValue: number;
  avgDealSize: number;
  performanceScore: number;
  statusBreakdown: {
    draft: number;
    sent: number;
    accepted: number;
    declined: number;
  };
  funnel: {
    started: number;
    completed: number;
    analyzed: number;
    quotations: number;
    accepted: number;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    pipeline: number;
    quotes: number;
    accepted: number;
  }>;
  topServices: Array<{
    name: string;
    count: number;
    value: number;
  }>;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Stats fetch failed');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-medium">Generating visual telemetry and analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
        <div className="text-amber-600 font-bold text-sm">Failed to connect to local analytics engine.</div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Stats & Analytics Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deep-dive operational charts, customer conversion telemetry, and revenue pipeline projections.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </section>

      {/* Top High-level KPIs Ribbon */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Pipeline Valuation</span>
          <div className="text-xl font-bold text-slate-800">
            ₹{stats.pipelineValue ? stats.pipelineValue.toLocaleString('en-IN') : '0'}
          </div>
          <span className="text-[10px] text-slate-400">Total estimated client quote pool</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Won Revenue</span>
          <div className="text-xl font-bold text-emerald-600">
            ₹{stats.estimatedRevenue ? stats.estimatedRevenue.toLocaleString('en-IN') : '0'}
          </div>
          <span className="text-[10px] text-slate-400">From accepted project contracts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Avg Contract Size</span>
          <div className="text-xl font-bold text-indigo-600">
            ₹{(stats.avgDealSize || 45000).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Average ticket per quotation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-purple-600">Conversion Rate</span>
          <div className="text-xl font-bold text-purple-600">
            {stats.conversionRate}%
          </div>
          <span className="text-[10px] text-slate-400">Proposal to closed win ratio</span>
        </div>
      </section>

      {/* Primary Visual Analytics: Revenue Area Chart + Health Radial Gauge */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <RevenueTrendChart data={stats.monthlyTrends} />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <PerformanceGauge
            score={stats.performanceScore}
            winRate={stats.conversionRate > 0 ? stats.conversionRate : 58}
            avgDealSize={stats.avgDealSize || 52000}
          />
        </div>
      </section>

      {/* Secondary Visual Analytics: Conversion Funnel + Service Demand Donut */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ConversionFunnelChart funnel={stats.funnel} />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ServiceDonutChart services={stats.topServices} />
        </div>
      </section>
    </div>
  );
}
