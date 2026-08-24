import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ruleId = parseInt(id);

    await prisma.serviceRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
