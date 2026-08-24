import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { getAugmentedAnswers } from './answers';
import { prisma } from '@/lib/db';

const allServiceKeys = ['gmb','web','ecomm','wa','smm','linkedin','content','seo','ads','infl','logo','pitch','orm'];

const INDUSTRY_RELEVANCE: Record<string, Record<string, number>> = {
  ecommerce:     {smm:8, linkedin:3, ads:9, seo:8, web:5, ecomm:9, content:6, wa:7, infl:6, gmb:5, logo:6, pitch:3, orm:6},
  d2c:           {smm:9, linkedin:3, ads:8, seo:6, web:5, ecomm:8, content:8, wa:6, infl:9, gmb:3, logo:7, pitch:3, orm:6},
  services:      {smm:5, linkedin:9, ads:6, seo:8, web:8, ecomm:1, content:6, wa:7, infl:2, gmb:9, logo:6, pitch:9, orm:8},
  manufacturing: {smm:3, linkedin:8, ads:4, seo:7, web:8, ecomm:1, content:5, wa:6, infl:1, gmb:6, logo:5, pitch:8, orm:5},
  fnb:           {smm:9, linkedin:2, ads:6, seo:4, web:5, ecomm:2, content:7, wa:6, infl:7, gmb:9, logo:6, pitch:2, orm:9},
  healthcare:    {smm:4, linkedin:6, ads:5, seo:8, web:8, ecomm:1, content:6, wa:7, infl:2, gmb:9, logo:6, pitch:5, orm:9},
  education:     {smm:6, linkedin:6, ads:6, seo:7, web:7, ecomm:2, content:8, wa:7, infl:3, gmb:5, logo:6, pitch:6, orm:7},
  realestate:    {smm:6, linkedin:7, ads:7, seo:7, web:8, ecomm:1, content:5, wa:8, infl:3, gmb:9, logo:6, pitch:7, orm:8},
  other:         {smm:5, linkedin:5, ads:5, seo:5, web:5, ecomm:2, content:5, wa:5, infl:5, gmb:5, logo:5, pitch:5, orm:5},
};

const GOAL_BOOST: Record<string, Record<string, number>> = {
  awareness: {smm:3, content:3, infl:2, linkedin:2, orm:1},
  leads:     {ads:3, wa:3, seo:1, pitch:3, linkedin:2},
  sales:     {ads:3, seo:2, web:1, ecomm:3, pitch:2},
  social:    {smm:3, infl:3, linkedin:2},
  traffic:   {seo:3, content:2, ads:1},
};

const STAGE_BOOST: Record<string, Record<string, number>> = {
  new:         {content:2, web:2, gmb:1, logo:3, pitch:2},
  growing:     {ads:1, seo:1, orm:1},
  established: {ads:2, seo:1, orm:2, linkedin:1},
};

const resolveWebsiteConflict = (list: string[], scores: Record<string, number>): string[] => {
  if (list.includes('web') && list.includes('ecomm')) {
    const drop = (scores.web || 0) >= (scores.ecomm || 0) ? 'ecomm' : 'web';
    return list.filter(k => k !== drop);
  }
  return list;
};

const REVERSE_MAPPINGS: Record<string, string> = {
  'Social Media Management – Basic (1 Month)': 'smm',
  'LinkedIn / B2B Social Marketing': 'linkedin',
  'Paid Ads Management – Silver (Basic Package)': 'ads',
  'SEO – 2 Months': 'seo',
  'Website – Basic (5-Page)': 'web',
  'E-commerce Website / Store': 'ecomm',
  'Content Creation & Marketing': 'content',
  'WhatsApp Marketing & Green Tick': 'wa',
  'Influencer Marketing': 'infl',
  'Google Business Profile Optimization': 'gmb',
  'Logo Design – Standard': 'logo',
  'Pitch Deck / Business PPT Preparation': 'pitch',
  'Online Reputation Management (ORM)': 'orm',
  'Dedicated Account Manager': 'dam',
  'Advanced Analytics & Reporting': 'analytics',
  'Paid Ads — Setup Fee (Basic)': 'adsSetupBasic',
  'Paid Ads — Setup Fee (Premium)': 'adsSetupPremium',
  'Domain Security & SSL': 'domainSecurity'
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
    if (industry === 'realestate') return "Property Virtual Tour Video Editing & Instagram Reels"; // standard real estate ads
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
  let secondaryGoal = 'none';
  let tertiaryGoal = 'none';

  const mapGoalStr = (str: string): string => {
    const s = str.toLowerCase();
    if (s.includes('awareness') || s.includes('visibility') || s.includes('presence')) return 'awareness';
    if (s.includes('lead')) return 'leads';
    if (s.includes('sales') || s.includes('conversion')) return 'sales';
    if (s.includes('social') || s.includes('growth')) return 'social';
    if (s.includes('traffic') || s.includes('clicks')) return 'traffic';
    return 'awareness';
  };

  if (Array.isArray(rawGoal)) {
    if (rawGoal.length > 0) goal = mapGoalStr(rawGoal[0]);
    if (rawGoal.length > 1) secondaryGoal = mapGoalStr(rawGoal[1]);
    if (rawGoal.length > 2) tertiaryGoal = mapGoalStr(rawGoal[2]);
  } else if (typeof rawGoal === 'string' && rawGoal) {
    const mapped = mapGoalStr(rawGoal);
    if (mapped) {
      goal = answers.goal || mapped;
      secondaryGoal = answers.secondaryGoal || 'none';
      tertiaryGoal = answers.tertiaryGoal || 'none';
    }
  } else {
    goal = answers.goal || 'awareness';
    secondaryGoal = answers.secondaryGoal || 'none';
    tertiaryGoal = answers.tertiaryGoal || 'none';
  }

  // Generate dynamic prices based on DB services min prices
  const basePrices = {
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
  };

  servicesList.forEach(s => {
    const key = REVERSE_MAPPINGS[s.name];
    if (key) {
      basePrices[key as keyof typeof basePrices] = Number(s.minPrice);
    }
  });

  const getScoredServices = () => {
    const websiteVal = String(answers['4'] || '').toLowerCase();
    const instagramVal = String(answers['5'] || '').toLowerCase();
    const gmbVal = String(answers['6'] || '').toLowerCase();

    const hasWebsite = websiteVal.includes('yes') || websiteVal.includes('already');
    const hasSocial = instagramVal.includes('yes') || instagramVal.includes('already');
    const hasGMB = gmbVal.includes('yes') || gmbVal.includes('already');
    const startingFromZero = !hasWebsite && !hasSocial && !hasGMB;

    const presenceAdj: Record<string, number> = {};
    const bump = (k: string, v: number) => { 
      presenceAdj[k] = (presenceAdj[k] || 0) + v; 
    };
    if (!hasWebsite) { bump('web', 3); bump('ecomm', 3); } else { bump('web', -2); bump('ecomm', -2); }
    if (!hasSocial) { bump('smm', 2); bump('linkedin', 1); } else { bump('smm', -1); bump('linkedin', -1); }
    if (!hasGMB) bump('gmb', 3); else bump('gmb', -2);
    if (startingFromZero) { bump('web', 1); bump('gmb', 1); bump('smm', 1); bump('logo', 2); }

    const goalBoostHighest = GOAL_BOOST[goal] || {};
    const goalBoostSec = GOAL_BOOST[secondaryGoal] || {};
    const goalBoostTert = GOAL_BOOST[tertiaryGoal] || {};
    const stageBoost = STAGE_BOOST[stage] || {};
    const industryScore = INDUSTRY_RELEVANCE[ind] || INDUSTRY_RELEVANCE.other;

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

    return scores;
  };

  const scores = getScoredServices();

  const CAT: Record<string, { name: string; type: string; base: number }> = {
    smm:      { name: getDynamicServiceName('smm', ind),     type: "monthly",  base: basePrices.smm },
    linkedin: { name: getDynamicServiceName('linkedin', ind),type: "monthly",  base: basePrices.linkedin },
    ads:      { name: getDynamicServiceName('ads', ind),     type: "monthly",  base: basePrices.ads },
    seo:      { name: getDynamicServiceName('seo', ind),     type: "monthly",  base: basePrices.seo },
    web:      { name: getDynamicServiceName('web', ind),     type: "onetime",  base: basePrices.web },
    ecomm:    { name: getDynamicServiceName('ecomm', ind),   type: "onetime",  base: basePrices.ecomm },
    content:  { name: getDynamicServiceName('content', ind), type: "monthly",  base: basePrices.content },
    wa:       { name: getDynamicServiceName('wa', ind),      type: "onetime",  base: basePrices.wa },
    infl:     { name: getDynamicServiceName('infl', ind),    type: "monthly",  base: basePrices.infl },
    gmb:      { name: getDynamicServiceName('gmb', ind),     type: "onetime",  base: basePrices.gmb },
    logo:     { name: getDynamicServiceName('logo', ind),    type: "onetime",  base: basePrices.logo },
    pitch:    { name: getDynamicServiceName('pitch', ind),   type: "onetime",  base: basePrices.pitch },
    orm:      { name: getDynamicServiceName('orm', ind),     type: "monthly",  base: basePrices.orm },
    dam:      { name: getDynamicServiceName('dam', ind),     type: "monthly",  base: basePrices.dam },
    analytics:{ name: getDynamicServiceName('analytics', ind),type: "monthly",  base: basePrices.analytics },
    adsSetupBasic:   { name: getDynamicServiceName('adsSetupBasic', ind),  type: "onetime",  base: basePrices.adsSetupBasic },
    adsSetupPremium: { name: getDynamicServiceName('adsSetupPremium', ind),type: "onetime",  base: basePrices.adsSetupPremium },
    domainSecurity:  { name: getDynamicServiceName('domainSecurity', ind), type: "onetime",  base: basePrices.domainSecurity },
  };

  const ranked = allServiceKeys.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

  let lowList = ranked.filter(k => (scores[k] || 0) >= 7).slice(0, 3);
  if (lowList.length < 2) lowList = ranked.slice(0, 2);
  lowList = resolveWebsiteConflict(lowList, scores);

  let mediumList = ranked.filter(k => (scores[k] || 0) >= 5).slice(0, 5);
  if (mediumList.length < lowList.length) mediumList = lowList.slice();
  mediumList = Array.from(new Set(lowList.concat(mediumList)));
  mediumList = resolveWebsiteConflict(mediumList, scores);

  let highList = ranked.filter(k => (scores[k] || 0) >= 3).slice(0, 7);
  highList = Array.from(new Set(mediumList.concat(highList)));
  if (highList.length <= mediumList.length && ranked.length > mediumList.length) {
    highList = Array.from(new Set(mediumList.concat(ranked.slice(0, mediumList.length + 2))));
  }
  highList = resolveWebsiteConflict(highList, scores);

  const multipliers = { low: 0.85, medium: 1.0, high: 1.25 };

  const getPlanDetails = (key: 'low' | 'medium' | 'high', serviceKeys: string[]) => {
    const m = multipliers[key];
    const items = serviceKeys.map(k => {
      const s = CAT[k];
      return {
        name: s.name,
        type: s.type,
        price: Math.round((s.base * m) / 100) * 100
      };
    });

    if (key === 'high') {
      const highAddons = ['dam', 'analytics'];
      highAddons.forEach(k => {
        const s = CAT[k];
        items.push({
          name: s.name,
          type: s.type,
          price: Math.round(s.base / 100) * 100
        });
      });
    }

    if (serviceKeys.includes('ads')) {
      const setupKey = key === 'high' ? 'adsSetupPremium' : 'adsSetupBasic';
      const s = CAT[setupKey];
      items.push({
        name: s.name,
        type: s.type,
        price: Math.round(s.base / 100) * 100
      });
    }
    if (key === 'high' && (serviceKeys.includes('web') || serviceKeys.includes('ecomm'))) {
      const s = CAT.domainSecurity;
      items.push({
        name: s.name,
        type: s.type,
        price: Math.round(s.base / 100) * 100
      });
    }

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
              <Text style={[styles.tag, styles.tagGoal]}>
                {[
                  goal === 'awareness' ? 'Brand Awareness' : goal === 'leads' ? 'Lead Generation' : goal === 'sales' ? 'Sales / Conversions' : goal === 'social' ? 'Social Media Growth' : 'Website Traffic',
                  secondaryGoal !== 'none' && (secondaryGoal === 'awareness' ? 'Brand Awareness' : secondaryGoal === 'leads' ? 'Lead Generation' : secondaryGoal === 'sales' ? 'Sales / Conversions' : secondaryGoal === 'social' ? 'Social Media Growth' : 'Website Traffic'),
                  tertiaryGoal !== 'none' && (tertiaryGoal === 'awareness' ? 'Brand Awareness' : tertiaryGoal === 'leads' ? 'Lead Generation' : tertiaryGoal === 'sales' ? 'Sales / Conversions' : tertiaryGoal === 'social' ? 'Social Media Growth' : 'Website Traffic')
                ].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
          <View style={styles.projectDetails}>
            <Text style={styles.clientHeader}>Project Overview</Text>
            <Text style={styles.projectDetailsText}>
              {quotation.assessment?.aiAnalysis?.business_summary || 
               answers.businessDescription || 
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
