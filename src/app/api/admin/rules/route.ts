import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const rules = await prisma.serviceRule.findMany({
      include: { service: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, condition, priority, active } = body;

    if (!serviceId || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rule = await prisma.serviceRule.create({
      data: {
        serviceId: parseInt(serviceId),
        condition,
        priority: priority ? parseInt(priority) : 1,
        active: active !== undefined ? Boolean(active) : true,
      },
      include: { service: true },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
