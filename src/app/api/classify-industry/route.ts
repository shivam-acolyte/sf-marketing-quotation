import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

function getLocalClassification(description: string) {
  const lower = description.toLowerCase();
  let quickQuoteCategory = 'other';
  let assessmentCategory = 'Other';
  
  if (lower.includes('biscuit') || lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('khana') || lower.includes('sweets') || lower.includes('mithai') || lower.includes('bakery')) {
    quickQuoteCategory = 'fnb';
    assessmentCategory = 'Local Business / Retail';
  } else if (lower.includes('clothes') || lower.includes('kapde') || lower.includes('shop') || lower.includes('store') || lower.includes('sell') || lower.includes('ecommerce') || lower.includes('online') || lower.includes('brand')) {
    quickQuoteCategory = 'ecommerce';
    assessmentCategory = 'E-commerce / Online Store';
  } else if (lower.includes('clinic') || lower.includes('dental') || lower.includes('doctor') || lower.includes('health') || lower.includes('hospital') || lower.includes('dentist') || lower.includes('dawai')) {
    quickQuoteCategory = 'healthcare';
    assessmentCategory = 'Healthcare / Clinic';
  } else if (lower.includes('school') || lower.includes('coaching') || lower.includes('class') || lower.includes('padhai') || lower.includes('course') || lower.includes('education') || lower.includes('college')) {
    quickQuoteCategory = 'education';
    assessmentCategory = 'Education / Coaching';
  } else if (lower.includes('property') || lower.includes('real estate') || lower.includes('house') || lower.includes('flat') || lower.includes('builder') || lower.includes('home') || lower.includes('land')) {
    quickQuoteCategory = 'realestate';
    assessmentCategory = 'Real Estate';
  } else if (lower.includes('agency') || lower.includes('service') || lower.includes('marketing') || lower.includes('software') || lower.includes('consulting') || lower.includes('developer') || lower.includes('tech')) {
    quickQuoteCategory = 'services';
    assessmentCategory = 'Agency / Consulting';
  } else if (lower.includes('factory') || lower.includes('manufacturing') || lower.includes('industry') || lower.includes('karkhana') || lower.includes('bana')) {
    quickQuoteCategory = 'manufacturing';
    assessmentCategory = 'Other';
  }
  
  return {
    quickQuoteCategory,
    assessmentCategory,
    explanation: 'Local keyword match classification fallback.'
  };
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key')) {
      console.log('OpenAI API Key is missing. Using local rule-based classifier.');
      return NextResponse.json(getLocalClassification(description));
    }

    try {
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `You are a business classifier. Analyze the user's business description (which may be in English, Hindi, or Hinglish - Hindi written in Latin script, e.g. "ye biscuit ki company hai", "hum online clothes bechte hain", "dental clinic setup hai local city me", "agency hai hamari") and map it to the most relevant category from both lists below:

List 1 (Quick Quote categories):
- ecommerce (Retail / E-commerce, online stores)
- d2c (Direct-to-Consumer brands, online clothing/cosmetic brands selling directly)
- services (Professional Services like agencies, consulting, IT/software development)
- manufacturing (Factories, manufacturing units, industrial production)
- fnb (Food & Beverage, restaurants, cafes, food products, bakeries, biscuit companies)
- healthcare (Clinics, doctors, hospitals, dental clinics, healthcare providers)
- education (Schools, colleges, coaching, online courses, educational platforms)
- realestate (Real Estate agents, property dealers, property management)
- other (Any other business type)

List 2 (Assessment Portal categories):
- E-commerce / Online Store
- SaaS / Tech Product
- Local Business / Retail
- Agency / Consulting
- Education / Coaching
- Real Estate
- Healthcare / Clinic
- Other

Respond with a single JSON object. Follow this structure exactly:
{
  "quickQuoteCategory": "one_of_list_1_values_here",
  "assessmentCategory": "one_of_list_2_values_here",
  "explanation": "brief 1-sentence explanation of why it fits in English"
}
Ensure the category values are EXACTLY as listed above. Select the best match from both lists.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze: "${description}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const text = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);

      return NextResponse.json(parsed);
    } catch (apiError) {
      console.error('Error calling OpenAI API, using fallback:', apiError);
      return NextResponse.json(getLocalClassification(description));
    }
  } catch (error) {
    console.error('General error in classification endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
