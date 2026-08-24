const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Strip HTML tags from product descriptions
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.serviceRule.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.service.deleteMany({});

  console.log('Seeding Services from Product Catalog...');
  const services = await Promise.all([
    // ── Social Media Plans ───────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'Social Media Management – Basic (1 Month)',
        minPrice: 20000,
        maximumPrice: 50000,
        description: 'Deliverables: 10-12 creative posts, festival creatives, stories & deal posts with captions and hashtags. Basic profile optimization and consistent brand presence.',
        salesDescription: 'Kickstart your social media with a professionally managed 1-month campaign.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Social Media Management – Silver (3 Months)',
        minPrice: 80000,
        maximumPrice: 150000,
        description: 'Deliverables: 10–12 creative posts, festival creatives, stories & deal posts with captions and hashtags. Basic profile optimization and consistent brand presence.',
        salesDescription: 'Build brand consistency with 3 months of managed social media content.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Social Media Management – Gold (6 Months)',
        minPrice: 150000,
        maximumPrice: 280000,
        description: 'Deliverables: 15-16 Creative posts, stories, deal creatives & reel creatives with monthly content planning. Improved engagement, basic analytics & steady brand growth.',
        salesDescription: 'Accelerate engagement with a 6-month full-service social media strategy.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Social Media Management – Premium (11+1 Months)',
        minPrice: 280000,
        maximumPrice: 500000,
        description: 'Deliverables: 20-24 High-quality posts, stories, reels, deals & festival creatives with advanced strategy. Complete brand building, analytics, profile optimization & long-term growth focus.',
        salesDescription: 'The ultimate social media growth package — build a market-leading brand presence.',
      },
    }),

    // ── Paid Ads ─────────────────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'Paid Ads Management – Silver (Basic Package)',
        minPrice: 30000,
        maximumPrice: 40000,
        description: 'Basic Package (₹30,000 – ₹40,000 / Month + ₹2,000 One-Time Setup + Landing pages). Ad account setup, campaign creation & management, audience targeting, basic creatives guidance, conversion tracking, weekly performance monitoring & monthly report. (Ad spend client paid)',
        salesDescription: 'Launch targeted paid ad campaigns to generate leads and drive measurable results.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Paid Ads Management – Gold (Premium Package)',
        minPrice: 45000,
        maximumPrice: 50000,
        description: 'Premium Package (₹45,000 – ₹50,000 / Month + ₹5,000 One-Time Setup + Landing pages). Complete ad strategy & funnel setup, advanced audience targeting, multiple ad creatives & A/B testing, conversion & remarketing setup, daily optimization, detailed weekly + monthly performance reports. (Ad spend client paid)',
        salesDescription: 'Maximize ROI with a fully managed premium paid ads strategy including A/B testing and remarketing.',
      },
    }),

    // ── SEO ───────────────────────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'SEO – 2 Months',
        minPrice: 30000,
        maximumPrice: 120000,
        description: 'Deliverables: Basic on-page SEO, keyword research and initial backlinks. Strong foundation to improve website visibility.',
        salesDescription: 'Lay the groundwork for higher Google rankings with a focused 2-month SEO campaign.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'SEO – Silver (3 Months)',
        minPrice: 60000,
        maximumPrice: 120000,
        description: 'Deliverables: Basic on-page SEO, keyword research and initial backlinks. Strong foundation to improve website visibility.',
        salesDescription: 'Build organic traffic with 3 months of targeted SEO optimization.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'SEO – Gold (6 Months)',
        minPrice: 120000,
        maximumPrice: 180000,
        description: 'Deliverables: Advanced SEO, quality backlinks and content optimization. Better rankings, traffic growth and monthly reports.',
        salesDescription: 'Achieve stronger rankings and consistent organic traffic growth over 6 months.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'SEO – Platinum (11+1 Months)',
        minPrice: 180000,
        maximumPrice: 250000,
        description: 'Deliverables: Complete SEO with high-authority backlinks & technical optimization. Top rankings, long-term organic traffic and full performance tracking.',
        salesDescription: 'Dominate search results with a 12-month platinum SEO strategy.',
      },
    }),

    // ── Website Development ───────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'Website – 1 Pager',
        minPrice: 10000,
        maximumPrice: 25000,
        description: 'Single scroll responsive website with professional design, contact form & WhatsApp button. Domain not included, server included (valid for 6 months), fast-loading & enquiry-ready website.',
        salesDescription: 'A clean, fast, single-page website that captures leads and drives enquiries.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Website – Basic (5-Page)',
        minPrice: 20000,
        maximumPrice: 60000,
        description: '5-page responsive website with professional design, contact form, WhatsApp button & basic SEO.',
        salesDescription: 'A professional 5-page website with SEO foundation to establish your digital presence.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Website – E-Commerce',
        minPrice: 60000,
        maximumPrice: 120000,
        description: 'Online store with products, cart, checkout, payment gateway & order management system.',
        salesDescription: 'Sell online with a fully featured e-commerce store with payment gateway integration.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Website – Custom / Advanced (E-Commerce or Dynamic)',
        minPrice: 150000,
        maximumPrice: 500000,
        description: 'Custom high-performance e-commerce website with advanced features & scalable architecture (Next.js / PHP). Or: Custom dynamic website with admin panel, lead management, SEO & performance optimization.',
        salesDescription: 'Enterprise-grade custom website built for performance, scale, and advanced functionality.',
      },
    }),

    // ── Logo & Branding ──────────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'Logo Design – Standard',
        minPrice: 5000,
        maximumPrice: 15000,
        description: 'Deliverables: 1 logo concept, 2–3 options with all logo files.',
        salesDescription: 'Get a professional logo for your brand at an affordable price.',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Logo Design – Premium',
        minPrice: 20000,
        maximumPrice: 30000,
        description: 'Deliverables: 4–5 logo concepts, multiple revisions, final logo files (PNG, JPG, SVG, PDF), brand guidelines, color palette, fonts, black & white versions and mockups.',
        salesDescription: 'A premium brand identity package with full logo concepts, guidelines, and mockups.',
      },
    }),

    // ── Domain Security ──────────────────────────────────────────────────────
    prisma.service.create({
      data: {
        name: 'Domain Security & Protection',
        minPrice: 25000,
        maximumPrice: 75000,
        description: 'Domain lock, WHOIS privacy protection, DNS security & unauthorized transfer protection. SSL guidance, renewal monitoring & basic security setup to keep domain safe and protected.',
        salesDescription: 'Protect your brand online with comprehensive domain security and privacy services.',
      },
    }),
  ]);

  const serviceMap = {};
  services.forEach(s => { serviceMap[s.name] = s.id; });
  console.log(`Seeded ${services.length} services.`);

  console.log('Seeding Questions...');
  const questions = await Promise.all([
    // Section 1 – Business Profile
    prisma.question.create({
      data: { question: 'Business Name', questionType: 'text', required: true, displayOrder: 1 },
    }),
    prisma.question.create({
      data: {
        question: 'What type of business do you operate?',
        questionType: 'single_choice',
        options: ['E-commerce / Online Store', 'SaaS / Tech Product', 'Local Business / Retail', 'Agency / Consulting', 'Education / Coaching', 'Real Estate', 'Healthcare / Clinic', 'Other'],
        required: true,
        displayOrder: 2,
      },
    }),
    prisma.question.create({
      data: {
        question: 'Business Size',
        questionType: 'single_choice',
        options: ['Micro (1-5 employees)', 'Small (6-20 employees)', 'Medium (21-100 employees)', 'Large (100+ employees)'],
        required: true,
        displayOrder: 3,
      },
    }),
    prisma.question.create({
      data: {
        question: 'Do you have an active website?',
        questionType: 'single_choice',
        options: ['Yes - Active & Modern', 'Yes - Needs Redesign/SEO', 'No - We do not have a website'],
        required: true,
        displayOrder: 4,
      },
    }),

    // Section 2 – Marketing Presence
    prisma.question.create({
      data: {
        question: 'Which social media channels do you actively use?',
        questionType: 'multi_choice',
        options: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Google Business Profile', 'None / Starting Fresh'],
        required: true,
        displayOrder: 5,
      },
    }),
    prisma.question.create({
      data: {
        question: 'Are you currently running paid advertisements?',
        questionType: 'single_choice',
        options: ['Yes - Running Meta Ads', 'Yes - Running Google Ads', 'Yes - Running both Meta & Google Ads', 'No - Not running paid ads'],
        required: true,
        displayOrder: 6,
      },
    }),

    // Section 3 – Marketing Goals
    prisma.question.create({
      data: {
        question: 'What are your primary marketing goals?',
        questionType: 'multi_choice',
        options: ['Generate Leads', 'Increase Sales/Conversions', 'Brand Awareness', 'Increase Website Traffic', 'Improve Search Engine Rankings (SEO)', 'Build Social Media Presence'],
        required: true,
        displayOrder: 7,
      },
    }),

    // Section 4 – Target Audience
    prisma.question.create({
      data: {
        question: 'What is your target audience location?',
        questionType: 'single_choice',
        options: ['Local / City-wide', 'Regional / State-wide', 'Pan India / National', 'International / Global'],
        required: true,
        displayOrder: 8,
      },
    }),

    // Section 5 – Budget
    prisma.question.create({
      data: {
        question: 'What is your monthly marketing budget?',
        questionType: 'single_choice',
        options: ['Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'],
        required: true,
        displayOrder: 9,
      },
    }),

    // Section 6 – Timeline
    prisma.question.create({
      data: {
        question: 'When do you want to start?',
        questionType: 'single_choice',
        options: ['Immediately', 'Within 1 month', '1–3 months', 'Just exploring / No set timeline'],
        required: true,
        displayOrder: 10,
      },
    }),
  ]);

  // Map question IDs for rules
  const qWebsite = questions.find(q => q.question.includes('website'));
  const qGoals = questions.find(q => q.question.includes('primary marketing goals'));
  const qBudget = questions.find(q => q.question.includes('marketing budget'));

  console.log('Seeding Service Rules...');
  await prisma.serviceRule.createMany({
    data: [
      // Social Media: Brand Awareness goal
      {
        serviceId: serviceMap['Social Media Management – Basic (1 Month)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Build Social Media Presence' },
        priority: 1,
      },
      {
        serviceId: serviceMap['Social Media Management – Basic (1 Month)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Brand Awareness' },
        priority: 2,
      },
      {
        serviceId: serviceMap['Social Media Management – Silver (3 Months)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Brand Awareness' },
        priority: 1,
      },

      // Paid Ads: Lead Gen & Sales goals
      {
        serviceId: serviceMap['Paid Ads Management – Silver (Basic Package)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Generate Leads' },
        priority: 1,
      },
      {
        serviceId: serviceMap['Paid Ads Management – Silver (Basic Package)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Increase Sales/Conversions' },
        priority: 1,
      },
      {
        serviceId: serviceMap['Paid Ads Management – Gold (Premium Package)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Increase Sales/Conversions' },
        priority: 2,
      },

      // SEO: Search Rankings goal
      {
        serviceId: serviceMap['SEO – 2 Months'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Improve Search Engine Rankings (SEO)' },
        priority: 1,
      },
      {
        serviceId: serviceMap['SEO – Silver (3 Months)'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Improve Search Engine Rankings (SEO)' },
        priority: 2,
      },
      {
        serviceId: serviceMap['SEO – 2 Months'],
        condition: { field: String(qGoals.id), operator: 'contains', value: 'Increase Website Traffic' },
        priority: 2,
      },

      // Website: No website
      {
        serviceId: serviceMap['Website – 1 Pager'],
        condition: { field: String(qWebsite.id), operator: 'equals', value: 'No - We do not have a website' },
        priority: 1,
      },
      {
        serviceId: serviceMap['Website – Basic (5-Page)'],
        condition: { field: String(qWebsite.id), operator: 'equals', value: 'No - We do not have a website' },
        priority: 2,
      },
      {
        serviceId: serviceMap['Website – Basic (5-Page)'],
        condition: { field: String(qWebsite.id), operator: 'equals', value: 'Yes - Needs Redesign/SEO' },
        priority: 1,
      },

      // E-Commerce: For e-commerce business type
      {
        serviceId: serviceMap['Website – E-Commerce'],
        condition: { field: String(questions.find(q => q.question.includes('type of business')).id), operator: 'equals', value: 'E-commerce / Online Store' },
        priority: 1,
      },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log(`  - ${services.length} services seeded`);
  console.log(`  - ${questions.length} questions seeded`);
  console.log('  - 14 service rules seeded');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
