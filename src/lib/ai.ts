import { OpenAI } from 'openai';
import { Service } from '@prisma/client';

export interface ServiceOption {
  name: string;
  price_modifier: number;
  description: string;
  selected: boolean;
}

export interface AIAnalysisResult {
  business_summary: string;
  primary_goals: string[];
  recommended_services: {
    service_id: number;
    reason: string;
    options: ServiceOption[];
  }[];
  strategy_summary: string;
  priority: 'high' | 'medium' | 'low';
}

// Smart value resolver to support both quick-quote (1, 2, 3, 7) and questionnaire (DB question IDs or field names)
function findAnswerValue(answers: Record<string, any>, possibleKeys: string[], keywords: string[]): any {
  // 1. Try exact keys
  for (const pk of possibleKeys) {
    if (answers[pk] !== undefined && answers[pk] !== null && answers[pk] !== '') {
      return answers[pk];
    }
  }
  // 2. Try case-insensitive matching on key names
  for (const [k, val] of Object.entries(answers)) {
    const lowerK = k.toLowerCase();
    if (keywords.some(kw => lowerK.includes(kw))) {
      return val;
    }
  }
  return null;
}

// Fallback logic in case OpenAI API key is missing or call fails
export function getMockAIAnalysis(
  answers: Record<string, any>,
  recommendedServices: Service[]
): AIAnalysisResult {
  // 1. Resolve key answers
  const businessName = findAnswerValue(answers, ['1', 'clientName', 'business_name'], ['name', 'company']) || 'Your Business';
  const industry = findAnswerValue(answers, ['2', 'industry', 'type_of_business'], ['type', 'industry', 'sector', 'operate']) || 'General Business';
  const size = findAnswerValue(answers, ['3', 'business_size', 'stage'], ['size', 'employee', 'stage']) || 'Growing';
  const websiteStatus = findAnswerValue(answers, ['4', 'website', 'active_website'], ['website', 'site']) || 'No - We do not have a website';
  const location = findAnswerValue(answers, ['8', 'target_location', 'location'], ['location', 'audience', 'geography']) || 'National';
  const budget = findAnswerValue(answers, ['9', 'budget', 'monthly_budget'], ['budget', 'spend', 'investment']) || '₹25,000 – ₹50,000';
  const timeline = findAnswerValue(answers, ['10', 'timeline', 'start_date'], ['timeline', 'start', 'time']) || 'Within 1 month';

  // Extract primary goals
  const rawGoals = findAnswerValue(answers, ['7', 'goals', 'primary_goals'], ['goal', 'objective', 'target']) || [];
  const primary_goals = Array.isArray(rawGoals) ? rawGoals : [String(rawGoals)];

  const industryStr = String(industry).toLowerCase();
  const goalsStr = primary_goals.map(g => String(g).toLowerCase()).join(' ');

  // 2. Classify Industry Core focus
  let industryFocus = 'growth';
  let industryPhrase = 'optimizing marketing reach';
  if (industryStr.includes('ecommerce') || industryStr.includes('store') || industryStr.includes('retail')) {
    industryFocus = 'ecommerce';
    industryPhrase = 'increasing online sales, streamlining checkout conversions, and lowering customer acquisition cost (CAC)';
  } else if (industryStr.includes('saas') || industryStr.includes('tech') || industryStr.includes('software')) {
    industryFocus = 'saas';
    industryPhrase = 'driving qualified product sign-ups, nurturing professional B2B leads, and establishing domain authority';
  } else if (industryStr.includes('local') || industryStr.includes('brick') || industryStr.includes('clinic') || industryStr.includes('store')) {
    industryFocus = 'local';
    industryPhrase = 'maximizing local search discoverability, driving regional foot traffic, and converting local maps intent';
  } else if (industryStr.includes('agency') || industryStr.includes('consulting') || industryStr.includes('service')) {
    industryFocus = 'b2b_service';
    industryPhrase = 'generating high-ticket consulting leads, building strategic B2B trust, and capturing industry authority';
  } else if (industryStr.includes('real estate') || industryStr.includes('property')) {
    industryFocus = 'realestate';
    industryPhrase = 'generating high-intent property inquiries, building visual brand trust, and capturing localized buyer leads';
  }

  // 3. Dynamic service explanations and customizable options based on Industry Focus, Website Status, and Goals
  const serviceAnalysis = recommendedServices.map((service) => {
    const serviceName = service.name.toLowerCase();
    let reason = '';
    const options: ServiceOption[] = [];

    // --- Dynamic Reasons & Options Generation ---
    if (serviceName.includes('social media')) {
      if (industryFocus === 'ecommerce') {
        reason = `For an e-commerce brand, consistent organic social media builds lifestyle validation and client social proof that directly drives direct-to-consumer trust.`;
        options.push(
          { name: 'Product Showcase Reels & Video Editing', price_modifier: 3000, description: 'Creative product review videos and styling clips (4 reels/mo).', selected: true },
          { name: 'User Generated Content (UGC) sourcing', price_modifier: 2000, description: 'Source & license authentic customer video reviews.', selected: false },
          { name: 'DM Sales Auto-link Responder setup', price_modifier: 1500, description: 'Automation to instantly reply to product comments with shop links.', selected: true }
        );
      } else if (industryFocus === 'local') {
        reason = `Regular social posts and community updates highlight your local footprint, showing active engagement to nearby prospective clients.`;
        options.push(
          { name: 'Local community tagging & updates', price_modifier: 1500, description: 'Post updates sharing local event setups and partner reviews.', selected: true },
          { name: 'Review builder graphic campaigns', price_modifier: 1000, description: 'Graphics encouraging guests to post reviews on Google maps.', selected: true },
          { name: 'Localized coupon campaign assets', price_modifier: 1000, description: 'Custom flyer graphics for in-store seasonal deals.', selected: false }
        );
      } else if (industryFocus === 'saas' || industryFocus === 'b2b_service') {
        reason = `LinkedIn and professional channel management will establish thought leadership, sharing industry insights and product updates to attract corporate clients.`;
        options.push(
          { name: 'LinkedIn thought leadership carousels', price_modifier: 4000, description: 'In-depth slide carousels highlighting B2B platform details.', selected: true },
          { name: 'Industry statistics charts & graphics', price_modifier: 2500, description: 'Graph layouts explaining key industry pain-points & data.', selected: true },
          { name: 'B2B Client success review carousels', price_modifier: 3000, description: 'Visual testimonials summarizing partner ROI numbers.', selected: false }
        );
      } else if (industryFocus === 'realestate') {
        reason = `Credibility and high-quality visuals are key. A modern social layout showcases properties, builds agent trust, and captures local buyer inquiries.`;
        options.push(
          { name: 'Luxury property tour reels (3/mo)', price_modifier: 5000, description: 'High-quality walk-through edits optimized for Instagram/TikTok.', selected: true },
          { name: 'Agent branding templates', price_modifier: 2000, description: 'Uniform frame overlay templates for listing photos.', selected: true },
          { name: 'Local neighborhood guides', price_modifier: 1500, description: 'Posts detailing school profiles, transport & cafes near properties.', selected: false }
        );
      } else {
        reason = `Consistent brand styling and high-quality posts across key channels establish immediate market credibility and keep your business top-of-mind.`;
        options.push(
          { name: 'Custom Brand Layout Board template', price_modifier: 2000, description: 'Color layout preset for structured grid posts.', selected: true },
          { name: 'Weekly post comment replies monitoring', price_modifier: 1500, description: 'Algorithm boost by reply moderation on posts.', selected: false }
        );
      }
    } 
    else if (serviceName.includes('paid ads') || serviceName.includes('google ads') || serviceName.includes('meta ads')) {
      if (goalsStr.includes('sales') || goalsStr.includes('conversion') || industryFocus === 'ecommerce') {
        reason = `Direct-response Meta & Google shopping ad funnels are selected to capture high-intent buyers, driving immediate transaction volume and scaling store sales.`;
        options.push(
          { name: 'Meta Catalog inventory feed setup', price_modifier: 3000, description: 'Product sync directly mapping inventory to Meta catalog ads.', selected: true },
          { name: 'Abandoned Checkout retargeting campaign', price_modifier: 2500, description: 'Target cart abandoners with dynamic discount ads.', selected: true },
          { name: 'Dynamic Product Ads creative overlays', price_modifier: 2000, description: 'Custom frame branding overlays for catalogue images.', selected: false }
        );
      } else if (goalsStr.includes('lead') || industryFocus === 'b2b_service' || industryFocus === 'realestate') {
        reason = `Paid ads will target high-converting landing pages specifically designed for lead capture, generating qualified client inquiries quickly.`;
        options.push(
          { name: 'LinkedIn Lead Gen Native Forms setup', price_modifier: 4000, description: 'Lead-generation forms directly inside LinkedIn for lower CPL.', selected: true },
          { name: 'Google Search competitor bidding campaign', price_modifier: 3500, description: 'Bid on competitor brand terms to capture high-intent traffic.', selected: true },
          { name: 'CAPI Advanced Conversion API setup', price_modifier: 2000, description: 'Server-to-server tracking setup for precise B2B attribution.', selected: false }
        );
      } else {
        reason = `Targeted search and social ads bypass organic algorithm reach limits, quickly putting your services in front of your specific audience demographics.`;
        options.push(
          { name: 'A/B Creative visual & copy variations', price_modifier: 1500, description: 'Create and test 3 distinct copy & image variations.', selected: true },
          { name: 'Landing Page Conversion Rate CRO audit', price_modifier: 2000, description: 'Detailed visual evaluation and load-speed optimization recommendations.', selected: false }
        );
      }
    } 
    else if (serviceName.includes('seo')) {
      if (industryFocus === 'saas' || industryFocus === 'b2b_service') {
        reason = `B2B research starts on Google. Ranking organically for primary intent keywords will drive sustainable, high-authority monthly inbound leads.`;
        options.push(
          { name: 'Deep-dive B2B Blog content (2 posts/mo)', price_modifier: 5000, description: 'SEO-targeted 1,500+ word expert blog posts.', selected: true },
          { name: 'Competitor organic keyword gap analysis', price_modifier: 3000, description: 'Target valuable search terms ranked by competitors.', selected: true },
          { name: 'Technical Core Web Vitals optimization', price_modifier: 4000, description: 'Compress server assets to pass Google mobile speed checks.', selected: false }
        );
      } else if (industryFocus === 'ecommerce') {
        reason = `Optimizing organic product descriptions and collections will capture transactional search traffic without paying escalating click costs.`;
        options.push(
          { name: 'Product schema & price snippets markup', price_modifier: 2500, description: 'Structured markup showing ratings and stock details in search.', selected: true },
          { name: 'Collection page SEO description writing', price_modifier: 3000, description: 'Write content-rich category descriptions for search ranking.', selected: true },
          { name: 'Product image alt-text crawl optimization', price_modifier: 1500, description: 'Enable image descriptions to drive traffic via Google Images.', selected: false }
        );
      } else {
        reason = `Technical on-page optimization and quality backlinks build search engine authority, generating cost-effective, long-term traffic that converts.`;
        options.push(
          { name: 'On-page Title tags & Meta previews cleanup', price_modifier: 1500, description: 'Optimize organic preview metadata for better click rate.', selected: true },
          { name: 'Local city-targeted keywords injection', price_modifier: 1500, description: 'Adapt text pages to target city-wide search phrases.', selected: true }
        );
      }
    } 
    else if (serviceName.includes('website')) {
      const needsRedesign = String(websiteStatus).toLowerCase().includes('needs') || String(websiteStatus).toLowerCase().includes('redesign');
      const noWeb = String(websiteStatus).toLowerCase().includes('no') || String(websiteStatus).toLowerCase().includes('do not');

      if (noWeb) {
        reason = `Your business currently lacks an active website. Building a fast, responsive, conversion-ready site is the essential first step to close any leads we drive.`;
      } else if (needsRedesign) {
        reason = `Your existing site risks losing potential customers due to legacy design/speed issues. A modern, optimized rebuild will double conversion rates.`;
      } else {
        reason = `A premium, fast-loading storefront or landing page structure ensures immediate trust and provides a frictionless conversion path for all campaign traffic.`;
      }

      if (industryFocus === 'ecommerce') {
        options.push(
          { name: 'Secure payment gateway sync (UPI, cards)', price_modifier: 5000, description: 'Complete integration with payment systems (Razorpay/Stripe).', selected: true },
          { name: 'Cart recovery automated email trigger', price_modifier: 4000, description: 'Automated email sequence sent to users leaving active carts.', selected: true },
          { name: 'Inventory sync api integration', price_modifier: 6000, description: 'Synchronize web listings with physical stock APIs.', selected: false }
        );
      } else if (industryFocus === 'saas' || industryFocus === 'b2b_service') {
        options.push(
          { name: 'Calendly scheduling widget calendar embed', price_modifier: 1500, description: 'Embed a direct meeting calendar on site for sales bookings.', selected: true },
          { name: 'Dynamic plan pricing monthly/annual toggle', price_modifier: 4000, description: 'A clean interactive price plan selection display.', selected: true },
          { name: 'B2B Case Study testimonial widget slider', price_modifier: 2000, description: 'Interactive slider showing partner logos and success quotes.', selected: false }
        );
      } else {
        options.push(
          { name: 'Lead capture forms with auto-responders', price_modifier: 1500, description: 'Custom forms with instant automatic welcome emails.', selected: true },
          { name: 'Floating WhatsApp direct link button', price_modifier: 500, description: 'A floating bubble button redirecting clients to chat.', selected: true }
        );
      }
    } 
    else if (serviceName.includes('logo') || serviceName.includes('branding')) {
      reason = `A premium, modern logo and cohesive brand assets establish instant market authority, ensuring you look like an industry leader from day one.`;
      options.push(
        { name: 'Typography suite & brand color guidelines', price_modifier: 1500, description: 'Defines typography weights and brand colors for print/web.', selected: true },
        { name: 'Stationery template package', price_modifier: 2500, description: 'Designs for business cards, invoices, and letterheads.', selected: false }
      );
    } 
    else if (serviceName.includes('security')) {
      reason = `Proactive domain security, SSL certificates, and WHOIS privacy protect your brand reputation, prevent costly downtime, and build customer check-out trust.`;
      options.push(
        { name: 'Cloudflare CDN & advanced firewall setup', price_modifier: 3000, description: 'Setup caching, DNS protection, and DDoS filter shield.', selected: true },
        { name: 'Automated database daily backup rotation', price_modifier: 2000, description: 'Configure daily database backups to cloud backup vaults.', selected: true }
      );
    } 
    else if (serviceName.includes('google business') || serviceName.includes('gmb')) {
      reason = `Optimizing your Google Business Profile is critical for local search prominence, helping nearby buyers find your location and read reviews.`;
      options.push(
        { name: 'Local citation registry directories listings', price_modifier: 2000, description: 'Submit matching details to top 15 maps citation directories.', selected: true },
        { name: 'Maps review QR code flyer builder', price_modifier: 1500, description: 'Create a custom print flyer template with scan link.', selected: false }
      );
    } 
    else {
      reason = `Highly recommended service to support your marketing operations and accelerate your ${industry} business growth goals.`;
      options.push(
        { name: 'Operational setup & initial configurations', price_modifier: 0, description: 'Base-level launch onboarding parameters.', selected: true }
      );
    }

    return {
      service_id: service.id,
      reason,
      options,
    };
  });

  // 4. Generate industry-specific overall strategy summary
  let strategy_summary = '';
  const isBudgetLean = String(budget).toLowerCase().includes('under 10') || String(budget).toLowerCase().includes('10,000 –');

  if (industryFocus === 'ecommerce') {
    strategy_summary = `We will deploy a highly-optimized e-commerce acquisition funnel. Our priority is driving direct storefront conversion volume using conversion-targeted Meta shopping ads, supported by ongoing organic SEO to build long-term transactional search traffic.`;
  } else if (industryFocus === 'saas' || industryFocus === 'b2b_service') {
    strategy_summary = `Our strategy focuses on generating high-ticket inbound inquiries. We will combine high-intent Google Search advertising with strategic LinkedIn organic content, backed by on-page SEO optimization to capture buyers at every stage of the decision-making cycle.`;
  } else if (industryFocus === 'local') {
    strategy_summary = `To capture local market share, we will execute a hyper-local search discovery campaign. This includes detailed Google Maps optimization and active local community social media management, supported by localized geo-targeted paid ads.`;
  } else if (industryFocus === 'realestate') {
    strategy_summary = `A visual-first lead generation campaign will be implemented. We will launch high-impact lead-generation ads on Meta showcasing properties, supported by professional branding assets and a fast landing page conversion structure.`;
  } else {
    strategy_summary = `A balanced digital marketing strategy focused on building consistent brand credibility through active social media management, coupled with targeted search visibility to capture immediate active demand.`;
  }

  if (isBudgetLean) {
    strategy_summary += ` Given the lean initial budget, we will focus resources strictly on high-impact organic presence and local discovery before scaling paid advertising campaigns.`;
  }

  // 5. Determine priority level
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const timelineStr = String(timeline).toLowerCase();
  if (timelineStr.includes('immediately') || timelineStr.includes('within 1')) {
    priority = 'high';
  } else if (timelineStr.includes('exploring')) {
    priority = 'low';
  }

  return {
    business_summary: `${businessName} is a ${size} company operating in the ${industry} sector, focusing on ${industryPhrase}.`,
    primary_goals: primary_goals.length > 0 ? primary_goals : ['Generate leads and scale brand presence'],
    recommended_services: serviceAnalysis,
    strategy_summary,
    priority,
  };
}

export async function analyzeRequirements(
  answers: Record<string, any>,
  dbServices: Service[],
  ruleRecommendedServices: Service[]
): Promise<AIAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key')) {
    console.log('OpenAI API Key is missing. Falling back to rule-based mock AI analysis.');
    return getMockAIAnalysis(answers, ruleRecommendedServices);
  }

  const openai = new OpenAI({ apiKey });

  try {
    const servicesListText = dbServices
      .map((s) => `ID ${s.id}: "${s.name}" - ${s.description}`)
      .join('\n');

    const recommendedIds = ruleRecommendedServices.map((s) => s.id);

    const prompt = `
You are a strategic digital marketing analyst.
Analyze the following customer requirements and generate a personalized marketing analysis and service recommendation.

CUSTOMER ANSWERS:
${JSON.stringify(answers, null, 2)}

AVAILABLE SERVICES IN OUR DATABASE:
${servicesListText}

SERVICES ALREADY DETERMINED BY RULES:
Service IDs: ${JSON.stringify(recommendedIds)}

TASK:
1. Provide a professional 'business_summary' (1-2 sentences summarizing their business, size, industry, and core presence).
2. Summarize their 'primary_goals' based on their answers.
3. Recommend suitable services. You MUST recommend the services that are already determined by rules (Service IDs: ${JSON.stringify(recommendedIds)}). You can recommend extra services from our database list if they fit, but you must NOT invent services that are not in the list.
4. For each recommended service, provide a personalized, customer-friendly 'reason' explaining exactly why it benefits their specific business.
5. For each recommended service, you MUST also generate 2-3 customizable 'options' (sub-packages or specific deliverables) relevant to their industry. Each option must have a:
   - "name": String name of the deliverable (e.g. "Meta Catalog Feed Sync Setup")
   - "price_modifier": Number (an additional cost, between 500 and 5000, or 0 if included)
   - "description": String describing the option
   - "selected": Boolean (default true/false indicating recommendation level)
6. Provide a cohesive 'strategy_summary' (2-3 sentences outlining the overall tactical strategy).
7. Set the campaign implementation 'priority' (must be 'high', 'medium', or 'low').

RESPONSE FORMAT:
You MUST respond with a single JSON object. Follow this TypeScript structure exactly:
{
  "business_summary": "string",
  "primary_goals": ["string"],
  "recommended_services": [
    {
      "service_id": number,
      "reason": "string explaining why this service fits",
      "options": [
        {
          "name": "string",
          "price_modifier": number,
          "description": "string",
          "selected": boolean
        }
      ]
    }
  ],
  "strategy_summary": "string",
  "priority": "high" | "medium" | "low"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful digital marketing proposal generator. You only respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text) as AIAnalysisResult;

    // Validate structure
    if (!parsed.business_summary || !Array.isArray(parsed.recommended_services)) {
      throw new Error('Invalid JSON structure returned by OpenAI');
    }

    return parsed;
  } catch (error) {
    console.error('Error in OpenAI analysis, falling back to mock analysis:', error);
    return getMockAIAnalysis(answers, ruleRecommendedServices);
  }
}
