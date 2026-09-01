import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/quotations.json & quotation_items.json)
import { calculateQuotationTotals } from '@/lib/pricing';

/**
 * GET /api/quotations
 * Fetches all quotations from `data/quotations.json` with resolved customer and assessment relations.
 */
export async function GET() {
  try {
    // Query quotations and join customer & assessment from their respective JSON files
    const quotations = await prisma.quotation.findMany({
      include: { customer: true, assessment: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations from JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/quotations
 * Creates a new quotation header and its line items inside `data/quotations.json` and `data/quotation_items.json`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assessmentId, customerId, items, discountAmount } = body;

    if (!assessmentId || !customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Recalculate totals on server side for safety
    const itemsForTotals = items.map((item) => ({
      unitPrice: Number(item.unitPrice),
      quantity: parseInt(item.quantity) || 1,
    }));
    
    const discount = Number(discountAmount) || 0;
    const totals = calculateQuotationTotals(itemsForTotals, discount, 0.18); // 18% GST

    // Generate professional quotation number
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${year}-${random}`;

    // Execute atomic creation in JSON files via transaction wrapper
    const quotation = await prisma.$transaction(async (tx: any) => {
      // 1. Create Quotation record in data/quotations.json
      const quote = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId,
          assessmentId,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          status: 'draft',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        },
      });

      // 2. Create QuotationItems line records in data/quotation_items.json
      await Promise.all(
        items.map((item) =>
          tx.quotationItem.create({
            data: {
              quotationId: quote.id,
              serviceId: item.serviceId ? parseInt(item.serviceId) : null,
              serviceName: item.serviceName,
              description: item.description || null,
              quantity: parseInt(item.quantity) || 1,
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.unitPrice) * (parseInt(item.quantity) || 1),
            },
          })
        )
      );

      return quote;
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

