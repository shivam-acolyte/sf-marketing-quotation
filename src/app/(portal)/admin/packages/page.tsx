'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ExternalLink,
  SlidersHorizontal
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

export default function ServicePackagesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-medium">Loading service packages catalog...</p>
      </div>
    );
  }

  const activeServices = services.filter((s) => s.active);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Service Packages Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured marketing service tiers, technical scope of work, and pricing margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Price Margins</span>
          </Link>
        </div>
      </section>

      {/* Packages Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Catalog Items</span>
          <div className="text-2xl font-bold text-slate-800 mt-0.5">{services.length}</div>
          <span className="text-xs text-slate-500">Configured marketing modules</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Packages</span>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">{activeServices.length}</div>
          <span className="text-xs text-slate-500">Live in recommendation engine</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Average Starting Margin</span>
          <div className="text-2xl font-bold text-indigo-600 mt-0.5">
            ₹{services.length > 0 ? Math.round(services.reduce((acc, s) => acc + Number(s.minPrice), 0) / services.length).toLocaleString('en-IN') : '0'}
          </div>
          <span className="text-xs text-slate-500">Base monthly retainer price</span>
        </div>
      </section>

      {/* Packages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between overflow-hidden p-6 gap-4"
          >
            {/* Top info */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-base text-slate-800 leading-snug">
                  {service.name}
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${
                  service.active 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Price Range Badge */}
              <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold self-start">
                <span>₹{Number(service.minPrice).toLocaleString('en-IN')}</span>
                <span className="text-indigo-400 font-sans">to</span>
                <span>₹{Number(service.maximumPrice).toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-indigo-500 font-sans font-normal">/ mo</span>
              </div>

              {/* Sales Description */}
              {service.salesDescription && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <div className="font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Client Value Proposition:</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">{service.salesDescription}</p>
                </div>
              )}

              {/* Scope of Work */}
              {service.description && (
                <div className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700 block mb-0.5">Scope of Delivery:</span>
                  <p className="leading-relaxed line-clamp-3">{service.description}</p>
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">ID #{service.id}</span>
              <Link
                href={`/admin/services/${service.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>View Scope & Margins</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
