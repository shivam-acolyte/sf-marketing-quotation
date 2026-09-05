'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import type { Question } from '@/types/db';

// Constant labels for drop-downs and selections (English / English written in Hindi)
const industryLabels: Record<string, string> = {
  ecommerce: "Retail / E-commerce",
  d2c: "D2C Brand",
  services: "Professional Services",
  manufacturing: "Manufacturing",
  fnb: "Food & Beverage",
  healthcare: "Healthcare",
  education: "Education",
  realestate: "Real Estate",
  other: "Other"
};

const goalLabels: Record<string, string> = {
  awareness: "Brand Awareness",
  leads: "Lead Generation",
  sales: "Sales & Conversions",
  social: "Social Media Growth",
  traffic: "Website Traffic"
};

const stageLabels: Record<string, string> = {
  new: "< 1 year (Startup)",
  growing: "1–3 years (Growing)",
  established: "3–5 years (Established)",
  established_5plus: "5+ years (Well-established)"
};




const allServiceKeys = ['gmb', 'web', 'ecomm', 'wa', 'smm', 'linkedin', 'content', 'seo', 'ads', 'infl', 'logo', 'pitch', 'orm'];

const INDUSTRY_RELEVANCE: Record<string, Record<string, number>> = {
  ecommerce: { smm: 8, linkedin: 3, ads: 9, seo: 8, web: 5, ecomm: 9, content: 6, wa: 7, infl: 6, gmb: 5, logo: 6, pitch: 3, orm: 6 },
  d2c: { smm: 9, linkedin: 3, ads: 8, seo: 6, web: 5, ecomm: 8, content: 8, wa: 6, infl: 9, gmb: 3, logo: 7, pitch: 3, orm: 6 },
  services: { smm: 5, linkedin: 9, ads: 6, seo: 8, web: 8, ecomm: 1, content: 6, wa: 7, infl: 2, gmb: 9, logo: 6, pitch: 9, orm: 8 },
  manufacturing: { smm: 3, linkedin: 8, ads: 4, seo: 7, web: 8, ecomm: 1, content: 5, wa: 6, infl: 1, gmb: 6, logo: 5, pitch: 8, orm: 5 },
  fnb: { smm: 9, linkedin: 2, ads: 6, seo: 4, web: 5, ecomm: 2, content: 7, wa: 6, infl: 7, gmb: 9, logo: 6, pitch: 2, orm: 9 },
  healthcare: { smm: 4, linkedin: 6, ads: 5, seo: 8, web: 8, ecomm: 1, content: 6, wa: 7, infl: 2, gmb: 9, logo: 6, pitch: 5, orm: 9 },
  education: { smm: 6, linkedin: 6, ads: 6, seo: 7, web: 7, ecomm: 2, content: 8, wa: 7, infl: 3, gmb: 5, logo: 6, pitch: 6, orm: 7 },
  realestate: { smm: 6, linkedin: 7, ads: 7, seo: 7, web: 8, ecomm: 1, content: 5, wa: 8, infl: 3, gmb: 9, logo: 6, pitch: 7, orm: 8 },
  other: { smm: 5, linkedin: 5, ads: 5, seo: 5, web: 5, ecomm: 2, content: 5, wa: 5, infl: 5, gmb: 5, logo: 5, pitch: 5, orm: 5 },
};

const GOAL_BOOST: Record<string, Record<string, number>> = {
  awareness: { smm: 3, content: 3, infl: 2, linkedin: 2, orm: 1 },
  leads: { ads: 3, wa: 3, seo: 1, pitch: 3, linkedin: 2 },
  sales: { ads: 3, seo: 2, web: 1, ecomm: 3, pitch: 2 },
  social: { smm: 3, infl: 3, linkedin: 2 },
  traffic: { seo: 3, content: 2, ads: 1 },
};

const STAGE_BOOST: Record<string, Record<string, number>> = {
  new: { content: 2, web: 2, gmb: 1, logo: 3, pitch: 2 },
  growing: { ads: 1, seo: 1, orm: 1 },
  established: { ads: 2, seo: 1, orm: 2, linkedin: 1 },
  established_5plus: { ads: 2, seo: 1, orm: 2, linkedin: 1 },
};

const resolveWebsiteConflict = (list: string[], scores: Record<string, number>): string[] => {
  if (list.includes('web') && list.includes('ecomm')) {
    const drop = (scores.web || 0) >= (scores.ecomm || 0) ? 'ecomm' : 'web';
    return list.filter(k => k !== drop);
  }
  return list;
};

const relevanceTag = (score: number): string => {
  if (score >= 7) return "High relevance";
  if (score >= 5) return "Medium relevance";
  return "Added reach";
};

const getDynamicServiceName = (serviceKey: string, industry: string): string => {
  if (serviceKey === 'smm') {
    if (industry === 'ecommerce' || industry === 'd2c') return "E-commerce Instagram/Facebook Reels & UGC Validation";
    if (industry === 'realestate') return "Property Virtual Tour Video Editing & Instagram Reels";
    if (industry === 'fnb') return "Food & Beverage Instagram Reels & Diners Stories Posting";
    return "Social Media Curation & Brand Profile Management";
  }
  if (serviceKey === 'linkedin') {
    return "LinkedIn / B2B Social Marketing";
  }
  if (serviceKey === 'ads') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Meta Shopping Ads & Google E-commerce funnels";
    if (industry === 'realestate') return "Meta Local Lead Generation Ads for Listing Inquiries";
    if (industry === 'services' || industry === 'manufacturing') return "B2B LinkedIn & Google Search intent ads";
    if (industry === 'education') return "Admissions Lead Acquisition targeted Meta campaigns";
    return "Paid Ads campaigns (Meta / Google Search)";
  }
  if (serviceKey === 'web') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Shopify / WooCommerce Online Store development";
    if (industry === 'healthcare') return "Clinic Appointment Booking responsive Website";
    if (industry === 'education') return "Course Registration & Student admissions Portal";
    if (industry === 'services') return "Professional Services Lead Capture landing page";
    return "Custom responsive Website Development";
  }
  if (serviceKey === 'ecomm') {
    return "E-commerce Website / Online Store";
  }
  if (serviceKey === 'seo') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Product & Collection page SEO Ranking search optimization";
    if (industry === 'healthcare' || industry === 'fnb') return "Local Doctor / Restaurant organic search positioning";
    return "Google organic Search rankings SEO Audit & cleanup";
  }
  if (serviceKey === 'content') {
    if (industry === 'services' || industry === 'manufacturing') return "B2B Blogs copywriting & Corporate whitepapers";
    if (industry === 'education') return "Curriculum guides writing & Student info sheets copywriting";
    return "Brand Marketing Copywriting & graphic creatives design";
  }
  if (serviceKey === 'gmb') {
    if (industry === 'healthcare') return "Clinic Google maps ranking & local patient reviews setup";
    if (industry === 'fnb') return "Restaurant Google Business maps search verification & photos upload";
    return "Google Business Profile Local Search Optimization";
  }
  if (serviceKey === 'logo') {
    if (industry === 'realestate') return "Premium Real Estate brand logo & listing watermark design";
    return "Corporate brand Logo design & branding assets";
  }
  if (serviceKey === 'pitch') {
    return "Pitch Deck / Business PPT Preparation";
  }
  if (serviceKey === 'orm') {
    return "Online Reputation Management (ORM)";
  }
  if (serviceKey === 'domain') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Store Check-out Security, SSL lock & payment safety auditing";
    return "Domain Protection, WHOIS privacy & Cloudflare integration";
  }
  if (serviceKey === 'infl') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Direct D2C Brand Influencer UGC deals sourcing";
    if (industry === 'fnb') return "Local Food Bloggers review campaign invitations setup";
    return "Micro-Influencer Outreach campaigns listing";
  }

  const defaults: Record<string, string> = {
    smm: "Social Media Management (Instagram/FB)",
    linkedin: "LinkedIn / B2B Social Marketing",
    ads: "Google / Meta Ads Management",
    seo: "SEO",
    web: "Business Website (5-page)",
    ecomm: "E-commerce Website / Store",
    content: "Content Creation",
    wa: "WhatsApp Marketing & Green Tick",
    infl: "Influencer Marketing",
    gmb: "Google Business Profile Optimization",
    logo: "Logo & Brand Identity Design",
    pitch: "Pitch Deck / Business PPT Preparation",
    orm: "Online Reputation Management (ORM)",
    dam: "Dedicated Account Manager",
    analytics: "Advanced Analytics & Reporting",
    adsSetupBasic: "Paid Ads — Setup Fee",
    adsSetupPremium: "Paid Ads — Setup Fee",
    domainSecurity: "Domain Security & SSL"
  };
  return defaults[serviceKey] || serviceKey;
};


export default function Home() {
  // Input Form State
  const [clientName, setClientName] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [industry, setIndustry] = useState('ecommerce');
  const [stage, setStage] = useState('new');
  const [goal, setGoal] = useState('awareness');
  const [secondaryGoal, setSecondaryGoal] = useState('none');
  const [tertiaryGoal, setTertiaryGoal] = useState('none');
  const [presence, setPresence] = useState<string[]>([]);
  const [statedBudget, setStatedBudget] = useState(0);
  const [formStep, setFormStep] = useState<number>(1);
  const [requirementStep, setRequirementStep] = useState<number>(1);

  // Current Presence granular states
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [websiteImprovement, setWebsiteImprovement] = useState<boolean>(false);

  const [hasSocial, setHasSocial] = useState<boolean | null>(null);
  const [socialImprovement, setSocialImprovement] = useState<boolean>(false);

  const [hasGmb, setHasGmb] = useState<boolean | null>(null);
  const [gmbImprovement, setGmbImprovement] = useState<boolean>(false);

  const [noneOfThese, setNoneOfThese] = useState<boolean>(false);

  // AI Category Auto-Detect State
  const [businessDescription, setBusinessDescription] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState('');

  // Base pricing and multipliers
  const [basePrices, setBasePrices] = useState({
    smm: 20000,
    linkedin: 15000,
    ads: 35000,
    seo: 18000,
    web: 20000,
    ecomm: 90000,
    content: 8000,
    wa: 5000,
    infl: 10000,
    gmb: 4000,
    logo: 15000,
    pitch: 15000,
    orm: 8000,
    dam: 8000,
    analytics: 5000,
    adsSetupBasic: 2000,
    adsSetupPremium: 5000,
    domainSecurity: 25000,
  });

  const [multipliers, setMultipliers] = useState({
    low: 0.85,
    medium: 1.0,
    high: 1.25,
  });

  // UI state
  const [copiedShow, setCopiedShow] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dynamic Survey Questions loaded from control panel
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<number, any>>({});
  const [dynamicFollowUps, setDynamicFollowUps] = useState<Record<number, boolean>>({});

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/questions', { cache: 'no-store' });
      if (res.ok) {
        const data: Question[] = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  useEffect(() => {
    loadQuestions();
    const handleFocus = () => loadQuestions();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const page1Questions = questions
    .filter(q => (q.page ?? 1) === 1 && q.active !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const page2Questions = questions
    .filter(q => (q.page ?? 1) === 2 && q.active !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const page3Questions = questions
    .filter(q => (q.page ?? 1) === 3 && q.active !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const isPage1Valid = page1Questions.length === 0 || page1Questions.every(q => {
    if (!q.required) return true;
    if (q.id === 1) return Boolean(clientName.trim());
    if (q.id === 2) return Boolean(clientCity.trim());
    if (q.id === 6) return Boolean(salesperson.trim());
    if (q.id === 4) return Boolean(industry);
    if (q.id === 5) return Boolean(stage);
    if (dynamicAnswers[q.id] !== undefined) return Boolean(String(dynamicAnswers[q.id]).trim());
    return true;
  });

  const isPage2Valid = page2Questions.length === 0 || page2Questions.every(q => {
    if (!q.required) return true;
    if (q.id === 1) return Boolean(clientName.trim());
    if (q.id === 2) return Boolean(clientCity.trim());
    if (q.id === 6) return Boolean(salesperson.trim());
    if (q.id === 7) return hasWebsite !== null;
    if (q.id === 8) return hasSocial !== null;
    if (q.id === 9) return hasGmb !== null;
    if (dynamicAnswers[q.id] !== undefined) return Boolean(String(dynamicAnswers[q.id]).trim());
    return true;
  });

  // Form validity check: required fields must be filled
  const isFormValid = Boolean(
    clientName.trim() &&
    clientCity.trim() &&
    salesperson.trim() &&
    industry &&
    stage &&
    goal
  );

  // Trigger analysis and build quotation
  const handleAnalyzeNow = () => {
    if (!isFormValid) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
    }, 450);
  };

  // Fetch prices from database on mount
  useEffect(() => {
    async function fetchDatabasePrices() {
      try {
        const res = await fetch('/api/quick-quote');
        if (res.ok) {
          const data = await res.json();
          if (data.basePrices) {
            setBasePrices((prev) => ({
              ...prev,
              ...data.basePrices,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching prices from DB:', error);
      }
    }
    fetchDatabasePrices();
  }, []);

  // AI Category Auto-detection
  const handleAutoDetectCategory = async () => {
    if (!businessDescription.trim()) return;
    setIsDetecting(true);
    setDetectionResult('');
    try {
      const res = await fetch('/api/classify-industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: businessDescription }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quickQuoteCategory) {
          setIndustry(data.quickQuoteCategory);
          setDetectionResult(data.quickQuoteCategory);
        }
      }
    } catch (error) {
      console.error('Error auto-detecting category:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  // Helper formatting currency
  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString('en-IN');

  // Granular presence toggle handlers
  const handleWebsiteToggle = (val: boolean) => {
    setHasWebsite(val);
    if (!val) setWebsiteImprovement(false);
    if (val) setNoneOfThese(false);
    setIsAnalyzed(false);
  };

  const handleSocialToggle = (val: boolean) => {
    setHasSocial(val);
    if (!val) setSocialImprovement(false);
    if (val) setNoneOfThese(false);
    setIsAnalyzed(false);
  };

  const handleGmbToggle = (val: boolean) => {
    setHasGmb(val);
    if (!val) setGmbImprovement(false);
    if (val) setNoneOfThese(false);
    setIsAnalyzed(false);
  };

  const handleNoneOfTheseToggle = (checked: boolean) => {
    setNoneOfThese(checked);
    if (checked) {
      setHasWebsite(false);
      setWebsiteImprovement(false);
      setHasSocial(false);
      setSocialImprovement(false);
      setHasGmb(false);
      setGmbImprovement(false);
    }
    setIsAnalyzed(false);
  };

  // Multi-checkbox toggling (backwards compatibility)
  const handlePresenceChange = (val: string) => {
    if (val === 'none') {
      setPresence(['none']);
    } else {
      setPresence((prev) => {
        const filtered = prev.filter((p) => p !== 'none');
        if (filtered.includes(val)) {
          return filtered.filter((p) => p !== val);
        } else {
          return [...filtered, val];
        }
      });
    }
  };

  // Dynamic Question Renderer
  const renderQuestion = (q: Question) => {
    // 1. Core question mapping
    if (q.id === 1) {
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.35 }}>
              {q.description}
            </p>
          )}
          <input
            type="text"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              setIsAnalyzed(false);
            }}
            placeholder="e.g. Meera Handicrafts"
          />
        </div>
      );
    }

    if (q.id === 2) {
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.35 }}>
              {q.description}
            </p>
          )}
          <input
            type="text"
            value={clientCity}
            onChange={(e) => {
              setClientCity(e.target.value);
              setIsAnalyzed(false);
            }}
            placeholder="e.g. Jaipur"
          />
        </div>
      );
    }

    if (q.id === 3) {
      return (
        <div key={q.id} className="field auto-detect-card">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            <span>{q.question}</span>
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.35 }}>
              {q.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="e.g. Apne business ka naam likhe"
              style={{ flex: 1, height: '46px' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAutoDetectCategory}
              disabled={isDetecting || !businessDescription.trim()}
              style={{
                padding: '0 16px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                minWidth: '120px',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              {isDetecting ? (
                <>
                  <span className="spinner-mini"></span>
                  Detecting...
                </>
              ) : (
                <>
                  <i className="ti ti-sparkles"></i>
                  Find industry
                </>
              )}
            </button>
          </div>
          {detectionResult && (
            <div style={{ fontSize: '14px', marginTop: '6px', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="ti ti-circle-check" style={{ color: 'var(--green)', fontSize: '16px' }}></i>
              <span>Category selected: <strong>{industryLabels[detectionResult] || detectionResult}</strong></span>
            </div>
          )}
        </div>
      );
    }

    if (q.id === 4) {
      const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : Object.values(industryLabels);
      return (
        <div key={q.id} className="field" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
          <div style={{ minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', margin: 0, lineHeight: 1.25, color: 'var(--ink)' }}>
              Industry / Nature of business {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
            </label>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '3px 0 0 0', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={q.description || 'Select closest matching business domain'}>
              {q.description || 'Select closest matching business domain'}
            </p>
          </div>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setIsAnalyzed(false);
            }}
            style={{ marginTop: '8px', fontSize: '13px', padding: '8px 20px 8px 10px', height: '44px', width: '100%', boxSizing: 'border-box' }}
          >
            {opts.map((opt: string, idx: number) => {
              const key = Object.keys(industryLabels).find(k => industryLabels[k].toLowerCase() === opt.toLowerCase()) || opt.toLowerCase().replace(/[^a-z0-9]/g, '');
              return (
                <option key={idx} value={key}>
                  {opt}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    if (q.id === 5) {
      const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : Object.values(stageLabels);
      const title = q.question.includes('(') ? q.question.split('(')[0].trim() : q.question;
      const desc = q.description || (q.question.includes('(') ? q.question.split('(')[1]?.replace(/\)/g, '').trim() : 'Apka business kitne saal purana hai?');
      return (
        <div key={q.id} className="field" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
          <div style={{ minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', margin: 0, lineHeight: 1.25, color: 'var(--ink)' }}>
              {title} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
            </label>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '3px 0 0 0', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={desc}>
              {desc}
            </p>
          </div>
          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setIsAnalyzed(false);
            }}
            style={{ marginTop: '8px', fontSize: '13px', padding: '8px 20px 8px 10px', height: '44px', width: '100%', boxSizing: 'border-box' }}
          >
            {opts.map((opt: string, idx: number) => {
              const stageKeys = ['new', 'growing', 'established', 'established_5plus'];
              const key = Object.keys(stageLabels).find(k => stageLabels[k].toLowerCase() === opt.toLowerCase()) || stageKeys[idx] || opt.toLowerCase().replace(/[^a-z0-9]/g, '');
              const labelText = opt
                .replace(/< 1 year \(New \/ Startup\)/i, '< 1 yr (Startup)')
                .replace(/< 1 year \(Startup\)/i, '< 1 yr (Startup)')
                .replace(/< 1 year/i, '< 1 yr')
                .replace(/1 – 3 years/i, '1 – 3 yrs')
                .replace(/3 – 5 years/i, '3 – 5 yrs')
                .replace(/5\+ years/i, '5+ yrs');
              return (
                <option key={idx} value={key}>
                  {labelText}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    if (q.id === 6) {
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.35 }}>
              {q.description}
            </p>
          )}
          <input
            type="text"
            value={salesperson}
            onChange={(e) => {
              setSalesperson(e.target.value);
              setIsAnalyzed(false);
            }}
            placeholder="Your name"
          />
        </div>
      );
    }

    if (q.id === 7) {
      return (
        <div key={q.id} className="presence-item">
          <div className="presence-item-header">
            <div className="presence-info">
              <div className="presence-title">
                <i className="ti ti-world" style={{ color: 'var(--green-dark)', marginRight: '8px', fontSize: '18px' }}></i>
                <strong>{q.question}</strong>
              </div>
              <div className="presence-sub">{q.description || 'Do they have an active website?'}</div>
            </div>
            <div className="yes-no-group">
              <button
                type="button"
                onClick={() => handleWebsiteToggle(true)}
                className={`yn-btn ${hasWebsite === true ? 'active-yes' : ''}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleWebsiteToggle(false)}
                className={`yn-btn ${hasWebsite === false ? 'active-no' : ''}`}
              >
                No
              </button>
            </div>
          </div>
          {hasWebsite === true && q.hasFollowUp && (
            <div className="improvement-reveal">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={websiteImprovement}
                  onChange={(e) => {
                    setWebsiteImprovement(e.target.checked);
                    setIsAnalyzed(false);
                  }}
                />
                <span>{q.followUpText || 'Want improvement / Redesign'}</span>
              </label>
            </div>
          )}
        </div>
      );
    }

    if (q.id === 8) {
      return (
        <div key={q.id} className="presence-item">
          <div className="presence-item-header">
            <div className="presence-info">
              <div className="presence-title">
                <i className="ti ti-brand-instagram" style={{ color: '#e1306c', marginRight: '8px', fontSize: '18px' }}></i>
                <strong>{q.question}</strong>
              </div>
              <div className="presence-sub">{q.description || 'Active profiles on Instagram / Facebook / LinkedIn?'}</div>
            </div>
            <div className="yes-no-group">
              <button
                type="button"
                onClick={() => handleSocialToggle(true)}
                className={`yn-btn ${hasSocial === true ? 'active-yes' : ''}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleSocialToggle(false)}
                className={`yn-btn ${hasSocial === false ? 'active-no' : ''}`}
              >
                No
              </button>
            </div>
          </div>
          {hasSocial === true && q.hasFollowUp && (
            <div className="improvement-reveal">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={socialImprovement}
                  onChange={(e) => {
                    setSocialImprovement(e.target.checked);
                    setIsAnalyzed(false);
                  }}
                />
                <span>{q.followUpText || 'Want improvement / Growth & Management'}</span>
              </label>
            </div>
          )}
        </div>
      );
    }

    if (q.id === 9) {
      return (
        <div key={q.id} className="presence-item">
          <div className="presence-item-header">
            <div className="presence-info">
              <div className="presence-title">
                <i className="ti ti-map-pin" style={{ color: '#ea4335', marginRight: '8px', fontSize: '18px' }}></i>
                <strong>{q.question}</strong>
              </div>
              <div className="presence-sub">{q.description || 'Google Maps listing verified & active?'}</div>
            </div>
            <div className="yes-no-group">
              <button
                type="button"
                onClick={() => handleGmbToggle(true)}
                className={`yn-btn ${hasGmb === true ? 'active-yes' : ''}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleGmbToggle(false)}
                className={`yn-btn ${hasGmb === false ? 'active-no' : ''}`}
              >
                No
              </button>
            </div>
          </div>
          {hasGmb === true && q.hasFollowUp && (
            <div className="improvement-reveal">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={gmbImprovement}
                  onChange={(e) => {
                    setGmbImprovement(e.target.checked);
                    setIsAnalyzed(false);
                  }}
                />
                <span>{q.followUpText || 'Want improvement / Ranking & Reviews'}</span>
              </label>
            </div>
          )}
        </div>
      );
    }

    if (q.id === 10) {
      return (
        <div key={q.id} className="none-of-these-wrapper">
          <label className="checkbox-label none-label">
            <input
              type="checkbox"
              checked={noneOfThese}
              onChange={(e) => handleNoneOfTheseToggle(e.target.checked)}
            />
            <span><strong>{q.question}</strong></span>
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0 28px', lineHeight: 1.35 }}>
              {q.description}
            </p>
          )}
        </div>
      );
    }

    // 2. Generic / Custom Questions added by admin
    if (q.questionType === 'yes_no') {
      const isTriggered = dynamicAnswers[q.id] === (q.followUpTrigger || 'Yes');
      return (
        <div key={q.id} className="presence-item">
          <div className="presence-item-header">
            <div className="presence-info">
              <div className="presence-title">
                <strong>{q.question}</strong>
                {q.required && <span style={{ color: 'var(--red)', marginLeft: '4px' }}>*</span>}
              </div>
              {q.description && <div className="presence-sub">{q.description}</div>}
            </div>
            <div className="yes-no-group">
              <button
                type="button"
                onClick={() => {
                  setDynamicAnswers(prev => ({ ...prev, [q.id]: 'Yes' }));
                  setIsAnalyzed(false);
                }}
                className={`yn-btn ${dynamicAnswers[q.id] === 'Yes' ? 'active-yes' : ''}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setDynamicAnswers(prev => ({ ...prev, [q.id]: 'No' }));
                  setDynamicFollowUps(prev => ({ ...prev, [q.id]: false }));
                  setIsAnalyzed(false);
                }}
                className={`yn-btn ${dynamicAnswers[q.id] === 'No' ? 'active-no' : ''}`}
              >
                No
              </button>
            </div>
          </div>
          {q.hasFollowUp && isTriggered && (
            <div className="improvement-reveal">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(dynamicFollowUps[q.id])}
                  onChange={(e) => {
                    setDynamicFollowUps(prev => ({ ...prev, [q.id]: e.target.checked }));
                    setIsAnalyzed(false);
                  }}
                />
                <span>{q.followUpText || 'Selected'}</span>
              </label>
            </div>
          )}
        </div>
      );
    }

    if (q.questionType === 'text') {
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.4 }}>
              {q.description}
            </p>
          )}
          <input
            type="text"
            value={dynamicAnswers[q.id] || ''}
            onChange={(e) => {
              setDynamicAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
              setIsAnalyzed(false);
            }}
            placeholder="Enter response..."
          />
        </div>
      );
    }

    if (q.questionType === 'single_choice') {
      const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '2px 0 6px 0', lineHeight: 1.4 }}>
              {q.description}
            </p>
          )}
          <select
            value={dynamicAnswers[q.id] || ''}
            onChange={(e) => {
              setDynamicAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
              setIsAnalyzed(false);
            }}
          >
            <option value="">Select option...</option>
            {opts.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (q.questionType === 'multi_choice') {
      const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
      const currentVals: string[] = dynamicAnswers[q.id] || [];
      return (
        <div key={q.id} className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
            {q.question} {q.required && <span style={{ color: 'var(--red)' }}>*</span>}
          </label>
          {q.description && (
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              {q.description}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {opts.map((opt: string, idx: number) => {
              const isSel = currentVals.includes(opt);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const updated = isSel ? currentVals.filter(v => v !== opt) : [...currentVals, opt];
                    setDynamicAnswers(prev => ({ ...prev, [q.id]: updated }));
                    setIsAnalyzed(false);
                  }}
                  className={`chip ${isSel ? 'on' : ''}`}
                  style={isSel ? { background: '#ecfdf5', borderColor: 'var(--green)', color: 'var(--green-dark)', fontWeight: 600 } : {}}
                >
                  {isSel && <i className="ti ti-check" style={{ marginRight: '4px' }}></i>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // Multi-priority business goals selection handler
  const handleGoalToggle = (opt: string) => {
    setIsAnalyzed(false);

    // If clicking primary goal
    if (goal === opt) {
      if (secondaryGoal !== 'none') {
        setGoal(secondaryGoal);
        setSecondaryGoal(tertiaryGoal !== 'none' ? tertiaryGoal : 'none');
        setTertiaryGoal('none');
      } else {
        setGoal('');
      }
      return;
    }

    // If clicking secondary goal
    if (secondaryGoal === opt) {
      setSecondaryGoal(tertiaryGoal !== 'none' ? tertiaryGoal : 'none');
      setTertiaryGoal('none');
      return;
    }

    // If clicking tertiary goal
    if (tertiaryGoal === opt) {
      setTertiaryGoal('none');
      return;
    }

    // Unselected goal clicked: assign to the next open priority tier
    if (!goal) {
      setGoal(opt);
    } else if (secondaryGoal === 'none') {
      setSecondaryGoal(opt);
    } else if (tertiaryGoal === 'none') {
      setTertiaryGoal(opt);
    } else {
      // 3 already selected: replace the 3rd (tertiary) goal
      setTertiaryGoal(opt);
    }
  };

  // Profile-driven scoring model
  const getScoredServices = () => {
    const isStartingFromZero = noneOfThese || (hasWebsite === false && hasSocial === false && hasGmb === false) || presence.includes('none');

    const presenceAdj: Record<string, number> = {};
    const bump = (k: string, v: number) => {
      presenceAdj[k] = (presenceAdj[k] || 0) + v;
    };

    if (hasWebsite === false || websiteImprovement || !presence.includes('website')) {
      bump('web', websiteImprovement ? 2 : 3);
      bump('ecomm', websiteImprovement ? 2 : 3);
    } else if (hasWebsite === true || presence.includes('website')) {
      bump('web', -2);
      bump('ecomm', -2);
    }

    if (hasSocial === false || socialImprovement || !presence.includes('social')) {
      bump('smm', socialImprovement ? 2 : 2);
      bump('linkedin', 1);
    } else if (hasSocial === true || presence.includes('social')) {
      bump('smm', -1);
      bump('linkedin', -1);
    }

    if (hasGmb === false || gmbImprovement || !presence.includes('gmb')) {
      bump('gmb', gmbImprovement ? 2 : 3);
    } else if (hasGmb === true || presence.includes('gmb')) {
      bump('gmb', -2);
    }

    if (isStartingFromZero) {
      bump('web', 1);
      bump('gmb', 1);
      bump('smm', 1);
      bump('logo', 2);
    }

    const goalBoostHighest = GOAL_BOOST[goal] || {};
    const goalBoostSec = GOAL_BOOST[secondaryGoal] || {};
    const goalBoostTert = GOAL_BOOST[tertiaryGoal] || {};
    const stageBoost = STAGE_BOOST[stage] || {};
    const industryScore = INDUSTRY_RELEVANCE[industry] || INDUSTRY_RELEVANCE.other;

    const scores: Record<string, number> = {};
    allServiceKeys.forEach(k => {
      const highestModifier = goalBoostHighest[k] || 0;
      const secModifier = goalBoostSec[k] || 0;
      const tertModifier = goalBoostTert[k] || 0;

      const modifiers = (stageBoost[k] || 0) + (presenceAdj[k] || 0) +
        highestModifier + (secModifier * 0.35) + (tertModifier * 0.35);

      const score = industryScore[k] * 0.7 + modifiers * 0.5;
      scores[k] = Math.round(score * 10) / 10;
    });

    const reasonMap: Record<string, string> = {
      awareness: "brand awareness needs consistent, industry-relevant content and presence",
      leads: "lead generation moves fastest through channels this industry's buyers actually use",
      sales: "sales conversion needs demand-generation channels that fit how this industry buys",
      social: "social growth is prioritized on the platforms most relevant to this industry",
      traffic: "traffic growth leans on the discovery channels that work best for this industry",
    };

    return { scores, reason: reasonMap[goal] || "growth is driven by establishing category relevance" };
  };

  // Build the Low, Medium, and High plans using the scoring model
  const buildPlans = () => {
    const { scores, reason } = getScoredServices();

    const CAT: Record<string, { name: string; type: string; base: number }> = {
      smm: { name: getDynamicServiceName('smm', industry), type: "monthly", base: basePrices.smm },
      linkedin: { name: getDynamicServiceName('linkedin', industry), type: "monthly", base: basePrices.linkedin },
      ads: { name: getDynamicServiceName('ads', industry), type: "monthly", base: basePrices.ads },
      seo: { name: getDynamicServiceName('seo', industry), type: "monthly", base: basePrices.seo },
      web: { name: getDynamicServiceName('web', industry), type: "onetime", base: basePrices.web },
      ecomm: { name: getDynamicServiceName('ecomm', industry), type: "onetime", base: basePrices.ecomm },
      content: { name: getDynamicServiceName('content', industry), type: "monthly", base: basePrices.content },
      wa: { name: getDynamicServiceName('wa', industry), type: "onetime", base: basePrices.wa },
      infl: { name: getDynamicServiceName('infl', industry), type: "monthly", base: basePrices.infl },
      gmb: { name: getDynamicServiceName('gmb', industry), type: "onetime", base: basePrices.gmb },
      logo: { name: getDynamicServiceName('logo', industry), type: "onetime", base: basePrices.logo },
      pitch: { name: getDynamicServiceName('pitch', industry), type: "onetime", base: basePrices.pitch },
      orm: { name: getDynamicServiceName('orm', industry), type: "monthly", base: basePrices.orm },
      dam: { name: getDynamicServiceName('dam', industry), type: "monthly", base: basePrices.dam },
      analytics: { name: getDynamicServiceName('analytics', industry), type: "monthly", base: basePrices.analytics },
      adsSetupBasic: { name: getDynamicServiceName('adsSetupBasic', industry), type: "onetime", base: basePrices.adsSetupBasic },
      adsSetupPremium: { name: getDynamicServiceName('adsSetupPremium', industry), type: "onetime", base: basePrices.adsSetupPremium },
      domainSecurity: { name: getDynamicServiceName('domainSecurity', industry), type: "onetime", base: basePrices.domainSecurity },
    };

    const isSiteActive = hasWebsite === true || presence.includes('website');
    const isSocialActive = hasSocial === true || presence.includes('social');
    const isGmbActive = hasGmb === true || presence.includes('gmb');

    const excludeKeys: string[] = [];
    if (isSiteActive && !websiteImprovement) excludeKeys.push('web', 'ecomm');
    if (isSocialActive && !socialImprovement) excludeKeys.push('smm', 'linkedin');
    if (isGmbActive && !gmbImprovement) excludeKeys.push('gmb');

    const availableKeys = allServiceKeys.filter(k => !excludeKeys.includes(k));
    const ranked = availableKeys.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

    // Low Plan: Score >= 7 (minimum 2 services)
    let lowList = ranked.filter(k => (scores[k] || 0) >= 7).slice(0, 3);
    if (lowList.length < 2) lowList = ranked.slice(0, 2);
    lowList = resolveWebsiteConflict(lowList, scores);

    // Medium Plan: Score >= 5 (minimum lowList.length, merged/deduped)
    let mediumList = ranked.filter(k => (scores[k] || 0) >= 5).slice(0, 5);
    if (mediumList.length < lowList.length) mediumList = lowList.slice();
    mediumList = Array.from(new Set(lowList.concat(mediumList)));
    mediumList = resolveWebsiteConflict(mediumList, scores);

    // High Plan: Score >= 3 (minimum mediumList.length + 2, merged/deduped)
    let highList = ranked.filter(k => (scores[k] || 0) >= 3).slice(0, 7);
    highList = Array.from(new Set(mediumList.concat(highList)));
    if (highList.length <= mediumList.length && ranked.length > mediumList.length) {
      highList = Array.from(new Set(mediumList.concat(ranked.slice(0, mediumList.length + 2))));
    }
    highList = resolveWebsiteConflict(highList, scores);

    // High plan add-ons
    const highAddons = ['dam', 'analytics'];

    const buildTier = (key: 'low' | 'medium' | 'high', serviceKeys: string[], addonKeys: string[], tagline: string) => {
      const m = multipliers[key];
      const items: any[] = serviceKeys.map(k => {
        const s = CAT[k];
        return {
          key: k,
          name: s.name,
          type: s.type,
          price: s.base * m,
          scope: relevanceTag(scores[k] || 0),
        };
      });

      addonKeys.forEach(k => {
        const s = CAT[k];
        items.push({
          key: k,
          name: s.name,
          type: s.type,
          price: s.base,
          scope: "Add-on",
        });
      });

      // Companion fees: real one-time costs that ride along with certain services.
      if (serviceKeys.includes('ads')) {
        const setupKey = key === 'high' ? 'adsSetupPremium' : 'adsSetupBasic';
        const s = CAT[setupKey];
        items.push({
          key: setupKey,
          name: s.name,
          type: s.type,
          price: s.base,
          scope: "Required with Paid Ads",
        });
      }
      if (key === 'high' && (serviceKeys.includes('web') || serviceKeys.includes('ecomm'))) {
        const s = CAT.domainSecurity;
        items.push({
          key: 'domainSecurity',
          name: s.name,
          type: s.type,
          price: s.base,
          scope: "Add-on",
        });
      }

      let monthly = 0;
      let onetime = 0;
      items.forEach(it => {
        if (it.type === 'monthly') monthly += it.price;
        else onetime += it.price;
      });

      return { key, items, monthly, onetime, tagline };
    };

    return {
      low: buildTier('low', lowList, [], `Highest-relevance essentials for ${industryLabels[industry]?.toLowerCase() || 'general'} businesses`),
      medium: buildTier('medium', mediumList, [], "Balanced, full-service growth plan"),
      high: buildTier('high', highList, highAddons, "Extended reach with dedicated support"),
      reasons: [reason],
    };
  };

  const plans = buildPlans();
  const showEmpty = !isAnalyzed || !isFormValid;

  // Stated budget match logic
  let closestKey: 'low' | 'medium' | 'high' | null = null;
  if (statedBudget > 0) {
    let best = Infinity;
    const tiers: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    for (const k of tiers) {
      const diff = Math.abs(plans[k].monthly - statedBudget);
      if (diff < best) {
        best = diff;
        closestKey = k;
      }
    }
  }

  // Save Quote to database (registers leads and metrics)
  const saveQuotationToDb = async (tierKey: 'low' | 'medium' | 'high') => {
    const p = plans[tierKey];
    try {
      await fetch('/api/quick-quote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientCity,
          salesperson,
          industry,
          stage,
          goal,
          secondaryGoal,
          tertiaryGoal,
          businessDescription,
          tierName: tierKey.toUpperCase(),
          monthly: p.monthly,
          onetime: p.onetime,
          items: p.items,
        }),
      });
    } catch (err) {
      console.error('Error saving quotation log:', err);
    }
  };

  // Copy to clipboard flow
  const handleCopyAsText = () => {
    const tierMeta = {
      low: { label: 'LOW', name: 'Starter' },
      medium: { label: 'MEDIUM', name: 'Growth' },
      high: { label: 'HIGH', name: 'Accelerator' }
    };

    let text = `*StartupFlora — Digital Marketing Plans*\n`;
    text += `Client: ${clientName}\n`;
    if (clientCity) text += `Location: ${clientCity}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n`;

    const keys: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    keys.forEach(k => {
      const p = plans[k];
      text += `\n*${tierMeta[k].label} — ${tierMeta[k].name} (${fmt(p.monthly)}/month)*\n`;
      p.items.forEach(it => {
        text += `• ${it.name} — ${fmt(it.price)}${it.type === 'monthly' ? '/mo' : ' (one-time)'}\n`;
      });
      if (p.onetime > 0) text += `Setup (one-time): ${fmt(p.onetime)}\n`;
    });

    text += `\n_Quotation valid for 15 days. Final pricing may vary based on detailed scope discussion._\n`;
    if (salesperson) text += `\nPrepared by: ${salesperson}, StartupFlora\n`;
    text += `+91 9240-203-227 | info@startupflora.com`;

    navigator.clipboard.writeText(text).then(() => {
      // Save medium plan by default when copy occurs
      saveQuotationToDb('medium');

      setCopiedShow(true);
      setTimeout(() => setCopiedShow(false), 1800);
    });
  };

  // PDF Generator flow
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const green = [0, 196, 154];
    const orange = [69, 171, 209];
    const ink = [26, 36, 51];
    const mutedColor = [108, 117, 125];
    const tierMeta = {
      low: { label: 'LOW PLAN', name: 'Starter' },
      medium: { label: 'MEDIUM PLAN', name: 'Growth' },
      high: { label: 'HIGH PLAN', name: 'Accelerator' }
    };

    // Header header block
    doc.setFillColor(green[0], green[1], green[2]);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(0, 26, 210, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('StartupFlora', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Marketing Plans — Low / Medium / High', 14, 22);

    // Header metadata
    doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.setFontSize(9);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 15, { align: 'right' });
    doc.text('Valid for 15 days', 196, 21, { align: 'right' });

    let y = 36;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(clientName || 'Client Name', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    y += 5;
    const goalsList = [goalLabels[goal], secondaryGoal !== 'none' && goalLabels[secondaryGoal], tertiaryGoal !== 'none' && goalLabels[tertiaryGoal]].filter(Boolean).join(' + ');
    const metaLine = [clientCity, industryLabels[industry], stageLabels[stage], goalsList].filter(Boolean).join('  ·  ');
    doc.text(metaLine, 14, y);
    y += 9;

    const colW = 60;
    const colGap = 4;
    const startX = 14;
    const cols: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    cols.forEach((k, idx) => {
      const x = startX + idx * (colW + colGap);
      const p = plans[k];
      let cy = y;

      // Draw border
      doc.setDrawColor(k === 'medium' ? green[0] : 215, k === 'medium' ? green[1] : 222, k === 'medium' ? green[2] : 217);
      doc.setLineWidth(k === 'medium' ? 0.6 : 0.3);

      const rowsHeight = p.items.length * 11 + 46;
      doc.roundedRect(x, cy, colW, rowsHeight, 2, 2, 'D');

      // Recommended badge
      if (k === 'medium') {
        doc.setFillColor(green[0], green[1], green[2]);
        doc.roundedRect(x + colW / 2 - 16, cy - 3, 32, 6, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('MOST POPULAR', x + colW / 2, cy + 1, { align: 'center' });
      }

      cy += 8;
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(tierMeta[k].label, x + colW / 2, cy, { align: 'center' });
      cy += 6;
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(tierMeta[k].name, x + colW / 2, cy, { align: 'center' });
      cy += 8;
      doc.setTextColor(green[0], green[1], green[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(p.monthly) + '/mo', x + colW / 2, cy, { align: 'center' });
      cy += 5;
      if (p.onetime > 0) {
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('+ ' + fmt(p.onetime) + ' setup', x + colW / 2, cy, { align: 'center' });
      }
      cy += 6;
      doc.setDrawColor(215, 222, 217);
      doc.setLineWidth(0.2);
      doc.line(x + 4, cy, x + colW - 4, cy);
      cy += 5;

      doc.setFontSize(7.8);
      p.items.forEach((it: any) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(ink[0], ink[1], ink[2]);
        const nameLines = doc.splitTextToSize(it.name, colW - 8);
        doc.text(nameLines, x + 4, cy);
        cy += nameLines.length * 3.4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.setFontSize(7);
        doc.text((it.type === 'monthly' ? fmt(it.price) + '/mo' : fmt(it.price) + ' setup'), x + 4, cy);
        doc.setFontSize(7.8);
        cy += 6;
      });
    });

    const maxItems = Math.max(...cols.map(k => plans[k].items.length));
    y += maxItems * 11 + 56;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const why = `All three plans are matched to a ${stageLabels[stage].toLowerCase()} ${industryLabels[industry].toLowerCase()} business focused on ${goalLabels[goal].toLowerCase()}${secondaryGoal !== 'none' ? ', ' + goalLabels[secondaryGoal].toLowerCase() : ''}${tertiaryGoal !== 'none' ? ', and ' + goalLabels[tertiaryGoal].toLowerCase() : ''}. Higher tiers add scope, speed, and dedicated support.`;
    const whyLines = doc.splitTextToSize(why, 182);
    doc.text(whyLines, 14, y);
    y += whyLines.length * 4.5 + 8;

    doc.setDrawColor(215, 222, 217);
    doc.line(14, y, 196, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(ink[0], ink[1], ink[2]);
    if (salesperson) doc.text(`Prepared by: ${salesperson}, StartupFlora`, 14, y);
    y += 5;
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('StartupFlora · Jaipur · Ahmedabad · Hyderabad · Gurugram', 14, y);
    y += 5;
    doc.text('+91 9240-203-227  |  info@startupflora.com  |  startupflora.com', 14, y);

    const fname = (clientName || 'client').replace(/[^a-z0-9]/gi, '_');
    doc.save(`StartupFlora_Plans_${fname}.pdf`);

    // Log the quotation in database as draft
    saveQuotationToDb(closestKey || 'medium');
  };


  return (
    <div className="startupflora-desk">
      {/* Dynamic styling tags to replicate StartupFlora themes exactly */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --green: #00C49A;
          --green-dark: #2C97B7;
          --mint: #e8f5ee;
          --orange: #45ABD1;
          --ink: #1A2433;
          --paper: #F4F6F8;
          --line: #A0AAB2;
          --muted: #6C757D;
          --red: #8B1E1E;
        }
        body {
          background: var(--paper) !important;
          color: var(--ink) !important;
          font-family: 'Inter', sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px 60px;
        }
        header.top {
          background: linear-gradient(180deg, #dcf4fb 0%, #bdeaf7 100%);
          color: #0f172a;
          padding: 14px 0;
          border-bottom: 1px solid #bce4f5;
        }
        header.top .wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding-bottom: 0;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }
        .brand-logo {
          height: 36px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        .brand-name {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.02em;
          color: #000000;
          line-height: 1;
        }
        .sales-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.32);
          color: #047857;
          padding: 4px 10px 4px 8px;
          border-radius: 9999px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1;
          box-shadow: 0 1px 2px rgba(16, 185, 129, 0.08);
          user-select: none;
        }
        .sales-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
          display: inline-block;
          animation: pulse-dot 2s infinite ease-in-out;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.65; }
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .tool-tag {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #0369a1;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(14, 165, 233, 0.28);
          box-shadow: 0 2px 6px -1px rgba(14, 165, 233, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          letter-spacing: -0.01em;
          transition: all 0.2s ease;
        }
        .tool-tag:hover {
          background: #ffffff;
          border-color: rgba(14, 165, 233, 0.45);
          box-shadow: 0 4px 12px -2px rgba(14, 165, 233, 0.2);
        }
        .tool-tag i {
          color: #0284c7;
          font-size: 14px;
        }
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .admin-btn:hover {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
        }
        .admin-btn i {
          font-size: 13.5px;
          color: #64748b;
          transition: color 0.2s ease;
        }
        .admin-btn:hover i {
          color: #38bdf8;
        }
        .layout {
          display: grid;
          grid-template-columns: 500px 1fr;
          gap: 24px;
          margin-top: 18px;
          align-items: start;
        }
        @media(max-width: 980px) {
          .layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card {
          background: #fff;
          border: 1.5px solid var(--line);
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 3px 12px rgba(26, 36, 51, 0.05);
          box-sizing: border-box;
          overflow: hidden;
        }
        .card h2 {
          font-family: 'Fraunces', serif;
          font-size: 21px;
          margin: 0 0 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink);
        }
        .card h2 .num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          color: var(--green-dark);
          background: var(--mint);
          padding: 3px 9px;
          border-radius: 6px;
          font-weight: 700;
        }
        .card .hint {
          font-size: 15.5px;
          color: var(--muted);
          margin: 0 0 16px;
          line-height: 1.4;
        }
        label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--ink);
        }
        .field {
          margin-bottom: 16px;
        }
        .field:last-child {
          margin-bottom: 0;
        }
        input[type=text], select, input[type=number] {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          height: 46px;
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: var(--ink);
          transition: border-color .15s, box-shadow .15s;
        }
        input[type=text]:focus, select:focus, input[type=number]:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(0, 196, 154, 0.15);
        }
        .row2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          margin-bottom: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .row2:last-child {
          margin-bottom: 0;
        }
        .row2 .field {
          margin-bottom: 0;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }
        .row2 select {
          font-size: 13px !important;
          padding: 8px 20px 8px 10px !important;
          height: 44px;
          border-radius: 9px;
          border: 1.5px solid var(--line);
          background: #fff;
          color: var(--ink);
          font-weight: 500;
          width: 100% !important;
          box-sizing: border-box !important;
          transition: border-color .15s, box-shadow .15s;
        }
        .row2 select:hover {
          border-color: #94a3b8;
        }
        .row2 select:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(0, 196, 154, 0.15);
        }
        @media(max-width: 520px) {
          .row2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        .auto-detect-card {
          background: #f8faf9;
          border: 1px solid #e1e7e4;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .chip {
          border: 1.5px solid var(--line);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 15px;
          cursor: pointer;
          background: #fff;
          user-select: none;
          transition: all .15s;
          font-weight: 500;
          color: var(--ink);
        }
        .chip:hover {
          border-color: var(--green-dark);
        }
        .chip.on {
          background: var(--mint);
          border-color: var(--green);
          color: var(--green-dark);
          font-weight: 600;
        }
        .chip.single.on {
          background: var(--green);
          border-color: var(--green);
          color: #fff;
        }
        .chip.goal-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .chip.goal-chip.on.goal-chip-primary {
          background: #ecfdf5;
          border-color: var(--green);
          color: #065f46;
          font-weight: 600;
        }
        .chip.goal-chip.on.goal-chip-secondary {
          background: #f0f9ff;
          border-color: #0284c7;
          color: #075985;
          font-weight: 600;
        }
        .chip.goal-chip.on.goal-chip-tertiary {
          background: #faf5ff;
          border-color: #7c3aed;
          color: #6b21a8;
          font-weight: 600;
        }
        .presence-note {
          font-size: 15.5px;
          color: var(--muted);
          margin-top: 8px;
          margin-bottom: 0;
        }
        .presence-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 6px;
        }
        .presence-item {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          transition: all .15s ease;
        }
        .presence-item:hover {
          border-color: #cbd5e1;
        }
        .presence-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .presence-title {
          font-size: 16.5px;
          font-weight: 700;
          color: var(--ink);
          display: flex;
          align-items: center;
        }
        .presence-sub {
          font-size: 14.5px;
          color: var(--muted);
          margin-top: 3px;
        }
        .yes-no-group {
          display: inline-flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .yn-btn {
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
          border: 1.5px solid var(--line);
          background: #fff;
          color: var(--ink);
          cursor: pointer;
          min-width: 60px;
          text-align: center;
          transition: all .15s ease;
        }
        .yn-btn:hover {
          border-color: #94a3b8;
        }
        .yn-btn.active-yes {
          background: var(--green);
          border-color: var(--green);
          color: #fff;
          box-shadow: 0 2px 6px rgba(0, 196, 154, 0.25);
        }
        .yn-btn.active-no {
          background: #64748b;
          border-color: #64748b;
          color: #fff;
        }
        .improvement-reveal {
          margin-top: 10px;
          padding: 9px 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
        }
        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15.5px;
          font-weight: 600;
          color: #065f46;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-label input[type=checkbox] {
          width: 19px;
          height: 19px;
          accent-color: var(--green);
          cursor: pointer;
        }
        .none-of-these-wrapper {
          padding: 12px 16px;
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 10px;
          margin-top: 6px;
          transition: all .2s;
        }
        .none-of-these-wrapper:hover {
          border-color: var(--green);
        }
        .none-label {
          color: var(--ink);
          font-size: 16px;
        }
        .goal-step-card {
          padding: 16px 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 12px;
          transition: border-color .2s;
        }
        .goal-step-card:hover {
          border-color: #cbd5e1;
        }
        .goal-step-badge {
          display: inline-block;
          font-size: 13.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .goal-step-badge.primary {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .goal-step-badge.secondary {
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        .goal-step-badge.tertiary {
          background: #faf5ff;
          color: #6b21a8;
          border: 1px solid #e9d5ff;
        }
        .goal-step-badge.budget {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .req-stepper {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          margin-bottom: 16px;
          gap: 6px;
          overflow-x: auto;
        }
        .req-step-tab {
          flex: 1;
          min-width: 95px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all .2s ease;
          white-space: nowrap;
        }
        .req-step-tab:hover {
          background: rgba(255, 255, 255, 0.8);
          color: var(--ink);
        }
        .req-step-tab.active {
          background: #fff;
          color: var(--green-dark);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }
        .req-step-tab .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #cbd5e1;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .req-step-tab.active .step-num {
          background: var(--green);
          color: #fff;
        }
        .req-step-tab.completed .step-num {
          background: var(--green);
          color: #fff;
        }
        .req-progress-bar {
          height: 5px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-bottom: 18px;
          overflow: hidden;
        }
        .req-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green), #0284c7);
          transition: width .3s ease;
        }
        .req-step-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .req-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s ease;
          border: 1.5px solid transparent;
        }
        .req-nav-btn.prev {
          background: #f1f5f9;
          color: #475569;
          border-color: #cbd5e1;
        }
        .req-nav-btn.prev:hover {
          background: #e2e8f0;
          color: var(--ink);
        }
        .req-nav-btn.next {
          background: var(--green);
          color: #fff;
          box-shadow: 0 2px 8px rgba(0, 196, 154, 0.25);
        }
        .req-nav-btn.next:hover {
          background: var(--green-dark);
        }
        .req-nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .plans-empty {
          text-align: center;
          padding: 80px 24px;
          color: var(--muted);
        }
        .plans-empty i {
          font-size: 42px;
          color: var(--green);
          opacity: .4;
          margin-bottom: 14px;
          display: block;
        }
        .plans-empty p {
          font-size: 15px;
          margin: 0;
        }
        .client-strip {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .client-line {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          color: var(--ink);
        }
        .client-meta {
          font-size: 15px;
          color: var(--muted);
          margin-top: 4px;
        }
        .budget-note {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13.5px;
          color: var(--orange);
          border: 1px dashed var(--orange);
          border-radius: 20px;
          padding: 5px 12px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media(max-width: 900px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
        .plan-card {
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all .2s ease;
        }

        /* 1. Low Plan - "Look OK OK" (Entry-level, modest, clean) */
        .plan-card.plan-low {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          color: #334155;
        }
        .plan-card.plan-low .plan-tier {
          color: #64748b;
        }
        .plan-card.plan-low .plan-name {
          color: #334155;
        }
        .plan-card.plan-low .plan-tagline {
          color: #64748b;
        }
        .plan-card.plan-low .plan-price .amt {
          color: #475569;
        }
        .plan-card.plan-low .plan-price .per {
          color: #94a3b8;
        }
        .plan-card.plan-low .plan-setup {
          color: #94a3b8;
        }
        .plan-card.plan-low .plan-services {
          border-top: 1px dashed #cbd5e1;
        }
        .plan-card.plan-low .plan-services li {
          border-bottom: 1px solid #f1f5f9;
        }
        .plan-card.plan-low .plan-services .sv-name {
          color: #334155;
          font-weight: 600;
        }
        .plan-card.plan-low .plan-services .sv-scope {
          color: #94a3b8;
        }
        .plan-card.plan-low .plan-services .sv-price {
          color: #475569;
        }
        .plan-card.plan-low .plan-why {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        /* 2. Medium Plan - "Standard Look" (Highlighted, Brand Emerald, Most Popular) */
        .plan-card.plan-medium {
          background: #ffffff;
          border: 2px solid #0BBF6A;
          box-shadow: 0 6px 20px -3px rgba(11, 191, 106, 0.15), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
          color: var(--ink);
        }
        .plan-card.plan-medium .plan-tier {
          color: #059669;
          font-weight: 700;
        }
        .plan-card.plan-medium .plan-name {
          color: #0f172a;
        }
        .plan-card.plan-medium .plan-tagline {
          color: #475569;
        }
        .plan-card.plan-medium .plan-price .amt {
          color: #047857;
        }
        .plan-card.plan-medium .plan-price .per {
          color: #64748b;
        }
        .plan-card.plan-medium .plan-setup {
          color: #64748b;
        }
        .plan-card.plan-medium .plan-services {
          border-top: 1px dashed rgba(11, 191, 106, 0.4);
        }
        .plan-card.plan-medium .plan-services li {
          border-bottom: 1px solid #f1f5f0;
        }
        .plan-card.plan-medium .plan-services .sv-name {
          color: #0f172a;
          font-weight: 600;
        }
        .plan-card.plan-medium .plan-services .sv-scope {
          color: #64748b;
        }
        .plan-card.plan-medium .plan-services .sv-price {
          color: #047857;
          font-weight: 600;
        }
        .plan-card.plan-medium .plan-why {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        /* 3. High Plan - "Make it look Premium" (Executive Dark Midnight Navy, Electric Glow, Crown Badge) */
        .plan-card.plan-high {
          background: linear-gradient(160deg, #0b1329 0%, #111d38 55%, #0d1527 100%);
          border: 2px solid #38bdf8;
          box-shadow: 0 12px 36px -4px rgba(11, 19, 41, 0.42), 0 0 24px rgba(56, 189, 248, 0.22);
          color: #f8fafc;
        }
        .plan-card.plan-high .plan-tier {
          color: #38bdf8;
          font-weight: 700;
          letter-spacing: .1em;
        }
        .plan-card.plan-high .plan-name {
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }
        .plan-card.plan-high .plan-tagline {
          color: #94a3b8;
        }
        .plan-card.plan-high .plan-price .amt {
          color: #38bdf8;
          text-shadow: 0 2px 10px rgba(56, 189, 248, 0.25);
        }
        .plan-card.plan-high .plan-price .per {
          color: #94a3b8;
        }
        .plan-card.plan-high .plan-setup {
          color: #cbd5e1;
        }
        .plan-card.plan-high .plan-services {
          border-top: 1px dashed rgba(255, 255, 255, 0.2);
        }
        .plan-card.plan-high .plan-services li {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .plan-card.plan-high .plan-services .sv-name {
          color: #ffffff;
          font-weight: 600;
        }
        .plan-card.plan-high .plan-services .sv-scope {
          color: #94a3b8;
        }
        .plan-card.plan-high .plan-services .sv-price {
          color: #38bdf8;
          font-weight: 600;
        }
        .plan-card.plan-high .plan-why {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
        }
        .plan-card.plan-high:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 44px -4px rgba(11, 19, 41, 0.5), 0 0 30px rgba(56, 189, 248, 0.3);
        }
        .plan-card.budget-match {
          border-color: var(--orange) !important;
        }
        .plan-badge {
          position: absolute;
          top: -12px;
          left: 18px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .05em;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
        }
        .plan-badge.popular-badge {
          background: #0BBF6A;
          color: #fff;
          box-shadow: 0 2px 8px rgba(11, 191, 106, 0.3);
        }
        .plan-badge.budget-badge {
          background: var(--orange);
          color: #fff;
        }
        .plan-badge.premium-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .plan-tier {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted);
          margin-bottom: 4px;
        }
        .plan-name {
          font-family: 'Fraunces', serif;
          font-size: 23px;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--ink);
        }
        .plan-tagline {
          font-size: 14.5px;
          color: var(--muted);
          margin-bottom: 16px;
          min-height: 42px;
          line-height: 1.45;
        }
        .plan-price {
          margin-bottom: 6px;
        }
        .plan-price .amt {
          font-family: 'Fraunces', serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--green-dark);
        }
        .plan-price .per {
          font-size: 14px;
          color: var(--muted);
        }
        .plan-setup {
          font-size: 13.5px;
          color: var(--muted);
          margin-bottom: 16px;
        }
        .plan-services {
          list-style: none;
          margin: 0 0 16px;
          padding: 0;
          border-top: 1px dashed var(--line);
          padding-top: 14px;
          flex-grow: 1;
        }
        .plan-services li {
          padding: 9px 0;
          border-bottom: 1px solid #f1f3f0;
          font-size: 14.5px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .plan-services li:last-child {
          border-bottom: none;
        }
        .plan-services .sv-name {
          font-weight: 600;
          color: var(--ink);
          font-size: 15px;
        }
        .plan-services .sv-scope {
          font-size: 13px;
          color: var(--muted);
          font-weight: 400;
          margin-top: 2px;
        }
        .plan-services .sv-price {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          white-space: nowrap;
          color: var(--ink);
        }
        .plan-why {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--muted);
          background: var(--paper);
          border-left: 3px solid var(--orange);
          padding: 10px 14px;
          border-radius: 6px;
        }
        .actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .btn {
          border: none;
          border-radius: 9px;
          padding: 13px 22px;
          font-size: 15.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          transition: transform .1s, opacity .15s;
        }
        .btn:active {
          transform: scale(.98);
        }
        .btn-primary {
          background: var(--green);
          color: #fff;
        }
        .btn-primary:hover {
          background: var(--green-dark);
        }
        .btn-secondary {
          background: #fff;
          color: var(--green-dark);
          border: 1.5px solid var(--green);
        }
        .btn-secondary:hover {
          background: var(--mint);
        }
        .copied-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--green-dark);
          color: #fff;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          opacity: 0;
          pointer-events: none;
          transition: opacity .25s, transform .25s;
          z-index: 99;
        }
        .copied-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(-6px);
        }
        ::selection {
          background: var(--mint);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-mini {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      ` }} />

      <header className="top">
        <div className="wrap">
          <div className="brand">
            <img src="/logo.png" alt="StartupFlora" className="brand-logo" />
            <span className="brand-name">StartupFlora</span>
            <span className="sales-pill">
              <span className="sales-dot" />
              Sales
            </span>
          </div>
          <div className="header-actions">
            <div className="tool-tag">
              <i className="ti ti-sparkles" />
              <span>Digital Marketing Quotation Tool</span>
            </div>
            <Link href="/admin" className="admin-btn">
              <i className="ti ti-shield-lock" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="layout">
          {/* LEFT: FORM */}
          <div className="form-column">
            {/* Section 01: Client Details (Step 1 of 3) */}
            {formStep === 1 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h2 style={{ margin: 0 }}><span className="num">01</span> Client details</h2>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-dark)', background: '#ecfdf5', padding: '3px 10px', borderRadius: '12px' }}>
                    Step 1 of 3
                  </span>
                </div>
                <p className="hint" style={{ marginBottom: '16px' }}>Just the basics — takes 20 seconds.</p>

                {/* Render questions assigned to Page 1 with Q4 and Q5 parallel in one line */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Q1, Q2, Q3 or any questions before Q4 */}
                  {page1Questions
                    .filter(q => q.id !== 4 && q.id !== 5 && (q.displayOrder ?? q.id) < 4)
                    .map((q) => renderQuestion(q))}

                  {/* Parallel Row for Industry (Q4) and Business Age (Q5) */}
                  <div className="row2">
                    {page1Questions.find(q => q.id === 4)
                      ? renderQuestion(page1Questions.find(q => q.id === 4)!)
                      : (questions.find(q => q.id === 4) && renderQuestion(questions.find(q => q.id === 4)!))}
                    {page1Questions.find(q => q.id === 5)
                      ? renderQuestion(page1Questions.find(q => q.id === 5)!)
                      : (questions.find(q => q.id === 5) && renderQuestion(questions.find(q => q.id === 5)!))}
                  </div>

                  {/* Q6 Salesperson and any other questions on Page 1 */}
                  {page1Questions
                    .filter(q => q.id !== 4 && q.id !== 5 && (q.displayOrder ?? q.id) >= 4)
                    .map((q) => renderQuestion(q))}
                </div>

                {/* Step 1 Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {!isPage1Valid ? (
                      <span style={{ color: 'var(--red)' }}>* Complete required fields to proceed</span>
                    ) : (
                      <span style={{ color: 'var(--green-dark)', fontWeight: 600 }}>✓ Step 1 details complete</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    disabled={!isPage1Valid}
                    className="btn"
                    style={{
                      background: !isPage1Valid ? '#94a3b8' : 'var(--green)',
                      color: '#fff',
                      padding: '10px 22px',
                      borderRadius: '9px',
                      fontSize: '15.5px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: !isPage1Valid ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: isPage1Valid ? '0 2px 8px rgba(0, 196, 154, 0.25)' : 'none'
                    }}
                  >
                    <span>Next</span>
                    <i className="ti ti-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Section 02: Current Digital Presence (Step 2 of 3) */}
            {formStep === 2 && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h2 style={{ margin: 0 }}><span className="num">02</span> Current digital presence</h2>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-dark)', background: '#ecfdf5', padding: '3px 10px', borderRadius: '12px' }}>
                    Step 2 of 3
                  </span>
                </div>

                <p className="hint" style={{ marginBottom: '16px' }}>Apke Pass Avi kya sab hai.</p>

                {/* Render questions assigned to Page 2 in displayOrder */}
                <div className="presence-checklist">
                  {page2Questions.map((q) => renderQuestion(q))}
                </div>

                {/* Step 2 Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="btn"
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '10px 18px',
                      borderRadius: '9px',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: '1.5px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    <i className="ti ti-arrow-left"></i>
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStep(3)}
                    disabled={!isPage2Valid}
                    className="btn"
                    style={{
                      background: !isPage2Valid ? '#94a3b8' : 'var(--green)',
                      color: '#fff',
                      padding: '10px 22px',
                      borderRadius: '9px',
                      fontSize: '15.5px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: !isPage2Valid ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: isPage2Valid ? '0 2px 8px rgba(0, 196, 154, 0.25)' : 'none'
                    }}
                  >
                    <span>Next</span>
                    <i className="ti ti-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Section 03: Requirements & Goals (Step 3 of 3 - Paginated Sub-steps) */}
            {formStep === 3 && (() => {
              const qPrimary = page3Questions.find(q => q.id === 11) || questions.find(q => q.id === 11);
              const qSecondary = page3Questions.find(q => q.id === 12) || questions.find(q => q.id === 12);
              const qTertiary = page3Questions.find(q => q.id === 13) || questions.find(q => q.id === 13);
              const qBudget = page3Questions.find(q => q.id === 14) || questions.find(q => q.id === 14);
              const extraPage3 = page3Questions.filter(q => ![11, 12, 13, 14].includes(q.id));

              const goalOptMap: Record<string, string> = {
                'Brand Awareness': 'awareness',
                'Lead Generation': 'leads',
                'Sales & Conversions': 'sales',
                'Social Media Growth': 'social',
                'Website Traffic': 'traffic'
              };

              const primaryOpts = Array.isArray(qPrimary?.options) && qPrimary.options.length > 0
                ? qPrimary.options
                : ['Brand Awareness', 'Lead Generation', 'Sales & Conversions', 'Social Media Growth', 'Website Traffic'];

              const secondaryOpts = Array.isArray(qSecondary?.options) && qSecondary.options.length > 0
                ? qSecondary.options.filter((o: string) => o.toLowerCase() !== 'none')
                : ['Brand Awareness', 'Lead Generation', 'Sales & Conversions', 'Social Media Growth', 'Website Traffic'];

              const tertiaryOpts = Array.isArray(qTertiary?.options) && qTertiary.options.length > 0
                ? qTertiary.options.filter((o: string) => o.toLowerCase() !== 'none')
                : ['Brand Awareness', 'Lead Generation', 'Sales & Conversions', 'Social Media Growth', 'Website Traffic'];

              const budgetOpts = Array.isArray(qBudget?.options) && qBudget.options.length > 0
                ? qBudget.options
                : ['No specific budget', '₹15,000 – 25,000', '₹25,000 – 50,000', '₹50,000 – 1,00,000', '₹1,00,000+'];

              return (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0 }}><span className="num">03</span> Requirements & Goals</h2>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '3px 10px', borderRadius: '12px' }}>
                      Step 3 of 3 · Goal {requirementStep} of 4
                    </span>
                  </div>
                  <p className="hint" style={{ marginBottom: '16px' }}>Configure marketing objectives step-by-step.</p>

                  {/* Render any custom/extra Page 3 questions */}
                  {extraPage3.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                      {extraPage3.map(q => renderQuestion(q))}
                    </div>
                  )}

                  {/* Sub-step 1: Primary Goal */}
                  {requirementStep === 1 && (
                    <div className="goal-step-card" style={{ marginBottom: 0 }}>
                      <div className="goal-step-badge primary">Step 3.1 · Primary Focus</div>
                      <label style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                        {qPrimary ? qPrimary.question : "Primary Goal (Highest Priority)"} <span style={{ color: 'var(--red)' }}>*</span>
                      </label>
                      {qPrimary?.description && (
                        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '3px 0 10px 0', lineHeight: 1.35 }}>
                          {qPrimary.description}
                        </p>
                      )}
                      <div className="chip-group">
                        {primaryOpts.map((optName: string) => {
                          const optKey = goalOptMap[optName] || optName.toLowerCase().replace(/[^a-z0-9]/g, '');
                          return (
                            <button
                              key={optName}
                              type="button"
                              onClick={() => {
                                setGoal(optKey);
                                if (secondaryGoal === optKey) setSecondaryGoal('none');
                                if (tertiaryGoal === optKey) setTertiaryGoal('none');
                                setIsAnalyzed(false);
                              }}
                              className={`chip single ${goal === optKey ? 'on single' : ''}`}
                            >
                              {goal === optKey && <i className="ti ti-check" style={{ marginRight: '5px' }}></i>}
                              {optName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="req-step-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          onClick={() => setFormStep(2)}
                          className="req-nav-btn prev"
                          style={{ padding: '9px 18px', fontSize: '14.5px' }}
                        >
                          <i className="ti ti-arrow-left"></i>
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(2)}
                          disabled={!goal}
                          className="req-nav-btn next"
                          style={{ padding: '9px 20px', fontSize: '14.5px' }}
                        >
                          <span>Next</span>
                          <i className="ti ti-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-step 2: Secondary Goal */}
                  {requirementStep === 2 && (
                    <div className="goal-step-card" style={{ marginBottom: 0 }}>
                      <div className="goal-step-badge secondary">Step 3.2 · Secondary Objective</div>
                      <label style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                        {qSecondary ? qSecondary.question : "Secondary Goal"} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '13.5px' }}>(Optional)</span>
                      </label>
                      {qSecondary?.description && (
                        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '3px 0 10px 0', lineHeight: 1.35 }}>
                          {qSecondary.description}
                        </p>
                      )}
                      <div className="chip-group">
                        <button
                          type="button"
                          onClick={() => {
                            setSecondaryGoal('none');
                            setIsAnalyzed(false);
                          }}
                          className={`chip single ${secondaryGoal === 'none' ? 'on single' : ''}`}
                        >
                          None
                        </button>
                        {secondaryOpts.map((optName: string) => {
                          const optKey = goalOptMap[optName] || optName.toLowerCase().replace(/[^a-z0-9]/g, '');
                          return (
                            <button
                              key={optName}
                              type="button"
                              onClick={() => {
                                setSecondaryGoal(optKey);
                                if (goal === optKey) setGoal('');
                                if (tertiaryGoal === optKey) setTertiaryGoal('none');
                                setIsAnalyzed(false);
                              }}
                              className={`chip ${secondaryGoal === optKey ? 'on' : ''}`}
                              style={secondaryGoal === optKey ? { background: '#f0f9ff', borderColor: '#0284c7', color: '#075985', fontWeight: 600 } : {}}
                            >
                              {secondaryGoal === optKey && <i className="ti ti-check" style={{ marginRight: '5px' }}></i>}
                              {optName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="req-step-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(1)}
                          className="req-nav-btn prev"
                          style={{ padding: '9px 18px', fontSize: '14.5px' }}
                        >
                          <i className="ti ti-arrow-left"></i>
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(3)}
                          className="req-nav-btn next"
                          style={{ padding: '9px 20px', fontSize: '14.5px' }}
                        >
                          <span>Next</span>
                          <i className="ti ti-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-step 3: Tertiary Goal */}
                  {requirementStep === 3 && (
                    <div className="goal-step-card" style={{ marginBottom: 0 }}>
                      <div className="goal-step-badge tertiary">Step 3.3 · Additional Scope</div>
                      <label style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                        {qTertiary ? qTertiary.question : "Tertiary Goal"} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '13.5px' }}>(Optional)</span>
                      </label>
                      {qTertiary?.description && (
                        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '3px 0 10px 0', lineHeight: 1.35 }}>
                          {qTertiary.description}
                        </p>
                      )}
                      <div className="chip-group">
                        <button
                          type="button"
                          onClick={() => {
                            setTertiaryGoal('none');
                            setIsAnalyzed(false);
                          }}
                          className={`chip single ${tertiaryGoal === 'none' ? 'on single' : ''}`}
                        >
                          None
                        </button>
                        {tertiaryOpts.map((optName: string) => {
                          const optKey = goalOptMap[optName] || optName.toLowerCase().replace(/[^a-z0-9]/g, '');
                          return (
                            <button
                              key={optName}
                              type="button"
                              onClick={() => {
                                setTertiaryGoal(optKey);
                                if (secondaryGoal === optKey) setSecondaryGoal('none');
                                if (tertiaryGoal === optKey) setTertiaryGoal('none');
                                setIsAnalyzed(false);
                              }}
                              className={`chip ${tertiaryGoal === optKey ? 'on' : ''}`}
                              style={tertiaryGoal === optKey ? { background: '#faf5ff', borderColor: '#7c3aed', color: '#6b21a8', fontWeight: 600 } : {}}
                            >
                              {tertiaryGoal === optKey && <i className="ti ti-check" style={{ marginRight: '5px' }}></i>}
                              {optName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="req-step-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(2)}
                          className="req-nav-btn prev"
                          style={{ padding: '9px 18px', fontSize: '14.5px' }}
                        >
                          <i className="ti ti-arrow-left"></i>
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(4)}
                          className="req-nav-btn next"
                          style={{ padding: '9px 20px', fontSize: '14.5px' }}
                        >
                          <span>Next</span>
                          <i className="ti ti-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-step 4: Client Monthly Budget (Final Step) + ANALYZE BUTTON */}
                  {requirementStep === 4 && (
                    <div className="goal-step-card" style={{ marginBottom: 0 }}>
                      <div className="goal-step-badge budget">Step 3.4 · Final Step · Project Budget</div>
                      <label style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                        {qBudget ? qBudget.question : "Client's Monthly Budget"} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '13.5px' }}>(optional — for reference)</span>
                      </label>
                      {qBudget?.description && (
                        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '3px 0 10px 0', lineHeight: 1.35 }}>
                          {qBudget.description}
                        </p>
                      )}
                      <select
                        value={statedBudget}
                        onChange={(e) => {
                          setStatedBudget(parseInt(e.target.value) || 0);
                          setIsAnalyzed(false);
                        }}
                      >
                        {budgetOpts.map((optName: string, idx: number) => {
                          const budgetVals = [0, 15000, 25000, 50000, 100000];
                          const val = budgetVals[idx] !== undefined ? budgetVals[idx] : parseInt(optName.replace(/[^0-9]/g, '')) || 0;
                          return (
                            <option key={idx} value={val}>
                              {optName}
                            </option>
                          );
                        })}
                      </select>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          onClick={() => setRequirementStep(3)}
                          className="btn"
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '12px 18px',
                            borderRadius: '9px',
                            fontSize: '15px',
                            fontWeight: 600,
                            border: '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <i className="ti ti-arrow-left"></i>
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          disabled={!isFormValid || isAnalyzing}
                          onClick={handleAnalyzeNow}
                          className="btn"
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            padding: '13px 24px',
                            fontSize: '16.5px',
                            fontWeight: 700,
                            borderRadius: '9px',
                            cursor: isFormValid ? 'pointer' : 'not-allowed',
                            opacity: isFormValid ? 1 : 0.55,
                            background: isFormValid ? 'var(--green)' : '#94a3b8',
                            color: '#fff',
                            border: 'none',
                            boxShadow: isFormValid ? '0 3px 12px rgba(0, 196, 154, 0.3)' : 'none',
                            transition: 'all 0.2s ease',
                            gap: '8px'
                          }}
                        >
                          {isAnalyzing ? (
                            <>
                              <span className="spinner-mini" style={{ marginRight: '6px' }}></span>
                              Generating Quotation...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-sparkles" style={{ fontSize: '18px' }}></i>
                              Analyze Now
                            </>
                          )}
                        </button>
                      </div>
                      {!isFormValid && (
                        <p style={{ fontSize: '13px', color: 'var(--red)', textAlign: 'center', marginTop: '10px', marginBottom: 0, fontWeight: 500 }}>
                          * Please complete required client details and select a Primary Goal to enable analysis
                        </p>
                      )}
                    </div>
                  )}

                  {/* Persistent Live Goals & Budget Summary Strip */}
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13.5px',
                      marginTop: '16px'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--ink)', marginRight: '2px' }}>
                      Requirements:
                    </span>

                    {/* Primary Slot */}
                    <div
                      onClick={() => setRequirementStep(1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '3px 8px',
                        borderRadius: '7px',
                        color: '#065f46',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Click to jump to Primary Goal (Step 3.1)"
                    >
                      <span style={{
                        background: 'var(--green)',
                        color: '#fff',
                        fontSize: '10.5px',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>1st Primary</span>
                      <span>{goal ? goalLabels[goal] || goal : 'None'}</span>
                    </div>

                    {/* Secondary Slot */}
                    {secondaryGoal !== 'none' ? (
                      <div
                        onClick={() => setRequirementStep(2)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '3px 8px',
                          borderRadius: '7px',
                          color: '#075985',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Click to jump to Secondary Goal (Step 3.2)"
                      >
                        <span style={{
                          background: '#0284c7',
                          color: '#fff',
                          fontSize: '10.5px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>2nd Secondary</span>
                        <span>{goalLabels[secondaryGoal] || secondaryGoal}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSecondaryGoal('none');
                            setIsAnalyzed(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#075985',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '12px',
                            lineHeight: 1,
                            fontWeight: 700
                          }}
                          title="Remove Secondary Goal"
                        >✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => setRequirementStep(2)}
                        style={{ color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to configure Secondary Goal"
                      >
                        + Secondary
                      </span>
                    )}

                    {/* Tertiary Slot */}
                    {tertiaryGoal !== 'none' ? (
                      <div
                        onClick={() => setRequirementStep(3)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#faf5ff',
                          border: '1px solid #e9d5ff',
                          padding: '3px 8px',
                          borderRadius: '7px',
                          color: '#6b21a8',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Click to jump to Tertiary Goal (Step 3.3)"
                      >
                        <span style={{
                          background: '#7c3aed',
                          color: '#fff',
                          fontSize: '10.5px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>3rd Tertiary</span>
                        <span>{goalLabels[tertiaryGoal] || tertiaryGoal}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTertiaryGoal('none');
                            setIsAnalyzed(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b21a8',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '12px',
                            lineHeight: 1,
                            fontWeight: 700
                          }}
                          title="Remove Tertiary Goal"
                        >✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => setRequirementStep(3)}
                        style={{ color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to configure Tertiary Goal"
                      >
                        + Tertiary
                      </span>
                    )}

                    {/* Budget summary */}
                    {statedBudget > 0 && (
                      <div
                        onClick={() => setRequirementStep(4)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          padding: '3px 8px',
                          borderRadius: '7px',
                          color: '#92400e',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Click to jump to Budget (Step 3.4)"
                      >
                        <span style={{
                          background: '#d97706',
                          color: '#fff',
                          fontSize: '10.5px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>Budget</span>
                        <span>{fmt(statedBudget)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* RIGHT: PLANS */}
          <div>
            <div className="card" style={{ minHeight: '520px' }}>
              {showEmpty ? (
                <div className="plans-empty" style={{ padding: '80px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--mint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--green-dark)',
                    fontSize: '28px'
                  }}>
                    <i className="ti ti-chart-arrows"></i>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)' }}>
                    Ready to Generate Customized Quotation
                  </h3>
                  <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
                    Fill in the client details on the left and click <strong>"Analyze Now"</strong> to build 3 customized packages (Low, Medium, High).
                  </p>
                </div>
              ) : (
                <div>
                  <div className="client-strip">
                    <div>
                      <div className="client-line">{clientName}</div>
                      <div className="client-meta">
                        {[
                          clientCity,
                          industryLabels[industry],
                          stageLabels[stage],
                          [
                            goalLabels[goal],
                            secondaryGoal !== 'none' && goalLabels[secondaryGoal],
                            tertiaryGoal !== 'none' && goalLabels[tertiaryGoal]
                          ].filter(Boolean).join(' + ')
                        ].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    {closestKey && (
                      <div className="budget-note">
                        <i className="ti ti-target-arrow"></i>
                        Closest to stated budget: {closestKey.charAt(0).toUpperCase() + closestKey.slice(1)}
                      </div>
                    )}
                  </div>

                  <div className="plans-grid">
                    {[
                      { key: 'low' as const, label: 'Low', name: 'Starter', tagline: plans.low.tagline, planObj: plans.low },
                      { key: 'medium' as const, label: 'Medium', name: 'Growth', tagline: plans.medium.tagline, planObj: plans.medium },
                      { key: 'high' as const, label: 'High', name: 'Accelerator', tagline: plans.high.tagline, planObj: plans.high }
                    ].map((item) => {
                      const p = item.planObj;
                      const isPopular = item.key === 'medium';
                      const isBudget = item.key === closestKey && item.key !== 'medium';
                      const planReasonLine = plans.reasons[0]
                        ? plans.reasons[0].charAt(0).toUpperCase() + plans.reasons[0].slice(1)
                        : `Matched to a ${stageLabels[stage].toLowerCase()} ${industryLabels[industry].toLowerCase()} business`;

                      return (
                        <div
                          key={item.key}
                          className={`plan-card plan-${item.key} ${isPopular ? 'popular' : ''} ${isBudget ? 'budget-match' : ''}`}
                        >
                          {isPopular && <div className="plan-badge popular-badge">Most Popular</div>}
                          {isBudget && <div className="plan-badge budget-badge">Matches Budget</div>}
                          {!isPopular && !isBudget && item.key === 'high' && (
                            <div className="plan-badge premium-badge">
                              <i className="ti ti-crown" style={{ fontSize: '13px' }}></i> Premium
                            </div>
                          )}

                          <div className="plan-tier">{item.label} Plan</div>
                          <div className="plan-name">{item.name}</div>
                          <div className="plan-tagline">{item.tagline}</div>
                          <div className="plan-price">
                            <span className="amt">{fmt(p.monthly)}</span>
                            <span className="per">/month</span>
                          </div>
                          <div className="plan-setup">
                            {p.onetime > 0 ? `+ ${fmt(p.onetime)} one-time setup` : 'No setup fee'}
                          </div>

                          <ul className="plan-services">
                            {p.items.map((it: any, index: number) => (
                              <li key={index}>
                                <div>
                                  <div className="sv-name">{it.name}</div>
                                  <div className="sv-scope">
                                    {it.type === 'monthly' ? it.scope : 'One-time setup'}
                                  </div>
                                </div>
                                <span className="sv-price">
                                  {fmt(it.price)}{it.type === 'monthly' ? '/mo' : ''}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="plan-why">
                            {planReasonLine}.
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="actions">
                    <button className="btn btn-primary" onClick={handleCopyAsText}>
                      <i className="ti ti-copy"></i> Copy all 3 plans as text
                    </button>
                    <button className="btn btn-secondary" onClick={handleDownloadPDF}>
                      <i className="ti ti-download"></i> Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copied Toast Banner */}
      <div className={`copied-toast ${copiedShow ? 'show' : ''}`}>
        Copied quotation to clipboard!
      </div>
    </div>
  );
}
