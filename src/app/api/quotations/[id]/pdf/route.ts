import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQuotationPDF } from '@/lib/pdf';

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
        assessment: {
          include: {
            customer: true,
          }
        },
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const pdfBuffer = await generateQuotationPDF(quotation);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
