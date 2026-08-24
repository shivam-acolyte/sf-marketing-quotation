'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Mail, 
  CheckCircle, 
  Calendar, 
  Briefcase, 
  ArrowLeft,
  Building,
  User,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuotationItem {
  id: number;
  serviceName: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuotationData {
  id: string;
  quotationNumber: string;
  assessmentId: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  validUntil: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  assessment?: {
    aiAnalysis?: {
      business_summary?: string;
      strategy_summary?: string;
    };
  };
  items: QuotationItem[];
}

export default function QuotationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // States
  const [quote, setQuote] = useState<QuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [acceptStatus, setAcceptStatus] = useState<'idle' | 'accepted'>('idle');

  useEffect(() => {
    if (!id) return;

    async function loadQuotation() {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (!res.ok) throw new Error('Quotation not found');
        const data = await res.json();
        setQuote(data);
        if (data.status === 'accepted') {
          setAcceptStatus('accepted');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Fetching quotation details...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-md mx-auto text-center py-16 flex flex-col gap-4 items-center">
        <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center text-red-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Quotation Not Found</h2>
        <p className="text-slate-400 text-sm leading-relaxed">The quotation link you accessed might be expired or invalid.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-2 rounded-xl text-xs font-semibold text-slate-300"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('idle');
    try {
      const res = await fetch(`/api/quotations/${id}/email`, { method: 'POST' });
      if (!res.ok) throw new Error('Email delivery failed');
      
      setEmailStatus('success');
      setQuote(prev => prev ? { ...prev, status: 'sent' } : null);
      
      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#6366f1', '#a855f7'],
      });
    } catch (err) {
      console.error(err);
      setEmailStatus('error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleAcceptProposal = async () => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (!res.ok) throw new Error('Failed to accept proposal');
      
      setAcceptStatus('accepted');
      setQuote(prev => prev ? { ...prev, status: 'accepted' } : null);
      
      // Giant confetti cascade!
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22d3ee', '#6366f1'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#d946ef', '#6366f1'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } catch (err) {
      console.error(err);
      alert('Error updating proposal status.');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Back navigation & Actions Toolbar */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => router.push(`/results?id=${quote.assessmentId}`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors self-start mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customize Proposal</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <span>Proposal #{quote.quotationNumber}</span>
            {acceptStatus === 'accepted' ? (
              <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Accepted
              </span>
            ) : quote.status === 'sent' ? (
              <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Emailed
              </span>
            ) : (
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Draft
              </span>
            )}
          </h1>
        </div>

        {/* Action Button Grid */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/api/quotations/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open PDF</span>
          </a>
          
          <a
            href={`/api/quotations/${id}/pdf`}
            download={`Quotation-${quote.quotationNumber}.pdf`}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01]"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sendingEmail ? 'Sending...' : 'Email Proposal'}</span>
          </button>

          {acceptStatus !== 'accepted' && (
            <button
              type="button"
              onClick={handleAcceptProposal}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all hover:scale-[1.03] shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Accept Proposal</span>
            </button>
          )}
        </div>
      </section>

      {/* Email Status Notification Alerts */}
      {emailStatus === 'success' && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>Success! Proposal PDF generated and emailed to <strong>{quote.customer.email}</strong>. Check your inbox!</span>
        </div>
      )}
      {emailStatus === 'error' && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-400 text-xs">
          Error sending email. Please verify that SMTP environment variables are configured correctly.
        </div>
      )}

      {/* Accept Success Banner */}
      {acceptStatus === 'accepted' && (
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 text-sm flex flex-col gap-2 shadow-xl shadow-emerald-500/5">
          <h3 className="font-bold flex items-center gap-2 text-emerald-400 text-base">
            <CheckCircle className="w-5.5 h-5.5" />
            Proposal Formally Accepted!
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
            Congratulations! The quotation has been digitally accepted. Our onboarding team has been notified, and we will contact you shortly to launch the campaigns.
          </p>
        </div>
      )}

      {/* Proposal Document Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Dynamic HTML invoice sheet */}
        <div className="lg:col-span-2 glass-panel p-8 md:p-10 rounded-2xl border border-white/5 flex flex-col gap-8 shadow-2xl relative bg-slate-900/40">
          
          {/* Header sheet */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-slate-100">StartupFlora</span>
              <span className="text-xs text-emerald-400 font-semibold tracking-wide">Sahi Hai! · Digital Growth Architects</span>
            </div>
            
            <div className="text-left sm:text-right text-xs text-slate-400 flex flex-col gap-0.5">
              <span>info@startupflora.com</span>
              <span>+91 9240-203-227</span>
              <span>Jaipur · Ahmedabad · Gurugram</span>
            </div>
          </div>

          {/* Client Details vs Quote Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl text-xs">
            <div className="flex flex-col gap-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Client Details</span>
              <div className="flex flex-col gap-1 text-slate-300">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" /> {quote.customer.name}
                </span>
                {quote.customer.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" /> {quote.customer.company}
                  </span>
                )}
                <span>{quote.customer.email}</span>
                {quote.customer.phone && <span>{quote.customer.phone}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Quotation Details</span>
              <div className="flex flex-col gap-1 text-slate-300">
                <span className="font-semibold text-slate-200">Quote: #{quote.quotationNumber}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Issued: {formatDate(quote.createdAt)}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Valid Until: {formatDate(quote.validUntil)}</span>
              </div>
            </div>
          </div>

          {/* Campaign Strategy roadmaps */}
          {quote.assessment?.aiAnalysis && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Campaign Strategy Brief
              </h3>
              <div className="flex flex-col gap-2.5 text-xs leading-relaxed text-slate-300">
                {quote.assessment.aiAnalysis.business_summary && (
                  <p><strong>Business Diagnostic:</strong> {quote.assessment.aiAnalysis.business_summary}</p>
                )}
                {quote.assessment.aiAnalysis.strategy_summary && (
                  <p><strong>Proposed Approach:</strong> {quote.assessment.aiAnalysis.strategy_summary}</p>
                )}
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="flex flex-col gap-3.5">
            <h3 className="font-bold text-sm text-slate-200 pb-2 border-b border-slate-800/60">
              Scope Line Items
            </h3>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 font-semibold text-slate-400 pb-2">
                    <th className="py-2.5 pr-4">Service Package</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 pl-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {quote.items.map((item) => (
                    <tr key={item.id} className="text-slate-300">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-slate-200">{item.serviceName}</div>
                        {item.description && <div className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed">{item.description}</div>}
                      </td>
                      <td className="py-4 px-3 text-center text-slate-400">{item.quantity}</td>
                      <td className="py-4 px-3 text-right font-mono">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="py-4 pl-4 text-right font-bold text-slate-200 font-mono">₹{Number(item.totalPrice).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary Totals Block */}
          <div className="border-t border-slate-800 pt-6 flex flex-col items-end gap-3 font-semibold text-xs">
            <div className="w-full sm:w-72 flex flex-col gap-2.5 text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">₹{Number(quote.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {Number(quote.discount) > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount Applied</span>
                  <span className="font-mono">-₹{Number(quote.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-mono text-slate-200">₹{Number(quote.tax).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-200 border-t border-slate-800/80 pt-3 mt-1">
                <span>Grand Total (INR)</span>
                <span className="text-cyan-400 font-mono">₹{Number(quote.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Terms Sheet Card */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-xs leading-relaxed text-slate-400">
            <h3 className="font-bold text-slate-200 text-sm border-b border-white/5 pb-2">Terms & Conditions</h3>
            
            <ul className="flex flex-col gap-3">
              <li>
                <strong>1. Invoice Schedule:</strong> 50% upfront payment initiates scope creation, and remaining 50% settles at milestone completion.
              </li>
              <li>
                <strong>2. Validity:</strong> Service quotes remain valid for exactly 30 calendar days from issued date.
              </li>
              <li>
                <strong>3. Tax compliance:</strong> Auto-computed GST complies with Indian taxation laws (18%).
              </li>
              <li>
                <strong>4. Scope modifications:</strong> Line packages can be adjusted or scaled up with written agreement.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
