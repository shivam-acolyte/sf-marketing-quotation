const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
const XLSX_PATH = path.join(__dirname, '..', 'Product (product.template) (6).xlsx');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Sales Descriptions lookup based on original seeds
const SALES_DESCRIPTIONS = {
  '1 Month (Basic) - Social Media Plan': 'Kickstart your social media with a professionally managed 1-month campaign.',
  '3 Months (Silver) - Social Media Plan': 'Build brand consistency with 3 months of managed social media content.',
  '6 Months (Gold) - Social Media Plan': 'Accelerate engagement with a 6-month full-service social media strategy.',
  '11+1 Months (Premium) - Social Media Plan': 'The ultimate social media growth package — build a market-leading brand presence.',
  'Paid Ads (Silver) - Basic Package': 'Launch targeted paid ad campaigns to generate leads and drive measurable results.',
  'Paid Ads (Gold) - Premium Package': 'Maximize ROI with a fully managed premium paid ads strategy including A/B testing and remarketing.',
  'SEO 2-Months': 'Lay the groundwork for higher Google rankings with a focused 2-month SEO campaign.',
  'SEO Silver 3-Months': 'Build organic traffic with 3 months of targeted SEO optimization.',
  'SEO Gold 6-Months': 'Achieve stronger rankings and consistent organic traffic growth over 6 months.',
  'SEO Platinum 11+1 - Months': 'Dominate search results with a 12-month platinum SEO strategy.',
  '1 Pager Website': 'A clean, fast, single-page website that captures leads and drives enquiries.',
  'BASIC WEBSITE': 'A professional 5-page website with SEO foundation to establish your digital presence.',
  'E-COMMERCE WEBSITE': 'Sell online with a fully featured e-commerce store with payment gateway integration.',
  'CUSTOM / ADVANCED E-COMMERCE WEBSITE': 'Enterprise-grade custom website built for performance, scale, and advanced functionality.',
  'Standard Logo Desing': 'Get a professional logo for your brand at an affordable price.',
  'Premium Logo  Design': 'A premium brand identity package with full logo concepts, guidelines, and mockups.',
  'DOMAIN SECURITY': 'Protect your brand online with comprehensive domain security and privacy services.',
  'Monthly recurring payment': 'Monthly subscription payment method.',
  'One Time Payment': 'One-time project payment method.'
};

function initDb() {
  console.log('Reading XLSX file from:', XLSX_PATH);
  const workbook = xlsx.readFile(XLSX_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`Processing ${rows.length} rows from Excel sheet...`);
  const now = new Date().toISOString();
  
  const services = rows.map((row, index) => {
    const id = index + 1;
    const name = String(row['Name']).trim();
    const minPrice = Number(row['Sales Price']) || 0;
    const maximumPrice = Number(row['Maximum Price']) || 0;
    const description = row['Description'] ? String(row['Description']).trim() : '';
    const salesDescription = SALES_DESCRIPTIONS[name] || description.replace(/<[^>]+>/g, ' ').substring(0, 100);

    return {
      id,
      name,
      minPrice,
      maximumPrice,
      description,
      salesDescription,
      active: true,
      createdAt: now,
      updatedAt: now
    };
  });

  // Write services.json
  fs.writeFileSync(path.join(DATA_DIR, 'services.json'), JSON.stringify(services, null, 2));
  console.log('Saved services.json');

  // Define questions based on seed
  const questions = [
    { id: 1, question: 'Business Name', questionType: 'text', required: true, displayOrder: 1, active: true, createdAt: now },
    {
      id: 2,
      question: 'What type of business do you operate?',
      questionType: 'single_choice',
      options: ['E-commerce / Online Store', 'SaaS / Tech Product', 'Local Business / Retail', 'Agency / Consulting', 'Education / Coaching', 'Real Estate', 'Healthcare / Clinic', 'Other'],
      required: true,
      displayOrder: 2,
      active: true,
      createdAt: now
    },
    {
      id: 3,
      question: 'Business Size',
      questionType: 'single_choice',
      options: ['Micro (1-5 employees)', 'Small (6-20 employees)', 'Medium (21-100 employees)', 'Large (100+ employees)'],
      required: true,
      displayOrder: 3,
      active: true,
      createdAt: now
    },
    {
      id: 4,
      question: 'Do you have an active website?',
      questionType: 'single_choice',
      options: ['Yes - Active & Modern', 'Yes - Needs Redesign/SEO', 'No - We do not have a website'],
      required: true,
      displayOrder: 4,
      active: true,
      createdAt: now
    },
    {
      id: 5,
      question: 'Which social media channels do you actively use?',
      questionType: 'multi_choice',
      options: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Google Business Profile', 'None / Starting Fresh'],
      required: true,
      displayOrder: 5,
      active: true,
      createdAt: now
    },
    {
      id: 6,
      question: 'Are you currently running paid advertisements?',
      questionType: 'single_choice',
      options: ['Yes - Running Meta Ads', 'Yes - Running Google Ads', 'Yes - Running both Meta & Google Ads', 'No - Not running paid ads'],
      required: true,
      displayOrder: 6,
      active: true,
      createdAt: now
    },
    {
      id: 7,
      question: 'What are your primary marketing goals?',
      questionType: 'multi_choice',
      options: ['Generate Leads', 'Increase Sales/Conversions', 'Brand Awareness', 'Increase Website Traffic', 'Improve Search Engine Rankings (SEO)', 'Build Social Media Presence'],
      required: true,
      displayOrder: 7,
      active: true,
      createdAt: now
    },
    {
      id: 8,
      question: 'What is your target audience location?',
      questionType: 'single_choice',
      options: ['Local / City-wide', 'Regional / State-wide', 'Pan India / National', 'International / Global'],
      required: true,
      displayOrder: 8,
      active: true,
      createdAt: now
    },
    {
      id: 9,
      question: 'What is your monthly marketing budget?',
      questionType: 'single_choice',
      options: ['Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'],
      required: true,
      displayOrder: 9,
      active: true,
      createdAt: now
    },
    {
      id: 10,
      question: 'When do you want to start?',
      questionType: 'single_choice',
      options: ['Immediately', 'Within 1 month', '1–3 months', 'Just exploring / No set timeline'],
      required: true,
      displayOrder: 10,
      active: true,
      createdAt: now
    }
  ];

  // Write questions.json
  fs.writeFileSync(path.join(DATA_DIR, 'questions.json'), JSON.stringify(questions, null, 2));
  console.log('Saved questions.json');

  // Define rules referencing Excel service names
  const serviceIdMap = {};
  services.forEach(s => {
    serviceIdMap[s.name] = s.id;
  });

  const rawRules = [
    // Social Media: Brand Awareness goal (Question ID 7)
    { serviceName: '1 Month (Basic) - Social Media Plan', field: '7', operator: 'contains', value: 'Build Social Media Presence', priority: 1 },
    { serviceName: '1 Month (Basic) - Social Media Plan', field: '7', operator: 'contains', value: 'Brand Awareness', priority: 2 },
    { serviceName: '3 Months (Silver) - Social Media Plan', field: '7', operator: 'contains', value: 'Brand Awareness', priority: 1 },

    // Paid Ads: Lead Gen & Sales goals (Question ID 7)
    { serviceName: 'Paid Ads (Silver) - Basic Package', field: '7', operator: 'contains', value: 'Generate Leads', priority: 1 },
    { serviceName: 'Paid Ads (Silver) - Basic Package', field: '7', operator: 'contains', value: 'Increase Sales/Conversions', priority: 1 },
    { serviceName: 'Paid Ads (Gold) - Premium Package', field: '7', operator: 'contains', value: 'Increase Sales/Conversions', priority: 2 },

    // SEO: Search Rankings goal (Question ID 7)
    { serviceName: 'SEO 2-Months', field: '7', operator: 'contains', value: 'Improve Search Engine Rankings (SEO)', priority: 1 },
    { serviceName: 'SEO Silver 3-Months', field: '7', operator: 'contains', value: 'Improve Search Engine Rankings (SEO)', priority: 2 },
    { serviceName: 'SEO 2-Months', field: '7', operator: 'contains', value: 'Increase Website Traffic', priority: 2 },

    // Website: No website (Question ID 4)
    { serviceName: '1 Pager Website', field: '4', operator: 'equals', value: 'No - We do not have a website', priority: 1 },
    { serviceName: 'BASIC WEBSITE', field: '4', operator: 'equals', value: 'No - We do not have a website', priority: 2 },
    { serviceName: 'BASIC WEBSITE', field: '4', operator: 'equals', value: 'Yes - Needs Redesign/SEO', priority: 1 },

    // E-Commerce: For e-commerce business type (Question ID 2)
    { serviceName: 'E-COMMERCE WEBSITE', field: '2', operator: 'equals', value: 'E-commerce / Online Store', priority: 1 }
  ];

  let ruleIdCounter = 1;
  const serviceRules = rawRules.map(rr => {
    const serviceId = serviceIdMap[rr.serviceName];
    if (!serviceId) {
      console.warn(`WARNING: Could not find service with name: "${rr.serviceName}" to map rule.`);
    }
    return {
      id: ruleIdCounter++,
      serviceId: serviceId || null,
      condition: { field: rr.field, operator: rr.operator, value: rr.value },
      priority: rr.priority,
      active: true,
      createdAt: now
    };
  }).filter(r => r.serviceId !== null);

  // Write service_rules.json
  fs.writeFileSync(path.join(DATA_DIR, 'service_rules.json'), JSON.stringify(serviceRules, null, 2));
  console.log('Saved service_rules.json');

  // Initialize other files if they don't exist
  const emptyTables = ['customers.json', 'assessments.json', 'quotations.json', 'quotation_items.json'];
  emptyTables.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      console.log(`Initialized empty file ${file}`);
    }
  });

  console.log('Database initialization completed successfully!');
}

initDb();
