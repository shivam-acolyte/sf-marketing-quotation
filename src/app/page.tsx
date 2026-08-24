'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

// Constant labels for drop-downs and selections
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
  sales: "Sales / Conversions",
  social: "Social Media Growth",
  traffic: "Website Traffic"
};

const stageLabels: Record<string, string> = {
  new: "New / Startup",
  growing: "Growing",
  established: "Established"
};



const allServiceKeys = ['gmb', 'web', 'wa', 'smm', 'content', 'seo', 'ads', 'infl'];

const INDUSTRY_RELEVANCE: Record<string, Record<string, number>> = {
  ecommerce:     {smm:8, ads:9, seo:8, web:8, content:6, wa:7, infl:6, gmb:5},
  d2c:           {smm:9, ads:8, seo:6, web:7, content:8, wa:6, infl:9, gmb:3},
  services:      {smm:5, ads:6, seo:8, web:8, content:6, wa:7, infl:2, gmb:9},
  manufacturing: {smm:3, ads:4, seo:7, web:8, content:5, wa:6, infl:1, gmb:6},
  fnb:           {smm:9, ads:6, seo:4, web:5, content:7, wa:6, infl:7, gmb:9},
  healthcare:    {smm:4, ads:5, seo:8, web:8, content:6, wa:7, infl:2, gmb:9},
  education:     {smm:6, ads:6, seo:7, web:7, content:8, wa:7, infl:3, gmb:5},
  realestate:    {smm:6, ads:7, seo:7, web:8, content:5, wa:8, infl:3, gmb:9},
  other:         {smm:5, ads:5, seo:5, web:5, content:5, wa:5, infl:5, gmb:5},
};

const GOAL_BOOST: Record<string, Record<string, number>> = {
  awareness: {smm:3, content:3, infl:2},
  leads:     {ads:3, wa:3, seo:1},
  sales:     {ads:3, seo:2, web:1},
  social:    {smm:3, infl:3},
  traffic:   {seo:3, content:2, ads:1},
};

const STAGE_BOOST: Record<string, Record<string, number>> = {
  new:         {content:2, web:2, gmb:1},
  growing:     {ads:1, seo:1},
  established: {ads:2, seo:1},
};

const getDynamicServiceScope = (serviceKey: string, goal: string, tier: 'low' | 'medium' | 'high'): string => {
  const tierLabel = tier === 'low' ? 'Starter' : tier === 'medium' ? 'Standard' : 'Premium';
  
  if (serviceKey === 'smm') {
    if (goal === 'awareness') return `${tierLabel}: Organic brand aesthetics cleanup, page optimization, and initial awareness posts.`;
    if (goal === 'social') return `${tierLabel}: Custom video reels design, daily stories posting, and audience interaction campaigns.`;
    return `${tierLabel}: Dynamic graphic templates layout posts, industry update posts, and basic profile curation.`;
  }
  if (serviceKey === 'ads') {
    if (goal === 'leads') return `${tierLabel}: B2C/B2B Meta lead capture form configurations, targeted search ads, and conversion optimization.`;
    if (goal === 'sales') return `${tierLabel}: Dynamic product catalogue setup, shopping campaigns integration, and basket retargeting loops.`;
    return `${tierLabel}: Audience interest keyword setups, localized search banners creation, and basic CTR metrics dashboard.`;
  }
  if (serviceKey === 'seo') {
    if (goal === 'traffic') return `${tierLabel}: Google indexing audit, fast mobile web speed repairs, and local maps citations listing.`;
    return `${tierLabel}: Primary industry search keywords insertion, core technical meta titles cleanup, and setup Google Analytics.`;
  }
  if (serviceKey === 'web') {
    if (goal === 'sales') return `${tierLabel}: E-commerce store template installation, secure payment gateway integrations, and check-out testing.`;
    if (goal === 'leads') return `${tierLabel}: Professional single-page lead capture forms design, contact responders sync, and CTA overlays.`;
    return `${tierLabel}: Premium fast-loading multi-page responsive design layout, custom styled visual graphics asset placement.`;
  }
  if (serviceKey === 'content') {
    if (goal === 'awareness') return `${tierLabel}: Custom brand marketing caption presets, visual theme assets guidelines, and layout scripts.`;
    if (goal === 'traffic') return `${tierLabel}: B2B keyword-enriched blogs writing (2 posts), technical guides mapping, and SEO updates.`;
    return `${tierLabel}: Custom promotional banners layout copy, visual flyer design, and initial email marketing newsletters.`;
  }
  if (serviceKey === 'wa') {
    return `${tierLabel}: WhatsApp Business app configuration, contact forms instant auto-responder rules, and templates layout.`;
  }
  if (serviceKey === 'gmb') {
    return `${tierLabel}: Business maps directory registration, local maps reviews flyer QR setup, and localized map details audit.`;
  }
  if (serviceKey === 'logo') {
    return `${tierLabel}: Startup logo visual assets drafting, high-res print vectors exporting, and brand colors guideline sheet.`;
  }
  if (serviceKey === 'domain') {
    return `${tierLabel}: Domain lock protection audits, SSL certificate mapping, and DNS cloud cache integrations setup.`;
  }
  if (serviceKey === 'infl') {
    return `${tierLabel}: Micro-influencers list sourcing and campaign briefing layout templates.`;
  }
  return `${tierLabel} service package deliverables scope.`;
};

const getDynamicServiceName = (serviceKey: string, industry: string): string => {
  if (serviceKey === 'smm') {
    if (industry === 'ecommerce' || industry === 'd2c') return "E-commerce Instagram/Facebook Reels & UGC Validation";
    if (industry === 'realestate') return "Property Virtual Tour Video Editing & Instagram Reels";
    if (industry === 'fnb') return "Food & Beverage Instagram Reels & Diners Stories Posting";
    return "Social Media Curation & Brand Profile Management";
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
  if (serviceKey === 'domain') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Store Check-out Security, SSL lock & payment safety auditing";
    return "Domain Protection, WHOIS privacy & Cloudflare integration";
  }
  if (serviceKey === 'wa') {
    if (industry === 'realestate' || industry === 'services') return "WhatsApp Auto-reply Lead Scheduling & API green tick setup";
    return "WhatsApp Marketing Broadcast setup & Auto-responder rules";
  }
  if (serviceKey === 'infl') {
    if (industry === 'ecommerce' || industry === 'd2c') return "Direct D2C Brand Influencer UGC deals sourcing";
    if (industry === 'fnb') return "Local Food Bloggers review campaign invitations setup";
    return "Micro-Influencer Outreach campaigns listing";
  }
  
  const defaults: Record<string, string> = {
    smm: "Social Media Management",
    ads: "Paid Ads Management (Meta / Google)",
    seo: "SEO Optimization",
    web: "Website Development",
    content: "Content Creation & Marketing",
    wa: "WhatsApp Marketing & Green Tick",
    infl: "Influencer Marketing",
    gmb: "Google Business Profile Optimization",
    logo: "Logo Design",
    domain: "Domain Security & Protection"
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
  const [presence, setPresence] = useState<string[]>([]);
  const [statedBudget, setStatedBudget] = useState(0);

  // AI Category Auto-Detect State
  const [businessDescription, setBusinessDescription] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState('');

  // Admin Config State
  const [adminOpen, setAdminOpen] = useState(false);
  const [basePrices, setBasePrices] = useState({
    smm: 20000,   // Social Media Management – Basic (1 Month)
    ads: 30000,   // Paid Ads Management – Silver (Basic Package)
    seo: 30000,   // SEO – 2 Months
    web: 20000,   // Website – Basic (5-Page)
    content: 8000,
    wa: 5000,
    infl: 10000,
    gmb: 4000,
    logo: 5000,   // Logo Design – Standard
    domain: 25000, // Domain Security & Protection
  });

  const [multipliers, setMultipliers] = useState({
    low: 0.85,
    medium: 1.0,
    high: 1.25,
  });

  // UI state
  const [copiedShow, setCopiedShow] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);

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

  // Save updated base prices to database
  const handleSaveBasePrices = async () => {
    setSavingPrices(true);
    try {
      const res = await fetch('/api/quick-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrices }),
      });
      if (res.ok) {
        alert('Base prices successfully saved in PostgreSQL database!');
      } else {
        alert('Failed to save prices in the database.');
      }
    } catch (error) {
      console.error('Error saving prices:', error);
      alert('Network error saving prices.');
    } finally {
      setSavingPrices(false);
    }
  };

  // Helper formatting currency
  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString('en-IN');

  // Multi-checkbox toggling
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

  // Profile-driven scoring model
  const getScoredServices = () => {
    const hasWebsite = presence.includes('website');
    const hasSocial = presence.includes('social');
    const hasGMB = presence.includes('gmb');
    const startingFromZero = presence.includes('none') || presence.length === 0;

    const presenceAdj: Record<string, number> = {};
    const bump = (k: string, v: number) => { 
      presenceAdj[k] = (presenceAdj[k] || 0) + v; 
    };
    if (!hasWebsite) bump('web', 3); else bump('web', -2);
    if (!hasSocial) bump('smm', 2); else bump('smm', -1);
    if (!hasGMB) bump('gmb', 3); else bump('gmb', -2);
    if (startingFromZero) { bump('web', 1); bump('gmb', 1); bump('smm', 1); }

    const goalBoost = GOAL_BOOST[goal] || {};
    const stageBoost = STAGE_BOOST[stage] || {};
    const industryScore = INDUSTRY_RELEVANCE[industry] || INDUSTRY_RELEVANCE.other;

    const scores: Record<string, number> = {};
    allServiceKeys.forEach(k => {
      const modifiers = (goalBoost[k] || 0) + (stageBoost[k] || 0) + (presenceAdj[k] || 0);
      const score = industryScore[k] * 0.7 + modifiers * 0.5;
      scores[k] = Math.round(score * 10) / 10;
    });

    const reasonMap: Record<string, string> = {
      awareness: "brand awareness needs consistent, industry-relevant content and presence",
      leads:     "lead generation moves fastest through channels this industry's buyers actually use",
      sales:     "sales conversion needs demand-generation channels that fit how this industry buys",
      social:    "social growth is prioritized on the platforms most relevant to this industry",
      traffic:   "traffic growth leans on the discovery channels that work best for this industry",
    };

    return { scores, reason: reasonMap[goal] || "growth is driven by establishing category relevance" };
  };

  // Build the Low, Medium, and High plans using the scoring model
  const buildPlans = () => {
    const { scores, reason } = getScoredServices();
    
    const CAT: Record<string, { name: string; type: string; base: number }> = {
      smm:     { name: getDynamicServiceName('smm', industry),     type: "monthly",  base: basePrices.smm },
      ads:     { name: getDynamicServiceName('ads', industry),     type: "monthly",  base: basePrices.ads },
      seo:     { name: getDynamicServiceName('seo', industry),     type: "monthly",  base: basePrices.seo },
      web:     { name: getDynamicServiceName('web', industry),     type: "onetime",  base: basePrices.web },
      content: { name: getDynamicServiceName('content', industry), type: "monthly",  base: basePrices.content },
      wa:      { name: getDynamicServiceName('wa', industry),      type: "onetime",  base: basePrices.wa },
      infl:    { name: getDynamicServiceName('infl', industry),    type: "monthly",  base: basePrices.infl },
      gmb:     { name: getDynamicServiceName('gmb', industry),     type: "onetime",  base: basePrices.gmb },
      logo:    { name: getDynamicServiceName('logo', industry),    type: "onetime",  base: basePrices.logo },
      domain:  { name: getDynamicServiceName('domain', industry),  type: "onetime",  base: basePrices.domain },
    };

    const ranked = allServiceKeys.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

    // Low Plan: Score >= 7 (minimum 2 services)
    let lowList = ranked.filter(k => (scores[k] || 0) >= 7).slice(0, 3);
    if (lowList.length < 2) lowList = ranked.slice(0, 2);

    // Medium Plan: Score >= 5 (minimum lowList.length, merged/deduped)
    let mediumList = ranked.filter(k => (scores[k] || 0) >= 5).slice(0, 5);
    if (mediumList.length < lowList.length) mediumList = lowList.slice();
    mediumList = Array.from(new Set(lowList.concat(mediumList)));

    // High Plan: Score >= 3 (minimum mediumList.length + 2, merged/deduped)
    let highList = ranked.filter(k => (scores[k] || 0) >= 3).slice(0, 7);
    highList = Array.from(new Set(mediumList.concat(highList)));
    if (highList.length <= mediumList.length && ranked.length > mediumList.length) {
      highList = Array.from(new Set(mediumList.concat(ranked.slice(0, mediumList.length + 2))));
    }

    // Keep logo & domain as high plan addons matching the React basePrices structure
    const highAddons = ['logo', 'domain'];

    const buildTier = (key: 'low' | 'medium' | 'high', serviceKeys: string[], addonKeys: string[], tagline: string) => {
      const m = multipliers[key];
      const items: any[] = serviceKeys.map(k => {
        const s = CAT[k];
        return {
          key: k,
          name: s.name,
          type: s.type,
          price: s.base * m,
          scope: getDynamicServiceScope(k, goal, key),
        };
      });

      addonKeys.forEach(k => {
        const s = CAT[k];
        items.push({
          key: k,
          name: s.name,
          type: s.type,
          price: s.base,
          scope: "Add-on Support",
        });
      });

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
  const showEmpty = clientName.trim().length === 0;

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
    const metaLine = [clientCity, industryLabels[industry], stageLabels[stage], goalLabels[goal]].filter(Boolean).join('  ·  ');
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
    const why = `All three plans are matched to a ${stageLabels[stage].toLowerCase()} ${industryLabels[industry].toLowerCase()} business focused on ${goalLabels[goal].toLowerCase()}. Higher tiers add scope, speed, and dedicated support.`;
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
      <style dangerouslySetInnerHTML={{ __html: `
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
          background: var(--green-dark);
          color: #fff;
          padding: 18px 0;
          border-bottom: 3px solid var(--orange);
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
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: var(--orange);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 19px;
          color: #fff;
        }
        .brand-name {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 19px;
          letter-spacing: .2px;
        }
        .brand-sub {
          font-size: 11.5px;
          color: #bcd9c7;
          font-family: 'IBM Plex Mono', monospace;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .tool-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          color: var(--green-dark);
          background: var(--mint);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px dashed var(--green);
        }
        .hero {
          padding: 28px 0 6px;
        }
        .hero h1 {
          font-family: 'Fraunces', serif;
          font-size: 30px;
          margin: 0 0 6px;
          font-weight: 700;
          color: var(--ink);
        }
        .hero p {
          margin: 0;
          color: var(--muted);
          font-size: 14.5px;
          max-width: 640px;
        }
        .layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          margin-top: 22px;
          align-items: start;
        }
        @media(max-width: 980px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }
        .card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 22px 24px;
        }
        .card + .card {
          margin-top: 18px;
        }
        .card h2 {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          margin: 0 0 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--ink);
        }
        .card h2 .num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--green);
          background: var(--mint);
          padding: 2px 7px;
          border-radius: 5px;
        }
        .card .hint {
          font-size: 12.5px;
          color: var(--muted);
          margin: 0 0 16px;
        }
        label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--ink);
        }
        .field {
          margin-bottom: 16px;
        }
        input[type=text], select, input[type=number] {
          width: 100%;
          padding: 11px 12px;
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: var(--ink);
          transition: border-color .15s;
        }
        input[type=text]:focus, select:focus, input[type=number]:focus {
          outline: none;
          border-color: var(--green);
        }
        .row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media(max-width: 520px) {
          .row2 {
            grid-template-columns: 1fr;
          }
        }
        .chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          border: 1.5px solid var(--line);
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          background: #fff;
          user-select: none;
          transition: all .15s;
          font-weight: 500;
          color: var(--ink);
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
        .presence-note {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
        }
        .plans-empty {
          text-align: center;
          padding: 70px 20px;
          color: var(--muted);
        }
        .plans-empty i {
          font-size: 38px;
          color: var(--green);
          opacity: .4;
          margin-bottom: 12px;
          display: block;
        }
        .plans-empty p {
          font-size: 13.5px;
          margin: 0;
        }
        .client-strip {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .client-line {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          color: var(--ink);
        }
        .client-meta {
          font-size: 12.5px;
          color: var(--muted);
        }
        .budget-note {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--orange);
          border: 1px dashed var(--orange);
          border-radius: 20px;
          padding: 4px 10px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media(max-width: 900px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
        .plan-card {
          border: 1.5px solid var(--line);
          border-radius: 14px;
          padding: 20px;
          background: #fff;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: border-color .15s, transform .15s;
          color: var(--ink);
        }
        .plan-card.popular {
          border-color: var(--green);
          box-shadow: 0 4px 18px rgba(26,122,62,.08);
        }
        .plan-card.budget-match {
          border-color: var(--orange);
        }
        .plan-badge {
          position: absolute;
          top: -11px;
          left: 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .05em;
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 600;
        }
        .plan-badge.popular-badge {
          background: var(--green);
          color: #fff;
        }
        .plan-badge.budget-badge {
          background: var(--orange);
          color: #fff;
        }
        .plan-tier {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--muted);
          margin-bottom: 2px;
        }
        .plan-name {
          font-family: 'Fraunces', serif;
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 3px;
          color: var(--ink);
        }
        .plan-tagline {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 14px;
          min-height: 30px;
          line-height: 1.4;
        }
        .plan-price {
          margin-bottom: 4px;
        }
        .plan-price .amt {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--green-dark);
        }
        .plan-price .per {
          font-size: 12px;
          color: var(--muted);
        }
        .plan-setup {
          font-size: 11.5px;
          color: var(--muted);
          margin-bottom: 14px;
        }
        .plan-services {
          list-style: none;
          margin: 0 0 14px;
          padding: 0;
          border-top: 1px dashed var(--line);
          padding-top: 12px;
          flex-grow: 1;
        }
        .plan-services li {
          padding: 7px 0;
          border-bottom: 1px solid #f1f3f0;
          font-size: 12.5px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .plan-services li:last-child {
          border-bottom: none;
        }
        .plan-services .sv-name {
          font-weight: 600;
          color: var(--ink);
        }
        .plan-services .sv-scope {
          font-size: 10.5px;
          color: var(--muted);
          font-weight: 400;
          margin-top: 1px;
        }
        .plan-services .sv-price {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          white-space: nowrap;
          color: var(--ink);
        }
        .plan-why {
          font-size: 11.5px;
          line-height: 1.5;
          color: var(--muted);
          background: var(--paper);
          border-left: 2px solid var(--orange);
          padding: 8px 10px;
          border-radius: 5px;
        }
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .btn {
          border: none;
          border-radius: 9px;
          padding: 12px 18px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
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
        .admin-toggle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          color: var(--muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 26px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }
        .admin-toggle:hover {
          color: var(--green-dark);
        }
        .admin-panel {
          display: none;
          margin-top: 14px;
        }
        .admin-panel.open {
          display: block;
        }
        .admin-section-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: var(--green);
          margin: 14px 0 6px;
        }
        .admin-row {
          display: grid;
          grid-template-columns: 1.4fr .8fr .8fr;
          gap: 10px;
          align-items: center;
          padding: 7px 0;
          border-bottom: 1px solid var(--line);
          font-size: 12.5px;
          color: var(--ink);
        }
        .admin-row input {
          padding: 7px 9px;
          font-size: 12.5px;
          border-radius: 6px;
        }
        .admin-row span.lbl {
          font-weight: 500;
        }
        .admin-panel .save-note {
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 10px;
        }
        .copied-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--green-dark);
          color: #fff;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 13px;
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
          width: 14px;
          height: 14px;
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
            <div className="brand-mark">SF</div>
            <div>
              <div className="brand-name">StartupFlora</div>
              <div className="brand-sub">Sahi Hai! · Sales Desk</div>
            </div>
          </div>
          <div className="tool-tag">Digital Marketing Quotation Tool</div>
        </div>
      </header>

      <div className="wrap">
        <div className="hero">
          <h1>Quote a client in under a minute</h1>
          <p>Fill in what you learned on the call. We'll build three ready-to-share plans — Low, Medium, and High — matched to their profile.</p>
        </div>

        <div className="layout">
          {/* LEFT: FORM */}
          <div>
            <div className="card">
              <h2><span className="num">01</span> Client details</h2>
              <p className="hint">Just the basics — takes 20 seconds.</p>
              <div className="row2">
                <div className="field">
                  <label>Client / business name</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Meera Handicrafts" 
                  />
                </div>
                <div className="field">
                  <label>City / region</label>
                  <input 
                    type="text" 
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="e.g. Jaipur" 
                  />
                </div>
              </div>

              {/* AI Category Auto-Detect */}
              <div className="field" style={{ marginTop: '4px', marginBottom: '18px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>AI Category Auto-Detect</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>Type in Hinglish/English to auto-select Industry</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="e.g. ye biscuit ki company hai OR ham log online clothes bechte hain"
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAutoDetectCategory}
                    disabled={isDetecting || !businessDescription.trim()}
                    style={{ 
                      padding: '0 16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      whiteSpace: 'nowrap', 
                      minWidth: '110px', 
                      justifyContent: 'center',
                      fontSize: '13px'
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
                        Auto-Detect
                      </>
                    )}
                  </button>
                </div>
                {detectionResult && (
                  <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-circle-check" style={{ color: 'var(--green)', fontSize: '14px' }}></i>
                    <span>Category selected: <strong>{industryLabels[detectionResult] || detectionResult}</strong></span>
                  </div>
                )}
              </div>

              <div className="row2">
                <div className="field">
                  <label>Salesperson</label>
                  <input 
                    type="text" 
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    placeholder="Your name" 
                  />
                </div>
                <div className="field">
                  <label>Industry</label>
                  <select 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="ecommerce">Retail / E-commerce</option>
                    <option value="d2c">D2C Brand</option>
                    <option value="services">Professional Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="fnb">Food & Beverage</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="realestate">Real Estate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h2><span className="num">02</span> Business stage & goal</h2>
              <div className="field">
                <label>Business stage</label>
                <div className="chip-group">
                  {['new', 'growing', 'established'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStage(opt)}
                      className={`chip single ${stage === opt ? 'on single' : ''}`}
                    >
                      {stageLabels[opt]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Primary goal</label>
                <div className="chip-group">
                  {['awareness', 'leads', 'sales', 'social', 'traffic'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGoal(opt)}
                      className={`chip single ${goal === opt ? 'on single' : ''}`}
                    >
                      {goalLabels[opt]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h2><span className="num">03</span> Current presence & budget</h2>
              <div className="field">
                <label>What does the client already have?</label>
                <div className="chip-group">
                  {[
                    { key: 'website', label: 'Website' },
                    { key: 'social', label: 'Instagram / Social' },
                    { key: 'gmb', label: 'Google Business Profile' },
                    { key: 'none', label: 'None yet' }
                  ].map((opt) => {
                    const isChecked = presence.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handlePresenceChange(opt.key)}
                        className={`chip ${isChecked ? 'on' : ''}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="presence-note">Select all that apply — leave blank if they're starting from zero.</p>
              </div>
              <div className="field">
                <label>Client's stated monthly budget <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional — just for reference)</span></label>
                <select 
                  value={statedBudget}
                  onChange={(e) => setStatedBudget(parseInt(e.target.value) || 0)}
                >
                  <option value="0">Not sure yet</option>
                  <option value="15000">₹15,000 – 25,000</option>
                  <option value="25000">₹25,000 – 50,000</option>
                  <option value="50000">₹50,000 – 1,00,000</option>
                  <option value="100000">₹1,00,000+</option>
                </select>
              </div>
            </div>

            <div className="admin-toggle" onClick={() => setAdminOpen(!adminOpen)}>
              <i className="ti ti-settings"></i> Admin: edit base pricing
            </div>
            <div className={`card admin-panel ${adminOpen ? 'open' : ''}`}>
              <h2 style={{ marginBottom: '4px' }}><span className="num">⚙</span> Base pricing config</h2>
              <p className="hint" style={{ marginBottom: 0 }}>Low/High plans scale off these base rates automatically.</p>

              <div className="admin-section-label">Core services</div>
              {[
                { key: 'smm', label: 'Social Media Management', type: '₹/mo base' },
                { key: 'ads', label: 'Google / Meta Ads Mgmt', type: '₹/mo base' },
                { key: 'seo', label: 'SEO', type: '₹/mo base' },
                { key: 'web', label: 'Website Development', type: '₹ one-time' },
                { key: 'content', label: 'Content Creation', type: '₹/mo base' },
                { key: 'wa', label: 'WhatsApp Mktg / Green Tick', type: '₹ one-time' },
                { key: 'infl', label: 'Influencer Marketing', type: '₹/mo base' },
                { key: 'gmb', label: 'GMB Optimization', type: '₹ one-time' }
              ].map((item) => (
                <div key={item.key} className="admin-row">
                  <span className="lbl">{item.label}</span>
                  <input 
                    type="number" 
                    value={basePrices[item.key as keyof typeof basePrices]}
                    onChange={(e) => setBasePrices({ ...basePrices, [item.key]: parseInt(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.type}</span>
                </div>
              ))}

              <div className="admin-section-label">High-plan add-ons</div>
              {[
                { key: 'dam', label: 'Dedicated Account Manager', type: '₹/mo' },
                { key: 'analytics', label: 'Advanced Analytics & Reporting', type: '₹/mo' }
              ].map((item) => (
                <div key={item.key} className="admin-row">
                  <span className="lbl">{item.label}</span>
                  <input 
                    type="number" 
                    value={basePrices[item.key as keyof typeof basePrices]}
                    onChange={(e) => setBasePrices({ ...basePrices, [item.key]: parseInt(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.type}</span>
                </div>
              ))}

              <div className="admin-section-label">Tier scope multipliers</div>
              {[
                { key: 'low', label: 'Low plan', suffix: '× base price' },
                { key: 'medium', label: 'Medium plan', suffix: '× base price' },
                { key: 'high', label: 'High plan', suffix: '× base price' }
              ].map((item) => (
                <div key={item.key} className="admin-row">
                  <span className="lbl">{item.label}</span>
                  <input 
                    type="number" 
                    step="0.05"
                    value={multipliers[item.key as keyof typeof multipliers]}
                    onChange={(e) => setMultipliers({ ...multipliers, [item.key]: parseFloat(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.suffix}</span>
                </div>
              ))}

              <div className="flex flex-col gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={handleSaveBasePrices}
                  disabled={savingPrices}
                  className="w-full bg-[#1a7a3e] hover:bg-[#124f28] disabled:bg-[#657a6c] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors uppercase tracking-wider border-none cursor-pointer"
                >
                  {savingPrices ? 'Saving to Database...' : 'Save Base Prices to Database'}
                </button>
                <p className="save-note text-center" style={{ margin: 0 }}>
                  Saves configured prices directly to active PostgreSQL database services.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: PLANS */}
          <div>
            <div className="card" style={{ minHeight: '500px' }}>
              {showEmpty ? (
                <div className="plans-empty">
                  <i className="ti ti-layout-grid"></i>
                  <p>Fill in the client details on the left —<br />three plans will build themselves here.</p>
                </div>
              ) : (
                <div>
                  <div className="client-strip">
                    <div>
                      <div className="client-line">{clientName}</div>
                      <div className="client-meta">
                        {[clientCity, industryLabels[industry], stageLabels[stage], goalLabels[goal]].filter(Boolean).join(' · ')}
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
                          className={`plan-card ${isPopular ? 'popular' : ''} ${isBudget ? 'budget-match' : ''}`}
                        >
                          {isPopular && <div className="plan-badge popular-badge">Most Popular</div>}
                          {isBudget && <div className="plan-badge budget-badge">Matches Budget</div>}

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
