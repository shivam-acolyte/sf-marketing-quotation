'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileSignature, 
  ExternalLink, 
  Calendar, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQuotations = async () => {
    try {
      const res = await fetch('/api/quotations');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    try {
      setUpdatingId(quoteId);
      const res = await fetch(`/api/quotations/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Update failed');

      setQuotations((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );
    } catch (err) {
      alert('Failed to update quotation status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/quotation/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered quotations
  const filteredQuotations = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'all' || q.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(query) ||
      q.customer?.name.toLowerCase().includes(query) ||
      q.customer?.email?.toLowerCase().includes(query) ||
      q.customer?.company?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Calculate summary metrics
  const totalValue = quotations.reduce((sum, q) => sum + Number(q.total || 0), 0);
  const acceptedValue = quotations
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + Number(q.total || 0), 0);
  const sentValue = quotations
    .filter((q) => q.status === 'sent')
    .reduce((sum, q) => sum + Number(q.total || 0), 0);
  const draftValue = quotations
    .filter((q) => q.status === 'draft')
    .reduce((sum, q) => sum + Number(q.total || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-medium">Loading commercial quotation registry...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 border-slate-200 text-slate-700',
    sent: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    accepted: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    declined: 'bg-rose-50 border-rose-200 text-rose-700',
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Client Quotations Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit dispatched proposals, manage customer deal stages, and track pipeline realization.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quotation</span>
        </Link>
      </section>

      {/* Summary Ribbon Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Quoted Pipeline</span>
          <div className="text-xl font-bold text-slate-800">₹{totalValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">{quotations.length} total proposals</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Closed Won Value</span>
          <div className="text-xl font-bold text-emerald-600">₹{acceptedValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">
            {quotations.filter((q) => q.status === 'accepted').length} signed clients
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Sent / In Review</span>
          <div className="text-xl font-bold text-indigo-600">₹{sentValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">
            {quotations.filter((q) => q.status === 'sent').length} waiting response
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Draft Value</span>
          <div className="text-xl font-bold text-slate-700">₹{draftValue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">
            {quotations.filter((q) => q.status === 'draft').length} internal drafts
          </span>
        </div>
      </section>

      {/* Controls Bar: Search & Status Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, quotation #, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All', count: quotations.length },
            { key: 'accepted', label: 'Accepted', count: quotations.filter((q) => q.status === 'accepted').length },
            { key: 'sent', label: 'Sent', count: quotations.filter((q) => q.status === 'sent').length },
            { key: 'draft', label: 'Draft', count: quotations.filter((q) => q.status === 'draft').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Quote Number</th>
                <th className="py-3.5 px-4 font-semibold">Client Name & Info</th>
                <th className="py-3.5 px-4 font-semibold">Company</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Deal Status</th>
                <th className="py-3.5 px-4 font-semibold">Issued Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                      <span>No quotations matched your search or filter criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Quotation Number */}
                    <td className="py-4 px-4 font-bold text-slate-800 font-mono">
                      #{quote.quotationNumber}
                    </td>

                    {/* Client Name & Email */}
                    <td className="py-4 px-4 font-medium">
                      <div className="font-semibold text-slate-800">{quote.customer?.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{quote.customer?.email}</div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-4 text-slate-600">
                      {quote.customer?.company || <span className="text-slate-400">—</span>}
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-bold text-emerald-600 font-mono text-sm">
                      ₹{Number(quote.total).toLocaleString('en-IN')}
                    </td>

                    {/* Deal Status & Direct Status Changer */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={quote.status}
                          disabled={updatingId === quote.id}
                          onChange={(e) => handleUpdateStatus(quote.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-md cursor-pointer focus:outline-none focus:border-indigo-500 transition-all ${
                            statusColors[quote.status] || statusColors.draft
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="declined">Declined</option>
                        </select>
                        {updatingId === quote.id && (
                          <span className="w-3 h-3 rounded-full border-t-2 border-indigo-600 animate-spin" />
                        )}
                      </div>
                    </td>

                    {/* Issued Date */}
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {new Date(quote.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyLink(quote.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                          title="Copy client quotation portal link"
                        >
                          {copiedId === quote.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Link</span>
                            </>
                          )}
                        </button>

                        {/* PDF Download */}
                        <a
                          href={`/api/quotations/${quote.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
                          title="Download proposal PDF"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>PDF</span>
                        </a>

                        {/* Open Portal */}
                        <Link
                          href={`/quotation/${quote.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-medium transition-colors"
                          title="View live client portal"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
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
