import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, answers } = body;

    if (!customer || !customer.name || !customer.email || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find existing customer by email, or create new
    let customerRecord = await prisma.customer.findFirst({
      where: { email: { equals: customer.email, mode: 'insensitive' } },
    });

    if (customerRecord) {
      customerRecord = await prisma.customer.update({
        where: { id: customerRecord.id },
        data: {
          name: customer.name,
          phone: customer.phone || customerRecord.phone,
          company: customer.company || customerRecord.company,
        },
      });
    } else {
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          company: customer.company || null,
        },
      });
    }

    // Create assessment in 'started' status
    const assessment = await prisma.assessment.create({
      data: {
        customerId: customerRecord.id,
        answers,
        status: 'completed', // Complete since we got all answers
      },
    });

    return NextResponse.json({
      assessmentId: assessment.id,
      customerId: customerRecord.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
