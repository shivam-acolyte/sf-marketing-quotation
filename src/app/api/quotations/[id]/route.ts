import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateQuotationTotals } from '@/lib/pricing';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        assessment: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, discountAmount } = body;

    // If changing discount, recalculate totals
    const currentQuote = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentQuote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;

    if (discountAmount !== undefined) {
      const discount = Number(discountAmount);
      const itemsForTotals = currentQuote.items.map((item: any) => ({
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
      }));
      
      const totals = calculateQuotationTotals(
        itemsForTotals,
        discount,
        0.18
      );

      updateData.discount = totals.discount;
      updateData.subtotal = totals.subtotal;
      updateData.tax = totals.tax;
      updateData.total = totals.total;
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
