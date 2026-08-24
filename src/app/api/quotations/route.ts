import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateQuotationTotals } from '@/lib/pricing';

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: { customer: true, assessment: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    // Create quotation in database transaction
    const quotation = await prisma.$transaction(async (tx) => {
      // 1. Create Quotation record
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

      // 2. Create QuotationItems
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
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
