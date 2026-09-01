import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/*.json)
import { getRecommendedServices } from '@/lib/recommendation';
import { analyzeRequirements } from '@/lib/ai';

/**
 * Maps quick-quote feature shorthand keys to exact service names stored in data/services.json
 */
const SERVICE_MAPPINGS: Record<string, string> = {
  smm:    '1 Month (Basic) - Social Media Plan',
  linkedin: 'LinkedIn / B2B Social Marketing',
  ads:    'Paid Ads (Silver) - Basic Package',
  seo:    'SEO 2-Months',
  web:    'BASIC WEBSITE',
  ecomm:  'E-COMMERCE WEBSITE',
  content: 'Content Creation & Marketing',
  wa:     'WhatsApp Marketing & Green Tick',
  infl:   'Influencer Marketing',
  gmb:    'Google Business Profile Optimization',
  logo:   'Standard Logo Desing',
  pitch:  'Pitch Deck / Business PPT Preparation',
  orm:    'Online Reputation Management (ORM)',
  dam:    'Dedicated Account Manager',
  analytics: 'Advanced Analytics & Reporting',
  adsSetupBasic: 'Paid Ads — Setup Fee (Basic)',
  adsSetupPremium: 'Paid Ads — Setup Fee (Premium)',
  domainSecurity: 'DOMAIN SECURITY',
};

/**
 * Default fallback prices used when initializing missing services into data/services.json
 */
const DEFAULT_PRICES: Record<string, { min: number; max: number; desc: string; sales: string }> = {
  smm:    { min: 20000, max: 50000,  desc: '1 Month (Basic) - Social Media Plan',     sales: 'Kickstart your social media with professionally managed monthly campaign.' },
  linkedin: { min: 15000, max: 35000, desc: 'LinkedIn / B2B Social Marketing', sales: 'Drive B2B growth and authority on LinkedIn.' },
  ads:    { min: 30000, max: 40000,  desc: 'Paid Ads (Silver) - Basic Package',  sales: 'Generate leads and sales with targeted Meta & Google Ads.' },
  seo:    { min: 30000, max: 120000, desc: 'SEO 2-Months',                                sales: 'Rank higher on Google with keyword-targeted SEO.' },
  web:    { min: 20000, max: 60000,  desc: 'BASIC WEBSITE',                      sales: 'Professional 5-page responsive website with basic SEO.' },
  ecomm:  { min: 60000, max: 120000, desc: 'E-COMMERCE WEBSITE', sales: 'Robust online storefront with secure shopping pipeline.' },
  content: { min: 8000, max: 25000,  desc: 'Content Creation & Marketing',                  sales: 'Compelling content to engage and convert your audience.' },
  wa:     { min: 5000,  max: 15000,  desc: 'WhatsApp Marketing & Green Tick',               sales: 'WhatsApp broadcast campaigns and verified business tick.' },
  infl:   { min: 10000, max: 30000,  desc: 'Influencer Marketing',                          sales: 'Reach new audiences through targeted influencer collaborations.' },
  gmb:    { min: 4000,  max: 12000,  desc: 'Google Business Profile Optimization',          sales: 'Appear in local map results and Google searches.' },
  logo:   { min: 5000,  max: 15000,  desc: 'Standard Logo Desing',                        sales: 'A clean professional logo that represents your brand.' },
  pitch:  { min: 15000, max: 30000,  desc: 'Pitch Deck / Business PPT Preparation', sales: 'Investor-ready pitch deck and corporate business presentation.' },
  orm:    { min: 8000, max: 20000,  desc: 'Online Reputation Management (ORM)', sales: 'Build brand trust and manage customer reviews.' },
  dam:    { min: 8000, max: 15000,  desc: 'Dedicated Account Manager', sales: 'Single point of contact for campaigns coordination.' },
  analytics: { min: 5000, max: 12000, desc: 'Advanced Analytics & Reporting', sales: 'Deep-dive custom data reporting and dashboards.' },
  adsSetupBasic: { min: 2000, max: 5000, desc: 'Paid Ads — Setup Fee (Basic)', sales: 'Initial tracking and campaign structures layout.' },
  adsSetupPremium: { min: 5000, max: 12000, desc: 'Paid Ads — Setup Fee (Premium)', sales: 'Advanced conversion APIs and custom audiences mapping.' },
  domainSecurity: { min: 25000, max: 75000, desc: 'DOMAIN SECURITY', sales: 'Advanced DNS security, WHOIS privacy protection, and DNS lock.' },
};

/**
 * GET /api/quick-quote
 * Loads base prices from `data/services.json` mapped to quick-quote items.
 */
export async function GET() {
  try {
    // Read services catalog from data/services.json
    const services = await prisma.service.findMany();
    const mappedPrices: Record<string, number> = {};

    for (const [key, dbName] of Object.entries(SERVICE_MAPPINGS)) {
      let service = services.find((s) => s.name === dbName);
      
      // If service is missing in services.json, create it automatically
      if (!service) {
        const defaults = DEFAULT_PRICES[key];
        service = await prisma.service.create({
          data: {
            name: dbName,
            minPrice: defaults.min,
            maximumPrice: defaults.max,
            description: defaults.desc,
            salesDescription: defaults.sales,
          },
        });
      }


      mappedPrices[key] = Number(service.minPrice);
    }

    return NextResponse.json({ basePrices: mappedPrices });
  } catch (error) {
    console.error('Error fetching quick-quote configuration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/quick-quote
 * Bulk updates base service prices in `data/services.json`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { basePrices } = body;

    if (!basePrices) {
      return NextResponse.json({ error: 'Missing basePrices' }, { status: 400 });
    }

    // Persist new pricing configurations in data/services.json
    await prisma.$transaction(
      Object.entries(basePrices).map(([key, price]) => {
        const dbName = SERVICE_MAPPINGS[key];
        if (!dbName) return null;
        
        return prisma.service.updateMany({
          where: { name: dbName },
          data: {
            minPrice: Number(price),
            maximumPrice: Number(price) * 2.5, // Maintain max price ratio
          },
        });
      }).filter(Boolean) as any
    );

    return NextResponse.json({ message: 'Base prices synchronized successfully' });
  } catch (error) {
    console.error('Error updating base prices in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/quick-quote
 * Creates customer record, assessment, AI analysis, and full quotation in `data/*.json`.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientCity, salesperson, industry, stage, goal, secondaryGoal, tertiaryGoal, businessDescription, tierName, monthly, items } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'Missing clientName' }, { status: 400 });
    }

    // 1. Create or find customer profile in data/customers.json
    let customer = await prisma.customer.findFirst({
      where: { name: { equals: clientName, mode: 'insensitive' } },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: clientName,
          email: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          company: clientName,
          phone: salesperson ? `Salesperson: ${salesperson}` : null,
        },
      });
    }

    // 2. Fetch services and rules from data/services.json and data/service_rules.json
    const activeServices = await prisma.service.findMany({
      where: { active: true },
      include: { serviceRules: true },
    });

    const answersForAI = {
      '1': clientName,
      '2': industry,
      '3': stage === 'new' ? 'Micro (1-5 employees)' : stage === 'growing' ? 'Small (6-20 employees)' : 'Large (100+ employees)',
      '7': [goal, secondaryGoal !== 'none' && secondaryGoal, tertiaryGoal !== 'none' && tertiaryGoal].filter(Boolean) as string[],
      'business_description': businessDescription || '',
    };

    const ruleRecommended = getRecommendedServices(answersForAI, activeServices);

    // 3. Run AI analysis
    const aiResult = await analyzeRequirements(answersForAI, activeServices, ruleRecommended);

    // 4. Log client assessment survey details in data/assessments.json
    const assessment = await prisma.assessment.create({
      data: {
        customerId: customer.id,
        answers: {
          clientName,
          clientCity,
          salesperson,
          industry,
          stage,
          goal,
          secondaryGoal: secondaryGoal || 'none',
          tertiaryGoal: tertiaryGoal || 'none',
          businessDescription: businessDescription || '',
          tierName,
        },
        aiAnalysis: aiResult as any,
        status: 'completed',
      },
    });

    // 5. Create Quotation header and line items in data/quotations.json & data/quotation_items.json
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${year}-${random}`;

    const subtotal = Number(monthly);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + tax;

    const quotation = await prisma.$transaction(async (tx: any) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId: customer.id,
          assessmentId: assessment.id,
          subtotal,
          discount: 0,
          tax,
          total,
          status: 'draft',
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Valid for 15 days
        },
      });

      await Promise.all(
        items.map((item: any) => {
          const matchedService = activeServices.find(s => s.name === item.name);
          return tx.quotationItem.create({
            data: {
              quotationId: q.id,
              serviceId: matchedService ? matchedService.id : null,
              serviceName: item.name,
              description: item.scope || null,
              quantity: 1,
              unitPrice: Number(item.price),
              totalPrice: Number(item.price),
            },
          });
        })
      );

      return q;
    });

    return NextResponse.json({ quotationId: quotation.id, quotationNumber });
  } catch (error) {
    console.error('Error saving quick quote to JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

