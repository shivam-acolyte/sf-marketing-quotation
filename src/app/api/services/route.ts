import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, minPrice, maximumPrice, description, salesDescription, active } = body;
    
    if (!name || minPrice === undefined || maximumPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        minPrice: Number(minPrice),
        maximumPrice: Number(maximumPrice),
        description,
        salesDescription,
        active: active !== undefined ? active : true,
      },
    });
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
