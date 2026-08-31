import { Service } from '@/types/db';

export function calculateComplexityScore(answers: Record<string, any>): number {
  let score = 0.0;

  // 1. Business Size (Question ID "3" or text matching)
  const businessSize = answers['3'] || answers['business_size'] || answers['Business Size'];
  if (businessSize) {
    const sizeStr = String(businessSize);
    if (sizeStr.includes('Small')) score += 0.10;
    else if (sizeStr.includes('Medium')) score += 0.25;
    else if (sizeStr.includes('Large')) score += 0.40;
  }

  // 2. Target Audience Location (Question ID "8" or text matching)
  const targetLocation = answers['8'] || answers['target_location'] || answers['Target Audience Location'];
  if (targetLocation) {
    const locStr = String(targetLocation);
    if (locStr.includes('Regional')) score += 0.15;
    else if (locStr.includes('Pan India') || locStr.includes('National')) score += 0.30;
    else if (locStr.includes('International') || locStr.includes('Global')) score += 0.45;
  }

  // 3. Start Date / Timeline (Question ID "10" or text matching)
  const timeline = answers['10'] || answers['timeline'] || answers['Intended Start Date'];
  if (timeline) {
    const timeStr = String(timeline);
    if (timeStr.includes('Immediately')) score += 0.15;
    else if (timeStr.includes('1 month')) score += 0.05;
  }

  // 4. Marketing Goals Count (Question ID "7" or text matching)
  const goals = answers['7'] || answers['goals'] || answers['Primary Marketing Goals'];
  if (Array.isArray(goals)) {
    if (goals.length === 2) score += 0.05;
    else if (goals.length >= 3) score += 0.10;
  }

  // Clamp the final score between 0.0 and 1.0
  return Math.min(Math.max(score, 0.0), 1.0);
}

export interface CalculatedServicePrice {
  serviceId: number;
  serviceName: string;
  minPrice: number;
  maxPrice: number;
  complexityScore: number;
  recommendedPrice: number;
  description: string;
  salesDescription: string;
}

export function calculateServicePrice(
  service: Service,
  complexityScore: number
): CalculatedServicePrice {
  const min = Number(service.minPrice);
  const max = Number(service.maximumPrice);
  const range = max - min;
  
  // recommended price = min + (range * complexity)
  let recommendedPrice = min + (range * complexityScore);
  
  // Round to nearest ₹500 for professional, polished pricing
  recommendedPrice = Math.round(recommendedPrice / 500) * 500;

  return {
    serviceId: service.id,
    serviceName: service.name,
    minPrice: min,
    maxPrice: max,
    complexityScore,
    recommendedPrice,
    description: service.description || '',
    salesDescription: service.salesDescription || '',
  };
}

export interface QuotationTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function calculateQuotationTotals(
  items: { unitPrice: number; quantity: number }[],
  discountAmount = 0,
  taxRate = 0.18 // 18% GST
): QuotationTotals {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = Math.min(discountAmount, subtotal);
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = taxableAmount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}
