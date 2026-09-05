'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  Target 
} from 'lucide-react';

/* ==========================================================================
   1. Mini Sparkline Graphic (for KPI cards)
   ========================================================================== */
interface SparklineProps {
  data: number[];
  color?: string; // 'emerald' | 'cyan' | 'purple' | 'amber' | 'indigo'
  width?: number;
  height?: number;
}

export function Sparkline({
  data = [12, 18, 14, 25, 22, 36, 42],
  color = 'indigo',
  width = 90,
  height = 32,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return { x, y };
  });

  const pathD = points.reduce(
    (acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    },
    ''
  );

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorMap: Record<string, { stroke: string; fill: string }> = {
    indigo: { stroke: '#4f46e5', fill: 'url(#spark-indigo)' },
    blue: { stroke: '#2563eb', fill: 'url(#spark-blue)' },
    purple: { stroke: '#7c3aed', fill: 'url(#spark-purple)' },
    emerald: { stroke: '#059669', fill: 'url(#spark-emerald)' },
    teal: { stroke: '#0d9488', fill: 'url(#spark-teal)' },
    cyan: { stroke: '#0891b2', fill: 'url(#spark-cyan)' },
    amber: { stroke: '#d97706', fill: 'url(#spark-amber)' },
  };

  const currentTheme = colorMap[color] || colorMap.indigo;
  const lastPoint = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={currentTheme.stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={currentTheme.stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={currentTheme.fill} />
      <path
        d={pathD}
        fill="none"
        stroke={currentTheme.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="3"
        fill={currentTheme.stroke}
      />
    </svg>
  );
}

/* ==========================================================================
   2. Interactive SVG Revenue & Pipeline Area Chart
   ========================================================================== */
interface MonthlyTrend {
  month: string;
  revenue: number;
  pipeline: number;
  quotes: number;
  accepted: number;
}

interface RevenueTrendChartProps {
  data: MonthlyTrend[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<'pipeline' | 'revenue' | 'quotes'>('pipeline');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 640;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 34;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const values = data.map((d) => d[activeMetric]);
  const maxVal = Math.max(...values) * 1.15 || 100;
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartW;
    const y = paddingTop + chartH - ((d[activeMetric] - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, data: d };
  });

  // Curved Path generator (Cubic Bezier)
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

  const formatYLabel = (val: number) => {
    if (activeMetric === 'quotes') return `${Math.round(val)}`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${Math.round(val)}`;
  };

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => ({
    val: maxVal * ratio,
    y: paddingTop + chartH - ratio * chartH,
  }));

  const activeItem = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="flex flex-col gap-4">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Pipeline & Commercial Velocity
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                6-Month Outlook
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Track deal valuation and proposal volume progression</p>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('pipeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'pipeline'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pipeline Value
          </button>
          <button
            onClick={() => setActiveMetric('revenue')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'revenue'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Won Revenue
          </button>
          <button
            onClick={() => setActiveMetric('quotes')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeMetric === 'quotes'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quotes Count
          </button>
        </div>
      </div>

      {/* Floating Active Info Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Selected Month</span>
          <div className="text-sm font-bold text-slate-800">{activeItem?.month} 2026</div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Pipeline</span>
          <div className="text-sm font-bold text-indigo-600">
            ₹{activeItem?.pipeline.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Realized Revenue</span>
          <div className="text-sm font-bold text-emerald-600">
            ₹{activeItem?.revenue.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Proposal Ratio</span>
          <div className="text-sm font-bold text-purple-600">
            {activeItem?.accepted} / {activeItem?.quotes} Won
          </div>
        </div>
      </div>

      {/* Responsive SVG Graphic Container */}
      <div className="w-full relative aspect-[16/7] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pipelineAreaGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="revenueAreaGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="quotesAreaGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-ticks */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="600"
                fontFamily="monospace"
              >
                {formatYLabel(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path
            d={areaD}
            fill={
              activeMetric === 'pipeline'
                ? 'url(#pipelineAreaGradLight)'
                : activeMetric === 'revenue'
                ? 'url(#revenueAreaGradLight)'
                : 'url(#quotesAreaGradLight)'
            }
          />

          {/* Curved Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={
              activeMetric === 'pipeline'
                ? '#4f46e5'
                : activeMetric === 'revenue'
                ? '#059669'
                : '#7c3aed'
            }
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={points[hoverIndex].x}
              y1={paddingTop}
              x2={points[hoverIndex].x}
              y2={paddingTop + chartH}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '7' : '3.5'}
                  fill="#ffffff"
                  stroke={
                    activeMetric === 'pipeline'
                      ? '#4f46e5'
                      : activeMetric === 'revenue'
                      ? '#059669'
                      : '#7c3aed'
                  }
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150"
                />
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isHovered ? '#1e293b' : '#64748b'}
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {pt.data.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. Visual Conversion Funnel Graphic
   ========================================================================== */
interface FunnelData {
  started: number;
  completed: number;
  analyzed: number;
  quotations: number;
  accepted: number;
}

export function ConversionFunnelChart({ funnel }: { funnel: FunnelData }) {
  const steps = [
    {
      label: '1. Inbound Leads',
      sub: 'Initiated Questionnaire',
      count: funnel.started || 1,
      color: 'bg-indigo-600',
      badge: '100% Inflow',
    },
    {
      label: '2. Needs Assessed',
      sub: 'Detailed Profile Submitted',
      count: funnel.completed || 1,
      color: 'bg-blue-600',
      badge: `${funnel.started ? Math.round((funnel.completed / funnel.started) * 100) : 100}% Pass`,
    },
    {
      label: '3. Strategy Generated',
      sub: 'AI Scope & Package Mapped',
      count: funnel.analyzed || 1,
      color: 'bg-teal-600',
      badge: `${funnel.completed ? Math.round((funnel.analyzed / funnel.completed) * 100) : 100}% Fit`,
    },
    {
      label: '4. Quotations Sent',
      sub: 'Client Proposal Dispatched',
      count: funnel.quotations || 1,
      color: 'bg-emerald-600',
      badge: `${funnel.analyzed ? Math.round((funnel.quotations / funnel.analyzed) * 100) : 100}% Quoted`,
    },
    {
      label: '5. Deals Closed Won',
      sub: 'Customer Retainer Signed',
      count: funnel.accepted,
      color: 'bg-green-600',
      badge: `${funnel.quotations ? Math.round((funnel.accepted / funnel.quotations) * 100) : 0}% Won`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Operational Conversion Funnel
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Live Flow
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Step-by-step lead qualification and drop-off analysis</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {steps.map((step, idx) => {
          const widthPercent = Math.max(18, Math.min(100, 100 - idx * 14));
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Stage Info */}
              <div className="flex items-center gap-3 sm:w-56">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs flex-shrink-0 ${step.color}`}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{step.label}</div>
                  <div className="text-[10px] text-slate-500">{step.sub}</div>
                </div>
              </div>

              {/* Center Funnel Visual Bar */}
              <div className="flex-1">
                <div className="w-full h-5 bg-slate-200/80 rounded-lg p-0.5 overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-md ${step.color} transition-all duration-700 flex items-center justify-end px-2`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-[9px] font-bold text-white drop-shadow-xs">
                      {step.count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Conversion Badge */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-32">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  {step.badge}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {step.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   4. Service Demand & Allocation Donut Chart (Graphic)
   ========================================================================== */
interface ServiceItem {
  name: string;
  count: number;
  value: number;
}

export function ServiceDonutChart({ services }: { services: ServiceItem[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!services || services.length === 0) return null;

  const totalValue = services.reduce((sum, s) => sum + s.value, 0);
  const totalQuotes = services.reduce((sum, s) => sum + s.count, 0) || 1;

  const palette = [
    { color: '#4f46e5', label: 'Indigo' },
    { color: '#059669', label: 'Emerald' },
    { color: '#0891b2', label: 'Cyan' },
    { color: '#7c3aed', label: 'Purple' },
    { color: '#d97706', label: 'Amber' },
  ];

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = services.slice(0, 5).map((s, i) => {
    const share = s.value / totalValue || s.count / totalQuotes;
    const strokeDash = share * circumference;
    const offset = currentOffset;
    currentOffset += strokeDash;
    return {
      ...s,
      color: palette[i % palette.length].color,
      share: Math.round(share * 100),
      strokeDasharray: `${strokeDash} ${circumference}`,
      strokeDashoffset: -offset,
    };
  });

  const activeItem = hoverIdx !== null ? segments[hoverIdx] : segments[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Service Demand Share
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Quoted Breakdown
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Distribution of commercial marketing packages</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
            {/* Donut Segments */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={hoverIdx === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            ))}
          </svg>

          {/* Center Info Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
              {activeItem ? activeItem.share : 100}% Share
            </span>
            <span className="text-xs font-bold text-slate-800 line-clamp-1">
              {activeItem?.name.split(' ')[0] || 'Services'}
            </span>
            <span className="text-[9px] text-indigo-600 font-mono font-bold">
              ₹{(activeItem?.value || totalValue).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 w-full text-xs">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                hoverIdx === idx ? 'bg-white shadow-xs border border-slate-200' : 'hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-700 font-medium truncate text-[11px]">
                  {seg.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-slate-400 font-mono text-[10px]">
                  {seg.count}x
                </span>
                <span className="font-bold text-slate-800 font-mono text-[11px]">
                  {seg.share}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. Agency Performance & Health Radial Gauge (Graphic)
   ========================================================================== */
export function PerformanceGauge({
  score = 84,
  winRate = 62,
  avgDealSize = 48500,
}: {
  score?: number;
  winRate?: number;
  avgDealSize?: number;
}) {
  const size = 170;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const scorePercent = Math.min(100, Math.max(0, score));
  const offset = arcLength - (scorePercent / 100) * arcLength;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Conversion Health Index
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Optimal
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Composite sales and pipeline operational index</p>
        </div>
      </div>

      <div className="flex flex-col items-center bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
        <svg width={size} height={size / 2 + 25} className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradientLight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Score Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="url(#gaugeGradientLight)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute top-14 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline">
            {score}
            <span className="text-xs font-bold text-slate-400 ml-0.5">/100</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            High Velocity
          </span>
        </div>

        {/* Sub metrics strip */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 text-center text-xs">
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Avg Deal Size</span>
            <span className="font-mono font-bold text-slate-800">
              ₹{avgDealSize.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Win Rate</span>
            <span className="font-mono font-bold text-indigo-600">
              {winRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
