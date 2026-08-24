'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileSignature, ExternalLink, Calendar, Info } from 'lucide-react';

interface Quotation {
  id: string;
  quotationNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    company: string | null;
  };
}

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotations() {
      try {
        const res = await fetch('/api/quotations');
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setQuotations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading quotations logs...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-800 border-slate-700 text-slate-400',
    sent: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    accepted: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-sm font-bold text-slate-100">Client Quotations</h1>
        <p className="text-xs text-slate-500">Track proposal pipelines, sent files, and acceptance conversion ratios.</p>
      </section>

      {/* Table List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/10">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Quote Number</th>
                <th className="py-3.5 px-4 font-semibold">Client Name</th>
                <th className="py-3.5 px-4 font-semibold">Company</th>
                <th className="py-3.5 px-4 font-semibold">Total Quote</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Issued Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No quotations generated yet in the system.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-100 font-mono">
                      #{quote.quotationNumber}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">
                      <div>{quote.customer.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{quote.customer.email}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {quote.customer.company || <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-200 font-mono">
                      ₹{Number(quote.total).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${statusColors[quote.status] || 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        <span>{new Date(quote.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/quotations/${quote.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors border border-slate-800 hover:border-cyan-500/20 px-2 py-1 rounded"
                        >
                          <span>PDF</span>
                        </a>
                        <Link
                          href={`/quotation/${quote.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-400 transition-colors border border-slate-800 hover:border-indigo-500/20 px-2 py-1 rounded"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
