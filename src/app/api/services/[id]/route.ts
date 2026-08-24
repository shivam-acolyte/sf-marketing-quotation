import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);
    const body = await request.json();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.minPrice !== undefined) updateData.minPrice = Number(body.minPrice);
    if (body.maximumPrice !== undefined) updateData.maximumPrice = Number(body.maximumPrice);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.salesDescription !== undefined) updateData.salesDescription = body.salesDescription;
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
