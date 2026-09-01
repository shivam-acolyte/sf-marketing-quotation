import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/services.json)

/**
 * GET /api/services
 * Retrieves all marketing services from `data/services.json` sorted by ID.
 */
export async function GET() {
  try {
    // Query services from data/services.json in ascending order
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services from JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/services
 * Creates and appends a new service record to `data/services.json`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, minPrice, maximumPrice, description, salesDescription, active } = body;
    
    if (!name || minPrice === undefined || maximumPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Persist new service in data/services.json
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
    console.error('Error creating service in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

