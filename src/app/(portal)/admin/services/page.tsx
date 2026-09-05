'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Pencil, 
  Save, 
  X, 
  Info, 
  ExternalLink, 
  ArrowRight,
  Share2,
  Globe,
  ShoppingBag,
  ShieldCheck,
  Target,
  Search,
  MessageSquare,
  Palette,
  Sparkles,
  DollarSign,
  TrendingUp,
  Check,
  Sliders
} from 'lucide-react';

interface Service {
  id: number;
  name: string;
  minPrice: number;
  maximumPrice: number;
  description: string;
  salesDescription: string;
  active: boolean;
}

// Category & Color Theme Engine
function getServiceTheme(name: string, id: number) {
  const n = name.toLowerCase();
  if (n.includes('social') || n.includes('smm') || n.includes('reels') || n.includes('content')) {
    return {
      category: 'Social Media',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      accentColor: 'text-pink-600',
      bgLight: 'bg-pink-50/80 border-pink-200/80',
      badge: 'bg-pink-50 text-pink-700 border-pink-200',
      borderHover: 'hover:border-pink-400 hover:shadow-pink-500/10',
      buttonHover: 'hover:bg-pink-600',
      icon: Share2,
    };
  }
  if (n.includes('e-commerce') || n.includes('shop') || n.includes('store') || n.includes('checkout')) {
    return {
      category: 'E-Commerce',
      gradient: 'from-purple-500 via-indigo-600 to-violet-600',
      accentColor: 'text-purple-600',
      bgLight: 'bg-purple-50/80 border-purple-200/80',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      buttonHover: 'hover:bg-purple-600',
      icon: ShoppingBag,
    };
  }
  if (n.includes('web') || n.includes('website') || n.includes('pager') || n.includes('dynamic')) {
    return {
      category: 'Web Tech',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      accentColor: 'text-teal-600',
      bgLight: 'bg-teal-50/80 border-teal-200/80',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
      buttonHover: 'hover:bg-teal-600',
      icon: Globe,
    };
  }
  if (n.includes('security') || n.includes('domain') || n.includes('dns') || n.includes('whois')) {
    return {
      category: 'Security & DNS',
      gradient: 'from-rose-500 via-red-600 to-amber-600',
      accentColor: 'text-rose-600',
      bgLight: 'bg-rose-50/80 border-rose-200/80',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      buttonHover: 'hover:bg-rose-600',
      icon: ShieldCheck,
    };
  }
  if (n.includes('ads') || n.includes('paid') || n.includes('meta') || n.includes('google')) {
    return {
      category: 'Paid Advertising',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      accentColor: 'text-amber-600',
      bgLight: 'bg-amber-50/80 border-amber-200/80',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      buttonHover: 'hover:bg-amber-600',
      icon: Target,
    };
  }
  if (n.includes('seo') || n.includes('traffic') || n.includes('ranking')) {
    return {
      category: 'SEO & Organic',
      gradient: 'from-blue-500 via-sky-500 to-cyan-500',
      accentColor: 'text-blue-600',
      bgLight: 'bg-blue-50/80 border-blue-200/80',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      buttonHover: 'hover:bg-blue-600',
      icon: Search,
    };
  }
  if (n.includes('wa') || n.includes('whatsapp') || n.includes('chat')) {
    return {
      category: 'Automation & CRM',
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      accentColor: 'text-green-600',
      bgLight: 'bg-green-50/80 border-green-200/80',
      badge: 'bg-green-50 text-green-700 border-green-200',
      borderHover: 'hover:border-green-400 hover:shadow-green-500/10',
      buttonHover: 'hover:bg-green-600',
      icon: MessageSquare,
    };
  }
  if (n.includes('logo') || n.includes('brand') || n.includes('pitch')) {
    return {
      category: 'Branding & Pitch',
      gradient: 'from-fuchsia-500 via-pink-600 to-purple-600',
      accentColor: 'text-fuchsia-600',
      bgLight: 'bg-fuchsia-50/80 border-fuchsia-200/80',
      badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      borderHover: 'hover:border-fuchsia-400 hover:shadow-fuchsia-500/10',
      buttonHover: 'hover:bg-fuchsia-600',
      icon: Palette,
    };
  }

  // Fallback rich cycle
  const palettes = [
    {
      category: 'Marketing Plan',
      gradient: 'from-indigo-500 via-blue-600 to-purple-600',
      accentColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50/80 border-indigo-200/80',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      buttonHover: 'hover:bg-indigo-600',
      icon: Layers,
    },
    {
      category: 'Agency Retainer',
      gradient: 'from-teal-500 via-emerald-600 to-cyan-600',
      accentColor: 'text-teal-600',
      bgLight: 'bg-teal-50/80 border-teal-200/80',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
      buttonHover: 'hover:bg-teal-600',
      icon: Sparkles,
    },
  ];
  return palettes[id % palettes.length];
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    minPrice: 0,
    maximumPrice: 0,
    description: '',
    salesDescription: '',
    active: true,
  });

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    minPrice: '',
    maximumPrice: '',
    description: '',
    salesDescription: '',
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleStartEdit = (service: Service) => {
    setEditId(service.id);
    setEditForm({
      name: service.name,
      minPrice: Number(service.minPrice),
      maximumPrice: Number(service.maximumPrice),
      description: service.description || '',
      salesDescription: service.salesDescription || '',
      active: service.active,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/services/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Save failed');
      setEditId(null);
      loadServices();
    } catch (err) {
      alert('Failed to save service edits.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.minPrice || !createForm.maximumPrice) return;
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          minPrice: Number(createForm.minPrice),
          maximumPrice: Number(createForm.maximumPrice),
          description: createForm.description,
          salesDescription: createForm.salesDescription,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setCreateForm({
        name: '',
        minPrice: '',
        maximumPrice: '',
        description: '',
        salesDescription: '',
      });
      setShowAddForm(false);
      loadServices();
    } catch (err) {
      alert('Failed to create new service.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Loading colorful service packages catalog...</p>
      </div>
    );
  }

  // Filter computation
  const filteredServices = services.filter((service) => {
    const theme = getServiceTheme(service.name, service.id);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && service.active) ||
      (statusFilter === 'inactive' && !service.active);
    const matchesCategory =
      selectedCategory === 'all' ||
      theme.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.salesDescription && service.salesDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      theme.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* 1. Header & Quick Actions */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Services & Deliverables Catalog</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {services.length} Services
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse service packages in uniform structured boxes with commercial price margins and client deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Service Package</span>
          </button>
        </div>
      </section>

      {/* 2. Create Service Form Drawer/Card */}
      {showAddForm && (
        <form onSubmit={handleCreateService} className="bg-white p-6 sm:p-7 rounded-2xl border border-indigo-200 shadow-md flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Create New Marketing Service Package</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-semibold">Service Name</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Meta Reels & Performance Ads"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-semibold">Floor Price (Min ₹)</label>
              <input
                type="number"
                required
                value={createForm.minPrice}
                onChange={(e) => setCreateForm({ ...createForm, minPrice: e.target.value })}
                placeholder="e.g. 20000"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 font-mono focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-semibold">Ceiling Price (Max ₹)</label>
              <input
                type="number"
                required
                value={createForm.maximumPrice}
                onChange={(e) => setCreateForm({ ...createForm, maximumPrice: e.target.value })}
                placeholder="e.g. 50000"
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 font-mono focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-semibold">Technical Deliverables & Scope</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Details of deliverables, post count, setup..."
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 min-h-20 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-semibold">Client Sales Proposition</label>
              <textarea
                value={createForm.salesDescription}
                onChange={(e) => setCreateForm({ ...createForm, salesDescription: e.target.value })}
                placeholder="Compelling value pitch for proposal cards..."
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-800 min-h-20 focus:bg-white focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs text-white font-bold shadow-sm transition-colors"
            >
              Create Package
            </button>
          </div>
        </form>
      )}

      {/* 3. Interactive Category Filter Chips & Live Search */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Packages' },
            { id: 'social', label: 'Social Media' },
            { id: 'web', label: 'Web Tech' },
            { id: 'commerce', label: 'E-Commerce' },
            { id: 'ads', label: 'Paid Ads' },
            { id: 'security', label: 'Security' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Status filter toggle */}
          <div className="flex items-center gap-1">
            {(['all', 'active'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Status' : 'Active Only'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search packages by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </section>

      {/* 4. SPECIFIC BOX SIZE LAYOUT (Uniform 3-column Grid of Fixed Dimension Boxes) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const theme = getServiceTheme(service.name, service.id);
          const Icon = theme.icon;
          const spread = Math.max(0, service.maximumPrice - service.minPrice);
          const marginRatio = service.minPrice > 0 ? Math.round((spread / service.minPrice) * 100) : 0;
          
          return (
            <div
              key={service.id}
              className={`h-[385px] bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden relative group ${theme.borderHover}`}
            >
              {/* Top Accent Color Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

              {/* 1. Header Box */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  {/* Colorful Icon + Category Badge */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${theme.badge}`}>
                        {theme.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold ml-1.5">
                        #{String(service.id).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Active / Paused Indicator */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    service.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${service.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {service.active ? 'Active' : 'Paused'}
                  </span>
                </div>

                {/* Service Title (Uniform 2-line clamp box) */}
                <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors">
                  {service.name}
                </h3>
              </div>

              {/* 2. Middle Body Box */}
              <div className="flex flex-col gap-2.5 my-auto">
                {/* Sales Proposition Box (Uniform soft tinted container) */}
                <div className={`p-2.5 rounded-xl border text-xs leading-relaxed line-clamp-2 h-13 flex items-center ${theme.bgLight}`}>
                  <span className="text-slate-700 font-medium">
                    {service.salesDescription || 'High-converting strategic marketing package for commercial client campaigns.'}
                  </span>
                </div>

                {/* Scope Deliverables Preview (Uniform 2-line preview) */}
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 h-8">
                  {service.description ? service.description.replace(/<[^>]*>?/gm, '') : 'Full scope of deliverables and project milestones included.'}
                </p>

                {/* Vibrant Price Pill */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pricing Range</span>
                    <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <span className="text-emerald-600">₹{Number(service.minPrice).toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 font-sans font-normal text-[10px]">to</span>
                      <span className={theme.accentColor}>₹{Number(service.maximumPrice).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    +{marginRatio}% Headroom
                  </span>
                </div>
              </div>

              {/* 3. Bottom Pinned Actions Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <Link
                  href={`/admin/services/${service.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 text-xs font-bold transition-all shadow-2xs group/btn"
                >
                  <span>Manage Page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleStartEdit(service)}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  title="Quick inline edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Quick Edit Modal Dialog (Preserves Grid Layout & Box Dimensions) */}
      {editId !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Quick Edit Service</h3>
                  <span className="text-xs text-slate-400">ID #{editId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-bold">Service Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-bold">Min Floor Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.minPrice}
                    onChange={(e) => setEditForm({ ...editForm, minPrice: Number(e.target.value) })}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:bg-white focus:border-indigo-500 outline-none text-xs font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-bold">Max Ceiling Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.maximumPrice}
                    onChange={(e) => setEditForm({ ...editForm, maximumPrice: Number(e.target.value) })}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:bg-white focus:border-indigo-500 outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-bold">Active Status</label>
                <select
                  value={String(editForm.active)}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs font-semibold"
                >
                  <option value="true">Active (Live in Quotation Engine)</option>
                  <option value="false">Paused (Hidden from Client Plans)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-bold">Client Sales Proposition</label>
                <textarea
                  value={editForm.salesDescription}
                  onChange={(e) => setEditForm({ ...editForm, salesDescription: e.target.value })}
                  rows={3}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-bold">Scope Deliverables (HTML / Text)</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:bg-white focus:border-indigo-500 outline-none text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link
                href={`/admin/services/${editId}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Full Dedicated Page →
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs text-white font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
