'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  FileCheck2, 
  ArrowRight, 
  ChevronRight, 
  Info,
  BadgeAlert,
  Percent
} from 'lucide-react';

interface ServiceOption {
  name: string;
  price_modifier: number;
  description: string;
  selected: boolean;
}

interface RecommendedService {
  serviceId: number;
  serviceName: string;
  minPrice: number;
  maxPrice: number;
  complexityScore: number;
  recommendedPrice: number;
  description: string;
  salesDescription: string;
  reason: string;
  options: ServiceOption[];
}

interface ServiceCatalog {
  id: number;
  name: string;
  minPrice: number;
  maximumPrice: number;
  description: string;
  salesDescription: string;
}

interface AssessmentData {
  assessment: {
    id: string;
    customerId: string;
    customer: {
      name: string;
      email: string;
      company?: string;
    };
  };
  aiAnalysis: {
    business_summary: string;
    primary_goals: string[];
    strategy_summary: string;
    priority: 'high' | 'medium' | 'low';
  };
  recommendedServices: RecommendedService[];
  complexityScore: number;
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  // Page States
  const [data, setData] = useState<AssessmentData | null>(null);
  const [catalog, setCatalog] = useState<ServiceCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatingQuote, setGeneratingQuote] = useState(false);

  // Map of serviceId to selected option names
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({});

  // Proposal Item Cart State
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Fetch Assessment and Service Catalog on mount
  useEffect(() => {
    if (!assessmentId) {
      setErrorMsg('No assessment ID provided. Please complete the survey.');
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        // 1. Fetch assessment details & AI strategy
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (!res.ok) throw new Error('Failed to load assessment data');
        const assessmentData: AssessmentData = await res.json();
        setData(assessmentData);

        // 2. Pre-populate selected options map
        const initialOptions: Record<number, string[]> = {};
        assessmentData.recommendedServices.forEach((s: any) => {
          if (s.options) {
            initialOptions[s.serviceId] = s.options
              .filter((opt: any) => opt.selected)
              .map((opt: any) => opt.name);
          } else {
            initialOptions[s.serviceId] = [];
          }
        });
        setSelectedOptions(initialOptions);

        // 3. Pre-populate cart with recommended services
        const initialCart = assessmentData.recommendedServices.map((s) => {
          const activeOpts = initialOptions[s.serviceId] || [];
          const extra = (s.options || []).reduce((sum: number, opt: any) => {
            if (activeOpts.includes(opt.name)) return sum + opt.price_modifier;
            return sum;
          }, 0);
          const unitPrice = s.recommendedPrice + extra;

          let description = s.description || '';
          if (activeOpts.length > 0) {
            description += `\n\nIncluded Deliverables:\n` + activeOpts.map((optName: string) => {
              const opt = s.options.find((o: any) => o.name === optName);
              const modifier = opt ? opt.price_modifier : 0;
              return `• ${optName} (${modifier > 0 ? `+₹${modifier.toLocaleString('en-IN')}` : 'Included'})`;
            }).join('\n');
          }

          return {
            serviceId: s.serviceId,
            serviceName: s.serviceName,
            description: description,
            quantity: 1,
            unitPrice: unitPrice,
            reason: s.reason,
          };
        });
        setSelectedItems(initialCart);

        // 3. Fetch full catalog for the "Add Extra Services" section
        const catalogRes = await fetch('/api/services');
        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          setCatalog(catalogData);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to fetch evaluation results. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Extracting AI strategy blueprint...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-16 flex flex-col gap-4 items-center">
        <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center text-red-400">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Assessment Error</h2>
        <p className="text-slate-400 text-sm leading-relaxed">{errorMsg}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-2 rounded-xl text-xs font-semibold text-slate-300"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Calculate pricing breakdown in real-time
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = Math.min(discountAmount, subtotal);
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.18 * 100) / 100; // 18% GST
  const grandTotal = taxableAmount + tax;

  // Toggle recommended services in cart
  const handleToggleItem = (service: RecommendedService) => {
    const exists = selectedItems.some((item) => item.serviceId === service.serviceId);
    if (exists) {
      setSelectedItems(prev => prev.filter((item) => item.serviceId !== service.serviceId));
    } else {
      const activeOpts = selectedOptions[service.serviceId] || [];
      const extra = (service.options || []).reduce((sum: number, opt: any) => {
        if (activeOpts.includes(opt.name)) return sum + opt.price_modifier;
        return sum;
      }, 0);
      const unitPrice = service.recommendedPrice + extra;

      let description = service.description || '';
      if (activeOpts.length > 0) {
        description += `\n\nIncluded Deliverables:\n` + activeOpts.map((optName: string) => {
          const opt = service.options.find((o: any) => o.name === optName);
          const modifier = opt ? opt.price_modifier : 0;
          return `• ${optName} (${modifier > 0 ? `+₹${modifier.toLocaleString('en-IN')}` : 'Included'})`;
        }).join('\n');
      }

      setSelectedItems(prev => [
        ...prev,
        {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          description: description,
          quantity: 1,
          unitPrice: unitPrice,
          reason: service.reason,
        },
      ]);
    }
  };

  // Toggle an option for a service
  const handleToggleOption = (serviceId: number, optionName: string) => {
    setSelectedOptions((prev) => {
      const currentOpts = prev[serviceId] || [];
      let newOpts: string[];
      if (currentOpts.includes(optionName)) {
        newOpts = currentOpts.filter((o) => o !== optionName);
      } else {
        newOpts = [...currentOpts, optionName];
      }
      const newMap = { ...prev, [serviceId]: newOpts };

      // Update selected items cart with new pricing and description list
      setSelectedItems((prevCart) => {
        return prevCart.map((item) => {
          if (item.serviceId !== serviceId) return item;
          const recService = data.recommendedServices.find((s) => s.serviceId === serviceId);
          if (!recService) return item;

          const base = recService.recommendedPrice;
          const extra = (recService.options || []).reduce((sum: number, opt: any) => {
            if (newOpts.includes(opt.name)) return sum + opt.price_modifier;
            return sum;
          }, 0);
          const unitPrice = base + extra;

          let description = recService.description || '';
          if (newOpts.length > 0) {
            description += `\n\nIncluded Deliverables:\n` + newOpts.map((optName: string) => {
              const opt = recService.options.find((o: any) => o.name === optName);
              const modifier = opt ? opt.price_modifier : 0;
              return `• ${optName} (${modifier > 0 ? `+₹${modifier.toLocaleString('en-IN')}` : 'Included'})`;
            }).join('\n');
          }

          return {
            ...item,
            unitPrice,
            description,
          };
        });
      });

      return newMap;
    });
  };

  // Adjust quantity
  const handleQtyChange = (serviceId: number, qty: number) => {
    setSelectedItems(prev =>
      prev.map((item) =>
        item.serviceId === serviceId 
          ? { ...item, quantity: Math.max(1, qty) } 
          : item
      )
    );
  };

  // Add extra service from catalog
  const handleAddExtraService = (catItem: ServiceCatalog) => {
    const exists = selectedItems.some((item) => item.serviceId === catItem.id);
    if (exists) return;

    // Calculate dynamic price based on assessment complexity
    const range = catItem.maximumPrice - catItem.minPrice;
    let price = catItem.minPrice + (range * data.complexityScore);
    price = Math.round(price / 500) * 500; // Round to ₹500

    setSelectedItems(prev => [
      ...prev,
      {
        serviceId: catItem.id,
        serviceName: catItem.name,
        description: catItem.description,
        quantity: 1,
        unitPrice: price,
        reason: 'Manually added extra package.',
      },
    ]);
  };

  // Create quotation
  const handleGenerateQuote = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one service to create a quotation.');
      return;
    }

    setGeneratingQuote(true);
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: data.assessment.id,
          customerId: data.assessment.customerId,
          items: selectedItems,
          discountAmount: discount,
        }),
      });

      if (!res.ok) throw new Error('Failed to create proposal quote');
      const quote = await res.json();
      router.push(`/quotation/${quote.id}`);
    } catch (err) {
      console.error(err);
      alert('Error compiling final quotation. Please try again.');
      setGeneratingQuote(false);
    }
  };

  // Filter out services already in cart to display in extra service picker
  const selectedServiceIds = selectedItems.map((item) => item.serviceId);
  const extraServices = catalog.filter((cat) => !selectedServiceIds.includes(cat.id));

  const priorityColors = {
    high: 'border-rose-500/20 bg-rose-950/20 text-rose-400',
    medium: 'border-amber-500/20 bg-amber-950/20 text-amber-400',
    low: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400',
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Profile Title */}
      <section className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Assessments</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cyan-400">Strategy & Recommendations</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100">
          Strategy Blueprint: {data.assessment.customer.company || data.assessment.customer.name}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Prepared for {data.assessment.customer.name} ({data.assessment.customer.email})
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Recommendations and Extras */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* AI Strategy Overview Box */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border-l-4 border-l-cyan-400">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Business Diagnostic
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priorityColors[data.aiAnalysis.priority]}`}>
                Priority {data.aiAnalysis.priority}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 text-sm leading-relaxed">
              <p className="text-slate-200">
                <strong>Business Diagnostic:</strong> {data.aiAnalysis.business_summary}
              </p>
              <p className="text-slate-400 text-xs">
                <strong>Marketing Goals Checklist:</strong> {data.aiAnalysis.primary_goals.join(', ')}
              </p>
              <p className="text-slate-300">
                <strong>Growth Strategy:</strong> {data.aiAnalysis.strategy_summary}
              </p>
            </div>
          </div>

          {/* Recommended Services List */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              <span>Recommended Scope</span>
              <span className="text-xs font-normal text-slate-500">
                (Based on rules + AI analysis)
              </span>
            </h3>

            <div className="flex flex-col gap-4">
              {data.recommendedServices.map((service) => {
                const isChecked = selectedItems.some((item) => item.serviceId === service.serviceId);
                const cartItem = selectedItems.find((item) => item.serviceId === service.serviceId);
                
                return (
                  <div 
                    key={service.serviceId}
                    className={`glass-panel p-5 rounded-2xl transition-all border ${
                      isChecked ? 'border-emerald-500/40 bg-emerald-950/5' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleItem(service)}
                        className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all mt-1 ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-700 text-transparent hover:border-slate-600'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Info & Details */}
                      <div className="flex-grow flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="font-bold text-slate-100">{service.serviceName}</h4>
                          <span className="text-sm font-bold text-cyan-400">
                            ₹{(cartItem ? cartItem.unitPrice : service.recommendedPrice).toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        
                        <p className="text-slate-400 text-xs leading-relaxed">
                           {service.salesDescription}
                        </p>

                        {/* Why Recommended Badge */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-300">
                          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <p><strong>AI Context:</strong> {service.reason}</p>
                        </div>

                        {/* Dynamic Customizable Deliverables / Options */}
                        {isChecked && service.options && service.options.length > 0 && (
                          <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3 mt-1">
                            <span className="text-xs font-semibold text-slate-400">Custom Deliverables Checklist:</span>
                            <div className="flex flex-col gap-2">
                              {service.options.map((opt) => {
                                const activeOpts = selectedOptions[service.serviceId] || [];
                                const isOptSelected = activeOpts.includes(opt.name);
                                return (
                                  <div 
                                    key={opt.name}
                                    onClick={() => handleToggleOption(service.serviceId, opt.name)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                      isOptSelected 
                                        ? 'bg-slate-900/80 border-emerald-500/50 text-slate-200' 
                                        : 'bg-slate-950/20 border-slate-800/40 text-slate-500 hover:border-slate-800'
                                    }`}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isOptSelected}
                                      onChange={() => {}} // Controlled via parent div click
                                      className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                    />
                                    <div className="flex-grow flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold">{opt.name}</span>
                                        <span className="font-mono text-cyan-400 font-bold">
                                          {opt.price_modifier > 0 ? `+₹${opt.price_modifier.toLocaleString('en-IN')}` : 'Included'}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                        {opt.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Quantity Counter */}
                        {isChecked && (
                          <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1">
                            <span className="text-xs text-slate-500">Service Quantity:</span>
                            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(service.serviceId, (cartItem?.quantity || 1) - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-slate-200">
                                {cartItem?.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(service.serviceId, (cartItem?.quantity || 1) + 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Additional Services Section */}
          {extraServices.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
              <h3 className="font-bold text-slate-100 text-lg">Add Extra Scope Packages</h3>
              <p className="text-slate-400 text-xs">Customize the proposal further by selecting other standard agency packages.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {extraServices.map((catItem) => {
                  // Calculate dynamic recommended price
                  const range = catItem.maximumPrice - catItem.minPrice;
                  let price = catItem.minPrice + (range * data.complexityScore);
                  price = Math.round(price / 500) * 500;

                  return (
                    <div 
                      key={catItem.id}
                      className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{catItem.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {catItem.salesDescription || catItem.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 mt-1">
                        <span className="text-xs font-bold text-cyan-400">
                          ₹{price.toLocaleString('en-IN')}/mo
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleAddExtraService(catItem)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Package</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Quote Pricing Summary */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-[50px]" />
            
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 pb-3 border-b border-white/5">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              Proposal Summary
            </h3>

            {/* Selected items list */}
            <div className="flex flex-col gap-3.5">
              {selectedItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No services selected yet.</p>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.serviceId} className="flex items-start justify-between gap-4 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-300">{item.serviceName}</span>
                      <span className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedItems(prev => prev.filter((i) => i.serviceId !== item.serviceId))}
                        className="text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Custom Discount Input */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" /> Apply Discount Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="e.g. 2000"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-colors font-mono"
              />
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3 text-xs font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>GST (18%)</span>
                <span className="font-mono">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-3 mt-1 text-sm">
                <span>Grand Total (INR)</span>
                <span className="text-cyan-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTA Generate Quotation */}
            <button
              type="button"
              onClick={handleGenerateQuote}
              disabled={selectedItems.length === 0 || generatingQuote}
              className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xl text-xs uppercase tracking-wider ${
                selectedItems.length === 0 || generatingQuote
                  ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-emerald-500/10 hover:scale-[1.02]'
              }`}
            >
              <span>{generatingQuote ? 'Compiling Proposal...' : 'Create PDF Quotation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense wrap query parameters in client components
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Extracting AI strategy blueprint...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
