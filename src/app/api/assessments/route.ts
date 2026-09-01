import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/assessments.json & customers.json)

/**
 * GET /api/assessments
 * Fetches all assessments from `data/assessments.json` joined with customer details.
 */
export async function GET() {
  try {
    // Read all assessment records from data/assessments.json
    const assessments = await prisma.assessment.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments from JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/assessments
 * Creates or updates a customer in `data/customers.json` and creates a new assessment in `data/assessments.json`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, answers } = body;

    if (!customer || !customer.name || !customer.email || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Lookup existing customer by email in data/customers.json
    let customerRecord = await prisma.customer.findFirst({
      where: { email: { equals: customer.email, mode: 'insensitive' } },
    });

    if (customerRecord) {
      // Update existing customer in data/customers.json
      customerRecord = await prisma.customer.update({
        where: { id: customerRecord.id },
        data: {
          name: customer.name,
          phone: customer.phone || customerRecord.phone,
          company: customer.company || customerRecord.company,
        },
      });
    } else {
      // Create new customer record in data/customers.json
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          company: customer.company || null,
        },
      });
    }

    // Persist completed assessment in data/assessments.json
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
    console.error('Error creating assessment in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

