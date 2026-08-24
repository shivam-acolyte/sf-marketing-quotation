import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { getAugmentedAnswers } from './answers';
import { prisma } from '@/lib/db';

// Define Styles for PDF Document - Matching startupflora HTML Design
const styles = StyleSheet.create({
  page: {
    paddingBottom: 75, // space for footer
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#1A2433',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1A2433',
    paddingHorizontal: 40,
    paddingVertical: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#00C49A',
    color: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 196, 154, 0.15)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00C49A',
  },
  brandLogoText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  brandText: {
    flexDirection: 'column',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  brandSub: {
    color: '#A0AAB2',
    fontSize: 10,
    marginTop: 2,
  },
  docInfo: {
    alignItems: 'flex-end',
  },
  docBadge: {
    backgroundColor: 'rgba(0, 196, 154, 0.12)',
    borderWidth: 1,
    borderColor: '#2C97B7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  docBadgeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  docBadgeValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  docMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9.5,
    lineHeight: 1.5,
    textAlign: 'right',
  },
  docMetaStrong: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
  },
  clientBar: {
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#A0AAB2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientSection: {
    flexDirection: 'column',
    width: '55%',
  },
  clientHeader: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#6C757D',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A2433',
    marginBottom: 5,
  },
  clientTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontWeight: 'bold',
  },
  tagIndustry: { backgroundColor: '#e8f5ee', color: '#00C49A' },
  tagStatus: { backgroundColor: '#e8f0ff', color: '#2C97B7' },
  tagGoal: { backgroundColor: '#fef3e8', color: '#45ABD1' },
  projectDetails: {
    width: '40%',
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  projectDetailsText: {
    fontSize: 9.5,
    color: '#6C757D',
    lineHeight: 1.5,
  },
  sectionTitleContainer: {
    paddingHorizontal: 40,
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#2C97B7',
    fontWeight: 'bold',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C97B7',
    opacity: 0.3,
  },
  plansGrid: {
    paddingHorizontal: 40,
    paddingBottom: 15,
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A0AAB2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    position: 'relative',
  },
  planCardPopular: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2C97B7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-30px)',
    backgroundColor: '#2C97B7',
    color: '#ffffff',
    fontSize: 6.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: '0 0 6px 6px',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  planTier: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#6C757D',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A2433',
    marginBottom: 8,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  planCurrency: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C97B7',
    marginTop: 2,
  },
  planAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C97B7',
  },
  planPeriod: {
    fontSize: 9,
    color: '#6C757D',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  planSetup: {
    fontSize: 8,
    color: '#6C757D',
    marginTop: 4,
    textAlign: 'center',
  },
  planDivider: {
    height: 1,
    backgroundColor: '#A0AAB2',
    marginVertical: 10,
  },
  planServices: {
    flexDirection: 'column',
    gap: 6,
  },
  planServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f2',
    paddingBottom: 5,
  },
  planServiceName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1A2433',
    width: '68%',
    lineHeight: 1.3,
  },
  planServicePriceCol: {
    alignItems: 'flex-end',
    width: '30%',
  },
  planServicePrice: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1A2433',
  },
  planServiceType: {
    fontSize: 6,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
  },
  typeOnetime: { backgroundColor: '#e8f5ee', color: '#00C49A' },
  typeMonthly: { backgroundColor: '#e8f0ff', color: '#2C97B7' },
  planTotalBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F4F6F8',
    borderRadius: 6,
    alignItems: 'center',
  },
  planTotalLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6C757D',
    marginBottom: 2,
  },
  planTotalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C97B7',
  },
  tableSection: {
    paddingHorizontal: 40,
    paddingBottom: 15,
  },
  dataTable: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#00C49A',
    backgroundColor: '#F4F6F8',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#2C97B7',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#A0AAB2',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlternate: {
    flexDirection: 'row',
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1,
    borderBottomColor: '#A0AAB2',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colNo: { width: '5%', fontSize: 9, color: '#6C757D' },
  colDesc: { width: '47%' },
  colQty: { width: '8%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' },
  colRate: { width: '18%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' },
  colAmt: { width: '22%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' },
  tableItemLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  labelStarter: { backgroundColor: '#e8f5ee', color: '#00C49A' },
  labelGrowth: { backgroundColor: '#e8f0ff', color: '#2C97B7' },
  labelAccelerator: { backgroundColor: '#fef3e8', color: '#45ABD1' },
  itemName: {
    fontWeight: 'bold',
    color: '#1A2433',
    fontSize: 9,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 7.8,
    color: '#6C757D',
    lineHeight: 1.4,
  },
  deliverableHeader: {
    fontWeight: 'bold',
    color: '#2C97B7',
    fontSize: 7.2,
    marginTop: 4,
    marginBottom: 2,
  },
  deliverableBullet: {
    marginLeft: 8,
    color: '#1A2433',
    fontSize: 7,
    marginTop: 1.5,
  },
  summarySection: {
    paddingHorizontal: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryBox: {
    width: 250,
    backgroundColor: '#F4F6F8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A0AAB2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    fontSize: 9,
  },
  summaryLabel: {
    color: '#6C757D',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1A2433',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#00C49A',
    paddingTop: 8,
    marginTop: 5,
    fontSize: 11,
    fontWeight: 'bold',
  },
  summaryRowTotalLabel: {
    color: '#1A2433',
  },
  summaryRowTotalValue: {
    color: '#00C49A',
  },
  termsSection: {
    paddingHorizontal: 40,
    paddingBottom: 15,
  },
  termsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A0AAB2',
    borderRadius: 8,
    padding: 12,
  },
  termsHeader: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#2C97B7',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 7.2,
    color: '#6C757D',
    lineHeight: 1.5,
    marginBottom: 3,
  },
  bottomGrid: {
    paddingHorizontal: 40,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  bankBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A0AAB2',
    borderRadius: 8,
    padding: 12,
  },
  bankHeader: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#2C97B7',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#A0AAB2',
    borderBottomStyle: 'dashed',
    fontSize: 8,
  },
  bankDetailLabel: {
    color: '#6C757D',
  },
  bankDetailValue: {
    fontWeight: 'bold',
    color: '#1A2433',
  },
  signBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A0AAB2',
    borderRadius: 8,
    padding: 12,
  },
  signHeader: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#2C97B7',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  signText: {
    fontSize: 7.5,
    color: '#6C757D',
    lineHeight: 1.4,
    marginBottom: 15,
  },
  signLine: {
    borderTopWidth: 1,
    borderTopColor: '#A0AAB2',
    paddingTop: 4,
    fontSize: 8,
    color: '#6C757D',
    marginTop: 12,
  },
  footerBar: {
    backgroundColor: '#1A2433',
    paddingHorizontal: 40,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 7.5,
    lineHeight: 1.4,
  },
  footerTextBold: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
  },
  footerRight: {
    textAlign: 'right',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-end',
  },
  footerRightText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 7.5,
  },
});

// Industry wise dynamic service names
const getDynamicServiceName = (serviceKey: string, industry: string): string => {
  if (serviceKey === 'smm') {
    if (industry === 'ecommerce') return "E-commerce IG/FB Reels & UGC Validation";
    if (industry === 'realestate') return "Property Virtual Tour Video Editing & IG Reels";
    if (industry === 'fnb') return "Food & Beverage IG Reels Posting";
    return "Social Media Curation & Brand Profile Management";
  }
  if (serviceKey === 'ads') {
    if (industry === 'ecommerce') return "Meta Shopping Ads & Google Shopping funnels";
    if (industry === 'realestate') return "Meta Local Lead Generation Ads";
    if (industry === 'services') return "B2B LinkedIn & Google Search intent ads";
    if (industry === 'education') return "Admissions Lead Acquisition Meta campaigns";
    return "Paid Ads campaigns (Meta / Google Search)";
  }
  if (serviceKey === 'web') {
    if (industry === 'ecommerce') return "Shopify / WooCommerce Store development";
    if (industry === 'healthcare') return "Clinic Appointment Booking responsive Website";
    if (industry === 'education') return "Course Registration & Admissions Portal";
    if (industry === 'services') return "Professional Services Lead Capture landing page";
    return "Custom responsive Website Development";
  }
  if (serviceKey === 'seo') {
    if (industry === 'ecommerce') return "Product & Collection page SEO search optimization";
    if (industry === 'healthcare' || industry === 'fnb') return "Local Doctor / Restaurant search positioning";
    return "Google organic Search rankings SEO Audit & cleanup";
  }
  if (serviceKey === 'content') {
    if (industry === 'services') return "B2B Blogs copywriting & Corporate whitepapers";
    if (industry === 'education') return "Curriculum guides writing & copywriting";
    return "Brand Marketing Copywriting & graphic creatives design";
  }
  if (serviceKey === 'gmb') {
    if (industry === 'healthcare') return "Clinic Google maps ranking & patient reviews";
    if (industry === 'fnb') return "Restaurant Google Business maps verification";
    return "Google Business Profile Local Search Optimization";
  }
  if (serviceKey === 'logo') {
    if (industry === 'realestate') return "Premium Real Estate brand logo design";
    return "Corporate brand Logo design & branding assets";
  }
  if (serviceKey === 'domain') {
    if (industry === 'ecommerce') return "Store Check-out Security & SSL lock auditing";
    return "Domain Protection & Cloudflare integration";
  }
  if (serviceKey === 'wa') {
    if (industry === 'realestate' || industry === 'services') return "WhatsApp Auto-reply Scheduling & API Green Tick";
    return "WhatsApp Marketing Broadcast & Auto-responder rules";
  }
  if (serviceKey === 'infl') {
    if (industry === 'ecommerce') return "Direct D2C Brand Influencer UGC deals sourcing";
    if (industry === 'fnb') return "Local Food Bloggers review campaign setup";
    return "Micro-Influencer Outreach campaigns listing";
  }
  
  const defaults: Record<string, string> = {
    smm: "Social Media Management",
    ads: "Paid Ads Management",
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

interface PDFQuotationProps {
  quotation: {
    id: string;
    quotationNumber: string;
    createdAt: Date | string;
    validUntil: Date | string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
    };
    assessment?: {
      answers: any;
      aiAnalysis?: {
        business_summary?: string;
        strategy_summary?: string;
      };
    };
    items: {
      serviceName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  };
  questions: any[];
  dbServices: any[];
}

// React PDF Document definition
const QuotationDocument: React.FC<PDFQuotationProps> = ({ quotation, questions, dbServices }) => {
  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    const date = new Date(dateVal);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const questionsList = questions || [];
  const servicesList = dbServices || [];

  // Parse dynamic tags
  const answers = (quotation.assessment?.answers || {}) as Record<string, any>;
  const augmented = getAugmentedAnswers(answers, questionsList);

  const rawIndustry = augmented['industry'] || 'ecommerce';
  const rawStage = augmented['business_size'] || 'growing';
  const rawGoal = augmented['goals'] || 'awareness';

  // Normalize inputs for plans builder
  let ind = 'ecommerce';
  const indStr = String(rawIndustry).toLowerCase();
  if (indStr.includes('e-commerce') || indStr.includes('retail') || indStr.includes('store') || indStr.includes('d2c')) ind = 'ecommerce';
  else if (indStr.includes('manufacturing') || indStr.includes('b2b') || indStr.includes('service')) ind = 'services';
  else if (indStr.includes('real estate') || indStr.includes('property')) ind = 'realestate';
  else if (indStr.includes('restaurant') || indStr.includes('food') || indStr.includes('fnb')) ind = 'fnb';
  else if (indStr.includes('health') || indStr.includes('doctor') || indStr.includes('clinic')) ind = 'healthcare';
  else if (indStr.includes('education') || indStr.includes('school') || indStr.includes('college')) ind = 'education';

  let stage = 'growing';
  const stageStr = String(rawStage).toLowerCase();
  if (stageStr.includes('new') || stageStr.includes('startup') || stageStr.includes('sole')) stage = 'new';
  else if (stageStr.includes('established') || stageStr.includes('large') || stageStr.includes('mature')) stage = 'established';

  let goal = 'awareness';
  const goalStr = Array.isArray(rawGoal) ? String(rawGoal[0]).toLowerCase() : String(rawGoal).toLowerCase();
  if (goalStr.includes('awareness') || goalStr.includes('visibility')) goal = 'awareness';
  else if (goalStr.includes('lead')) goal = 'leads';
  else if (goalStr.includes('sales') || goalStr.includes('conversion')) goal = 'sales';
  else if (goalStr.includes('social') || goalStr.includes('growth')) goal = 'social';
  else if (goalStr.includes('traffic') || goalStr.includes('clicks')) goal = 'traffic';

  // Generate dynamic prices based on DB services min prices
  const basePrices: Record<string, number> = {
    smm: 20000,
    ads: 30000,
    seo: 30000,
    web: 20000,
    content: 8000,
    wa: 5000,
    infl: 15000,
    gmb: 5000,
    logo: 8000,
    domain: 3000
  };

  servicesList.forEach(s => {
    const keyName = s.name.toLowerCase();
    if (keyName.includes('social') || keyName.includes('smm')) basePrices.smm = Number(s.minPrice);
    else if (keyName.includes('paid ads') || keyName.includes('meta')) basePrices.ads = Number(s.minPrice);
    else if (keyName.includes('seo')) basePrices.seo = Number(s.minPrice);
    else if (keyName.includes('website') || keyName.includes('web')) basePrices.web = Number(s.minPrice);
    else if (keyName.includes('content')) basePrices.content = Number(s.minPrice);
    else if (keyName.includes('whatsapp') || keyName.includes('wa')) basePrices.wa = Number(s.minPrice);
    else if (keyName.includes('influencer')) basePrices.infl = Number(s.minPrice);
    else if (keyName.includes('maps') || keyName.includes('profile') || keyName.includes('gmb')) basePrices.gmb = Number(s.minPrice);
    else if (keyName.includes('logo')) basePrices.logo = Number(s.minPrice);
    else if (keyName.includes('domain') || keyName.includes('security')) basePrices.domain = Number(s.minPrice);
  });

  const coreServiceKeys = () => {
    const matched = new Set<string>();
    if (ind === 'ecommerce') {
      matched.add('ads'); matched.add('smm'); matched.add('domain');
    } else if (ind === 'services') {
      matched.add('seo'); matched.add('content'); matched.add('wa');
    } else if (ind === 'realestate') {
      matched.add('smm'); matched.add('ads'); matched.add('logo'); matched.add('wa');
    } else if (ind === 'fnb') {
      matched.add('gmb'); matched.add('smm'); matched.add('logo');
    } else if (ind === 'healthcare') {
      matched.add('gmb'); matched.add('web'); matched.add('domain');
    } else if (ind === 'education') {
      matched.add('web'); matched.add('ads'); matched.add('content');
    } else {
      matched.add('smm'); matched.add('web'); matched.add('gmb');
    }

    if (stage === 'new') {
      matched.add('logo'); matched.add('web');
    } else if (stage === 'growing') {
      matched.add('ads'); matched.add('wa');
    } else if (stage === 'established') {
      matched.add('seo'); matched.add('domain'); matched.add('infl');
    }

    if (goal === 'awareness') { matched.add('smm'); matched.add('content'); }
    if (goal === 'leads') { matched.add('ads'); matched.add('wa'); }
    if (goal === 'sales') { matched.add('ads'); if (ind === 'ecommerce') matched.add('domain'); else matched.add('seo'); }
    if (goal === 'social') { matched.add('smm'); matched.add('infl'); }
    if (goal === 'traffic') { matched.add('seo'); matched.add('content'); }

    const priorityOrder = ['gmb', 'web', 'logo', 'wa', 'smm', 'content', 'seo', 'ads', 'infl', 'domain'];
    return [...matched].sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
  };

  const coreList = coreServiceKeys();
  const lowCount = Math.max(2, Math.ceil(coreList.length / 2));
  const lowList = coreList.slice(0, lowCount);
  const mediumList = coreList.slice();
  const priorityOrderList = ['gmb', 'web', 'logo', 'wa', 'smm', 'content', 'seo', 'ads', 'infl', 'domain'];
  const remaining = priorityOrderList.filter(k => !coreList.includes(k));
  const highList = coreList.concat(remaining.slice(0, 2));

  const multipliers = { low: 0.85, medium: 1.0, high: 1.25 };

  const CAT: Record<string, { name: string; type: string; base: number }> = {
    smm:     { name: getDynamicServiceName('smm', ind),     type: "monthly",  base: basePrices.smm },
    ads:     { name: getDynamicServiceName('ads', ind),     type: "monthly",  base: basePrices.ads },
    seo:     { name: getDynamicServiceName('seo', ind),     type: "monthly",  base: basePrices.seo },
    web:     { name: getDynamicServiceName('web', ind),     type: "onetime",  base: basePrices.web },
    content: { name: getDynamicServiceName('content', ind), type: "monthly",  base: basePrices.content },
    wa:      { name: getDynamicServiceName('wa', ind),      type: "onetime",  base: basePrices.wa },
    infl:    { name: getDynamicServiceName('infl', ind),    type: "monthly",  base: basePrices.infl },
    gmb:     { name: getDynamicServiceName('gmb', ind),     type: "onetime",  base: basePrices.gmb },
    logo:    { name: getDynamicServiceName('logo', ind),    type: "onetime",  base: basePrices.logo },
    domain:  { name: getDynamicServiceName('domain', ind),  type: "onetime",  base: basePrices.domain },
  };

  const getPlanDetails = (key: 'low' | 'medium' | 'high', keys: string[]) => {
    const m = multipliers[key];
    const items = keys.map(k => {
      const s = CAT[k];
      return {
        name: s.name,
        type: s.type,
        price: Math.round((s.base * m) / 100) * 100
      };
    });

    let monthly = 0;
    let onetime = 0;
    items.forEach(it => {
      if (it.type === 'monthly') monthly += it.price;
      else onetime += it.price;
    });

    return { items, monthly, onetime };
  };

  const lowPlan = getPlanDetails('low', lowList);
  const mediumPlan = getPlanDetails('medium', mediumList);
  const highPlan = getPlanDetails('high', highList);

  const getPlanLabel = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('gmb') || name.includes('logo') || name.includes('maps')) {
      return { text: 'Starter', style: styles.labelStarter };
    }
    if (name.includes('content') || name.includes('ads') || name.includes('whatsapp') || name.includes('wa')) {
      return { text: 'Growth', style: styles.labelGrowth };
    }
    return { text: 'Accelerator', style: styles.labelAccelerator };
  };

  return (
    <Document>
      {/* PAGE 1: Corporate Header, Client Profile & Proposed Plans */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>SF</Text>
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandTitle}>StartupFlora</Text>
                <Text style={styles.brandSub}>Digital Marketing Solutions Pvt. Ltd.</Text>
              </View>
            </View>
            <View style={styles.docInfo}>
              <View style={styles.docBadge}>
                <Text style={styles.docBadgeLabel}>Quotation No.</Text>
                <Text style={styles.docBadgeValue}>{quotation.quotationNumber}</Text>
              </View>
              <View style={styles.docMeta}>
                <Text><Text style={styles.docMetaStrong}>Date: </Text>{formatDate(quotation.createdAt)}</Text>
                <Text><Text style={styles.docMetaStrong}>Valid Until: </Text>{formatDate(quotation.validUntil)}</Text>
                <Text><Text style={styles.docMetaStrong}>Prepared By: </Text>Akash Sharma</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CLIENT BAR */}
        <View style={styles.clientBar}>
          <View style={styles.clientSection}>
            <Text style={styles.clientHeader}>Quotation To</Text>
            <Text style={styles.clientName}>{quotation.customer.name}</Text>
            <View style={styles.clientTags}>
              <Text style={[styles.tag, styles.tagIndustry]}>{rawIndustry}</Text>
              <Text style={[styles.tag, styles.tagStatus]}>{rawStage}</Text>
              <Text style={[styles.tag, styles.tagGoal]}>{Array.isArray(rawGoal) ? rawGoal.join(', ') : rawGoal}</Text>
            </View>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.clientHeader}>Project Overview</Text>
            <Text style={styles.projectDetailsText}>
              {quotation.assessment?.aiAnalysis?.business_summary || 
               "Comprehensive digital marketing strategy covering local optimizations, active social campaigns, content copywriting, and paid advertising tunnels to accelerate growth."}
            </Text>
          </View>
        </View>

        {/* PROPOSED PLANS SECTION */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Proposed Plans</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.plansGrid}>
          {/* Starter Plan (Low) */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTier}>Low Plan</Text>
              <Text style={styles.planName}>Starter</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planCurrency}>₹</Text>
                <Text style={styles.planAmount}>{lowPlan.monthly.toLocaleString('en-IN')}</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
              {lowPlan.onetime > 0 ? (
                <Text style={styles.planSetup}>+ ₹{lowPlan.onetime.toLocaleString('en-IN')} one-time setup</Text>
              ) : null}
            </View>
            <View style={styles.planDivider} />
            <View style={styles.planServices}>
              {lowPlan.items.slice(0, 3).map((it, idx) => (
                <View key={idx} style={styles.planServiceRow}>
                  <Text style={styles.planServiceName}>{it.name}</Text>
                  <View style={styles.planServicePriceCol}>
                    <Text style={styles.planServicePrice}>₹{it.price.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.planServiceType, it.type === 'monthly' ? styles.typeMonthly : styles.typeOnetime]}>
                      {it.type === 'monthly' ? 'Monthly' : 'One-time'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.planTotalBox}>
              <Text style={styles.planTotalLabel}>First Month Total</Text>
              <Text style={styles.planTotalAmount}>₹{(lowPlan.monthly + lowPlan.onetime).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Growth Plan (Medium - Popular) */}
          <View style={styles.planCardPopular}>
            <Text style={styles.popularBadge}>Most Popular</Text>
            <View style={styles.planHeader}>
              <Text style={styles.planTier}>Medium Plan</Text>
              <Text style={styles.planName}>Growth</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planCurrency}>₹</Text>
                <Text style={styles.planAmount}>{mediumPlan.monthly.toLocaleString('en-IN')}</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
              {mediumPlan.onetime > 0 ? (
                <Text style={styles.planSetup}>+ ₹{mediumPlan.onetime.toLocaleString('en-IN')} one-time setup</Text>
              ) : null}
            </View>
            <View style={styles.planDivider} />
            <View style={styles.planServices}>
              {mediumPlan.items.slice(0, 4).map((it, idx) => (
                <View key={idx} style={styles.planServiceRow}>
                  <Text style={styles.planServiceName}>{it.name}</Text>
                  <View style={styles.planServicePriceCol}>
                    <Text style={styles.planServicePrice}>₹{it.price.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.planServiceType, it.type === 'monthly' ? styles.typeMonthly : styles.typeOnetime]}>
                      {it.type === 'monthly' ? 'Monthly' : 'One-time'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.planTotalBox}>
              <Text style={styles.planTotalLabel}>First Month Total</Text>
              <Text style={styles.planTotalAmount}>₹{(mediumPlan.monthly + mediumPlan.onetime).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Accelerator Plan (High) */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTier}>High Plan</Text>
              <Text style={styles.planName}>Accelerator</Text>
              <View style={styles.planPrice}>
                <Text style={styles.planCurrency}>₹</Text>
                <Text style={styles.planAmount}>{highPlan.monthly.toLocaleString('en-IN')}</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
              {highPlan.onetime > 0 ? (
                <Text style={styles.planSetup}>+ ₹{highPlan.onetime.toLocaleString('en-IN')} one-time setup</Text>
              ) : null}
            </View>
            <View style={styles.planDivider} />
            <View style={styles.planServices}>
              {highPlan.items.slice(0, 5).map((it, idx) => (
                <View key={idx} style={styles.planServiceRow}>
                  <Text style={styles.planServiceName}>{it.name}</Text>
                  <View style={styles.planServicePriceCol}>
                    <Text style={styles.planServicePrice}>₹{it.price.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.planServiceType, it.type === 'monthly' ? styles.typeMonthly : styles.typeOnetime]}>
                      {it.type === 'monthly' ? 'Monthly' : 'One-time'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.planTotalBox}>
              <Text style={styles.planTotalLabel}>First Month Total</Text>
              <Text style={styles.planTotalAmount}>₹{(highPlan.monthly + highPlan.onetime).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* FOOTER BAR */}
        <View style={styles.footerBar} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTextBold}>StartupFlora Digital Solutions Pvt. Ltd.</Text>
            <Text style={styles.footerText}>42, Innovation Hub, Koramangala, Bangalore — 560034</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerRightText}>Page 1 of 2 &nbsp;|&nbsp; startupflora.com</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2: Detailed Line Items Table, Totals, Payment Details, Terms & Signatures */}
      <Page size="A4" style={styles.page}>
        {/* SECTION TITLE */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Detailed Line Items</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* DETAILED TABLE */}
        <View style={styles.tableSection}>
          <View style={styles.dataTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Service Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty, { textAlign: 'right' }]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate, { textAlign: 'right' }]}>Rate (₹)</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmt, { textAlign: 'right' }]}>Amount (₹)</Text>
            </View>

            {/* Table Rows */}
            {quotation.items.map((item, index) => {
              const isAlternate = index % 2 === 1;
              const rowStyle = isAlternate ? styles.tableRowAlternate : styles.tableRow;
              const badge = getPlanLabel(item.serviceName);

              return (
                <View key={index} style={rowStyle} wrap={false}>
                  <Text style={styles.colNo}>{index + 1}</Text>
                  <View style={styles.colDesc}>
                    <Text style={[styles.tableItemLabel, badge.style]}>{badge.text}</Text>
                    <Text style={styles.itemName}>{item.serviceName}</Text>
                    {item.description ? (
                      <View style={styles.itemDesc}>
                        {item.description.split('\n').map((line, idx) => {
                          const cleanLine = line.trim();
                          if (!cleanLine) return null;
                          
                          if (cleanLine.startsWith('•')) {
                            return (
                              <Text key={idx} style={styles.deliverableBullet}>
                                {cleanLine}
                              </Text>
                            );
                          }
                          if (cleanLine.includes('Included Deliverables:')) {
                            return (
                              <Text key={idx} style={styles.deliverableHeader}>
                                {cleanLine}
                              </Text>
                            );
                          }
                          return (
                            <Text key={idx} style={{ color: '#718096' }}>
                              {line}
                            </Text>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colRate}>{Number(item.unitPrice).toFixed(2)}</Text>
                  <Text style={styles.colAmt}>{Number(item.totalPrice).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.summarySection} wrap={false}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{Number(quotation.subtotal).toFixed(2)}</Text>
            </View>
            {Number(quotation.discount) > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount Applied</Text>
                <Text style={styles.summaryValue}>-₹{Number(quotation.discount).toFixed(2)}</Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{Number(quotation.tax).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryRowTotalLabel}>Grand Total</Text>
              <Text style={styles.summaryRowTotalValue}>₹{Number(quotation.total).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* TERMS SECTION */}
        <View style={styles.sectionTitleContainer} wrap={false}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.sectionLine} />
        </View>
        
        <View style={styles.termsSection} wrap={false}>
          <View style={styles.termsBox}>
            <Text style={styles.termsHeader}>Standard Terms</Text>
            <Text style={styles.termsText}>• This quotation is valid for 15 days from the date of issue.</Text>
            <Text style={styles.termsText}>• Prices are subject to 18% GST (already computed in the financials above).</Text>
            <Text style={styles.termsText}>• One-time setup fees are payable upfront before project commencement.</Text>
            <Text style={styles.termsText}>• Monthly retainers are billed on the 1st of every month, payable within 7 days.</Text>
            <Text style={styles.termsText}>• Cancellation requires 30 days written notice. No refunds on setup fees.</Text>
          </View>
        </View>

        {/* BANK & SIGNATURE GRID */}
        <View style={styles.sectionTitleContainer} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.bottomGrid} wrap={false}>
          {/* Bank details card */}
          <View style={styles.bankBox}>
            <Text style={styles.bankHeader}>Bank Account Details</Text>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Account Name</Text>
              <Text style={styles.bankDetailValue}>StartupFlora Solutions</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Bank Name</Text>
              <Text style={styles.bankDetailValue}>HDFC Bank</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Account Number</Text>
              <Text style={styles.bankDetailValue}>50200012345678</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>IFSC Code</Text>
              <Text style={styles.bankDetailValue}>HDFC0001234</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>UPI ID</Text>
              <Text style={styles.bankDetailValue}>startupflora@upi</Text>
            </View>
          </View>

          {/* Authorization signature stamp box */}
          <View style={styles.signBox}>
            <Text style={styles.signHeader}>Authorization</Text>
            <Text style={styles.signText}>
              Please review this quotation carefully. To proceed, kindly sign below and return a scanned copy to hello@startupflora.com.
            </Text>
            <Text style={styles.signLine}>Client Signature &nbsp;&nbsp;_________________________</Text>
            <Text style={styles.signLine}>Date &nbsp;&nbsp;_________________________</Text>
          </View>
        </View>

        {/* FOOTER BAR */}
        <View style={styles.footerBar} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTextBold}>StartupFlora Digital Solutions Pvt. Ltd.</Text>
            <Text style={styles.footerText}>42, Innovation Hub, Koramangala, Bangalore — 560034</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerRightText}>Page 2 of 2 &nbsp;|&nbsp; startupflora.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateQuotationPDF(quotation: any): Promise<Buffer> {
  const questions = await prisma.question.findMany({ where: { active: true } });
  const dbServices = await prisma.service.findMany({ where: { active: true } });

  const buffer = await renderToBuffer(
    React.createElement(QuotationDocument, { quotation, questions, dbServices }) as any
  );
  return buffer;
}
