import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRecommendedServices } from '@/lib/recommendation';
import { analyzeRequirements } from '@/lib/ai';

const SERVICE_MAPPINGS: Record<string, string> = {
  smm:    'Social Media Management – Basic (1 Month)',
  linkedin: 'LinkedIn / B2B Social Marketing',
  ads:    'Paid Ads Management – Silver (Basic Package)',
  seo:    'SEO – 2 Months',
  web:    'Website – Basic (5-Page)',
  ecomm:  'E-commerce Website / Store',
  content: 'Content Creation & Marketing',
  wa:     'WhatsApp Marketing & Green Tick',
  infl:   'Influencer Marketing',
  gmb:    'Google Business Profile Optimization',
  logo:   'Logo Design – Standard',
  pitch:  'Pitch Deck / Business PPT Preparation',
  orm:    'Online Reputation Management (ORM)',
  dam:    'Dedicated Account Manager',
  analytics: 'Advanced Analytics & Reporting',
  adsSetupBasic: 'Paid Ads — Setup Fee (Basic)',
  adsSetupPremium: 'Paid Ads — Setup Fee (Premium)',
  domainSecurity: 'Domain Security & SSL',
};

const DEFAULT_PRICES: Record<string, { min: number; max: number; desc: string; sales: string }> = {
  smm:    { min: 20000, max: 50000,  desc: 'Social Media Management – Basic (1 Month)',     sales: 'Kickstart your social media with professionally managed monthly campaign.' },
  linkedin: { min: 15000, max: 35000, desc: 'LinkedIn / B2B Social Marketing', sales: 'Drive B2B growth and authority on LinkedIn.' },
  ads:    { min: 35000, max: 75000,  desc: 'Paid Ads Management – Silver (Basic Package)',  sales: 'Generate leads and sales with targeted Meta & Google Ads.' },
  seo:    { min: 18000, max: 40000,  desc: 'SEO – 2 Months',                                sales: 'Rank higher on Google with keyword-targeted SEO.' },
  web:    { min: 20000, max: 60000,  desc: 'Website – Basic (5-Page)',                      sales: 'Professional 5-page responsive website with basic SEO.' },
  ecomm:  { min: 90000, max: 180000, desc: 'E-commerce Website / Store', sales: 'Robust online storefront with secure shopping pipeline.' },
  content: { min: 8000, max: 25000,  desc: 'Content Creation & Marketing',                  sales: 'Compelling content to engage and convert your audience.' },
  wa:     { min: 5000,  max: 15000,  desc: 'WhatsApp Marketing & Green Tick',               sales: 'WhatsApp broadcast campaigns and verified business tick.' },
  infl:   { min: 10000, max: 30000,  desc: 'Influencer Marketing',                          sales: 'Reach new audiences through targeted influencer collaborations.' },
  gmb:    { min: 4000,  max: 12000,  desc: 'Google Business Profile Optimization',          sales: 'Appear in local map results and Google searches.' },
  logo:   { min: 15000, max: 30000,  desc: 'Logo Design – Standard',                        sales: 'A clean professional logo that represents your brand.' },
  pitch:  { min: 15000, max: 30000,  desc: 'Pitch Deck / Business PPT Preparation', sales: 'Investor-ready pitch deck and corporate business presentation.' },
  orm:    { min: 8000, max: 20000,  desc: 'Online Reputation Management (ORM)', sales: 'Build brand trust and manage customer reviews.' },
  dam:    { min: 8000, max: 15000,  desc: 'Dedicated Account Manager', sales: 'Single point of contact for campaigns coordination.' },
  analytics: { min: 5000, max: 12000, desc: 'Advanced Analytics & Reporting', sales: 'Deep-dive custom data reporting and dashboards.' },
  adsSetupBasic: { min: 2000, max: 5000, desc: 'Paid Ads — Setup Fee (Basic)', sales: 'Initial tracking and campaign structures layout.' },
  adsSetupPremium: { min: 5000, max: 12000, desc: 'Paid Ads — Setup Fee (Premium)', sales: 'Advanced conversion APIs and custom audiences mapping.' },
  domainSecurity: { min: 25000, max: 50000, desc: 'Domain Security & SSL', sales: 'Advanced DNS security, Cloudflare setup, and SSL validation.' },
};


export async function GET() {
  try {
    const services = await prisma.service.findMany();
    const mappedPrices: Record<string, number> = {};

    for (const [key, dbName] of Object.entries(SERVICE_MAPPINGS)) {
      let service = services.find((s) => s.name === dbName);
      
      // Self-healing: seed any missing services on the fly
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { basePrices } = body;

    if (!basePrices) {
      return NextResponse.json({ error: 'Missing basePrices' }, { status: 400 });
    }

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
    console.error('Error updating base prices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientCity, salesperson, industry, stage, goal, secondaryGoal, tertiaryGoal, businessDescription, tierName, monthly, items } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'Missing clientName' }, { status: 400 });
    }

    // 1. Create or find customer profile
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

    // 2. Fetch services and evaluate rules dynamically to get recommendation rules
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

    // 4. Log client assessment survey details
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

    // 5. Create Quotation record
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${year}-${random}`;

    const subtotal = Number(monthly);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + tax;

    const quotation = await prisma.$transaction(async (tx) => {
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
    console.error('Error saving quick quote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
