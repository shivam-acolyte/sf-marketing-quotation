'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  Tag, 
  FileText, 
  Sparkles, 
  GitBranch, 
  ExternalLink,
  Sliders,
  TrendingUp,
  Percent,
  Check,
  Copy,
  Zap,
  Eye,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  minPrice: number;
  maximumPrice: number;
  description: string;
  salesDescription: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  serviceRules?: Array<{
    id: number;
    condition: any;
    priority: number;
  }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active tab state: 'pricing' | 'scope' | 'pitch' | 'preview'
  const [activeTab, setActiveTab] = useState<'pricing' | 'scope' | 'pitch' | 'preview'>('pricing');

  // Interactive Tier Simulator Multiplier
  const [simulatorTier, setSimulatorTier] = useState<'starter' | 'growth' | 'accelerator'>('growth');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    minPrice: 0,
    maximumPrice: 0,
    description: '',
    salesDescription: '',
    active: true,
  });

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/services/${serviceId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Service not found');
        throw new Error('Failed to load service');
      }
      const data = await res.json();
      setService(data);
      setFormData({
        name: data.name || '',
        minPrice: Number(data.minPrice) || 0,
        maximumPrice: Number(data.maximumPrice) || 0,
        description: data.description || '',
        salesDescription: data.salesDescription || '',
        active: Boolean(data.active),
      });
    } catch (err: any) {
      setError(err.message || 'Error loading service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update service');
      const updated = await res.json();
      setService(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Quick Preset Handlers
  const applyPricingPreset = (min: number, max: number) => {
    setFormData((prev) => ({ ...prev, minPrice: min, maximumPrice: max }));
  };

  // Copy Preview to Clipboard
  const handleCopySummary = () => {
    const text = `${formData.name} (₹${formData.minPrice.toLocaleString('en-IN')} - ₹${formData.maximumPrice.toLocaleString('en-IN')})\n${formData.salesDescription}\n\nDeliverables:\n${formData.description.replace(/<[^>]*>?/gm, '')}`;
    navigator.clipboard.writeText(text);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <Zap className="w-5 h-5 text-indigo-600 absolute top-3.5 left-3.5 animate-pulse" />
        </div>
        <p className="text-slate-500 text-xs font-semibold tracking-wide">Loading interactive service workspace...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-12">
        <div className="p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Service Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'The requested service record does not exist in the catalog.'}</p>
        </div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Services</span>
        </Link>
      </div>
    );
  }

  // Interactive calculations
  const marginSpread = Math.max(0, formData.maximumPrice - formData.minPrice);
  const marginPercent = formData.minPrice > 0 ? Math.round((marginSpread / formData.minPrice) * 100) : 0;

  // Simulator Multipliers
  const tierMultipliers = {
    starter: 0.85,
    growth: 1.0,
    accelerator: 1.25,
  };
  const simulatedMonthly = Math.round(formData.minPrice * tierMultipliers[simulatorTier]);

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-5xl mx-auto">
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Services Catalog</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPreview ? 'Copied Details!' : 'Copy Summary'}</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
          >
            <span>Test In Sales Calculator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Interactive Header Banner with Glassmorphism & Status Switch */}
      <section className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {formData.name || 'Untitled Service'}
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 font-semibold">
                ID #{service.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Catalog Deliverables Engine</span>
              <span>•</span>
              <span className="text-slate-400">Standard StartupFlora Quotation Module</span>
            </p>
          </div>
        </div>

        {/* Interactive Availability Switch */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 z-10">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-700">
              {formData.active ? 'Active in Calculations' : 'Temporarily Disabled'}
            </span>
            <span className="text-[10px] text-slate-400">
              {formData.active ? 'Included in client plans' : 'Hidden from proposals'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, active: !formData.active })}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
              formData.active ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                formData.active ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Decorative ambient background blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      </section>

      {/* 3. Real-Time Pricing Margin & Headroom KPI Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Min Price Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Floor Price (Min)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
            ₹{formData.minPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Starting baseline threshold</span>
        </div>

        {/* Max Price Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Ceiling Price (Max)</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 tracking-tight">
            ₹{formData.maximumPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Enterprise upper bound</span>
        </div>

        {/* Margin Headroom Card with Animated Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Margin Headroom</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
            +{marginPercent}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, marginPercent)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1.5">₹{marginSpread.toLocaleString('en-IN')} spread</span>
        </div>

        {/* Active Rules Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Diagnostic Triggers</span>
            <GitBranch className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {service.serviceRules?.length || 1} Rule(s)
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Auto-included by sector</span>
        </div>
      </section>

      {/* 4. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Interactive Pricing & Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scope')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scope'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Scope Deliverables</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pitch')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pitch'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sales Strategy Pitch</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Client Proposal Preview</span>
        </button>
      </div>

      {/* 5. Tab Content Panes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Tab 1: Interactive Pricing & Live Simulator */}
        {activeTab === 'pricing' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-base font-bold text-slate-800">Commercial Pricing Range & Margin Bounds</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust baseline rates with interactive controls or click quick presets to establish standard market margins.
              </p>
            </div>

            {/* Quick Presets Pills */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Rate Presets:</span>
              </span>
              {[
                { label: '₹10k – ₹25k', min: 10000, max: 25000 },
                { label: '₹20k – ₹50k', min: 20000, max: 50000 },
                { label: '₹50k – ₹100k', min: 50000, max: 100000 },
                { label: '₹1.5L – ₹2.8L', min: 150000, max: 280000 },
              ].map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => applyPricingPreset(preset.min, preset.max)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Interactive Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Min Price Slider Box */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Minimum Floor Rate (₹)</label>
                  <span className="font-mono text-sm font-bold text-emerald-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    ₹{formData.minPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="300000"
                  step="1000"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                  className="interactive-range cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Direct Input:</span>
                  <input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                    className="w-32 bg-white border border-slate-200 px-2 py-1 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Max Price Slider Box */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Maximum Ceiling Rate (₹)</label>
                  <span className="font-mono text-sm font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    ₹{formData.maximumPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="2000"
                  value={formData.maximumPrice}
                  onChange={(e) => setFormData({ ...formData, maximumPrice: Number(e.target.value) })}
                  className="interactive-range cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Direct Input:</span>
                  <input
                    type="number"
                    value={formData.maximumPrice}
                    onChange={(e) => setFormData({ ...formData, maximumPrice: Number(e.target.value) })}
                    className="w-32 bg-white border border-slate-200 px-2 py-1 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Live Tier Simulator Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 border border-indigo-100 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Client Tier Multiplier Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test how this service is dynamically billed in client proposal tiers.
                  </p>
                </div>

                {/* Tier Switcher Pills */}
                <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSimulatorTier('starter')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simulatorTier === 'starter'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Starter (0.85x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorTier('growth')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simulatorTier === 'growth'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Growth (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorTier('accelerator')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simulatorTier === 'accelerator'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Accelerator (1.25x)
                  </button>
                </div>
              </div>

              {/* Simulated Calculation Output Card */}
              <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Calculated Monthly Proposal Line Item:
                  </span>
                  <span className="text-xs text-slate-400">
                    Base ₹{formData.minPrice.toLocaleString('en-IN')} × {tierMultipliers[simulatorTier]}x factor
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-indigo-600">
                  ₹{simulatedMonthly.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scope Deliverables */}
        {activeTab === 'scope' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Deliverables & Technical Scope Specifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the contract deliverables, frequencies, and work milestones included under this service.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Official Deliverables Copy</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                placeholder="E.g., 10-12 creative posts, festival creatives, stories & deal posts with captions and hashtags. Server included for 6 months..."
                className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 p-4 rounded-xl text-xs font-mono text-slate-800 outline-none transition-colors resize-y leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Detailed scope shown on client service agreements and PDF estimates.</span>
                <span>{formData.description.length} characters</span>
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Sales Strategy Pitch */}
        {activeTab === 'pitch' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Sales Pitch & Client Value Proposition</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                High-converting pitch summary used by sales executives during proposal walkthroughs.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Sales Pitching Summary</span>
              </label>
              <textarea
                value={formData.salesDescription}
                onChange={(e) => setFormData({ ...formData, salesDescription: e.target.value })}
                rows={4}
                placeholder="E.g., Kickstart your social media with a professionally managed 1-month campaign."
                className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 p-4 rounded-xl text-sm text-slate-800 outline-none transition-colors resize-y leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Concise executive pitch presented directly under the plan tier card.</span>
                <span>{formData.salesDescription.length} characters</span>
              </span>
            </div>
          </div>
        )}

        {/* Tab 4: Client Proposal Preview */}
        {activeTab === 'preview' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Proposal Card Simulation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live simulated preview of how this service card renders on the client proposal view.
              </p>
            </div>

            {/* Client Mockup Card */}
            <div className="max-w-md mx-auto w-full bg-white rounded-2xl border-2 border-indigo-500/80 p-6 shadow-lg shadow-indigo-500/10 flex flex-col gap-4 relative overflow-hidden">
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 self-start">
                Featured Deliverable
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{formData.name}</h3>
                <p className="text-xs text-slate-600 mt-1 italic">
                  "{formData.salesDescription || 'No sales pitch provided yet.'}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-600">
                  ₹{formData.minPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">/ month estimate</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <strong className="block text-slate-700 mb-1 text-[11px] uppercase tracking-wider">Inclusions:</strong>
                <div dangerouslySetInnerHTML={{ __html: formData.description || 'Deliverables will be finalized on confirmation.' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Sticky Floating Bottom Action Bar */}
      <div className="sticky bottom-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>All changes saved successfully to database!</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Editing: <strong className="text-slate-700">{formData.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Service Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
