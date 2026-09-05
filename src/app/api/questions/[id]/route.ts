import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const qId = parseInt(id);

    const question = await prisma.question.findUnique({
      where: { id: qId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/questions/[id]
 * Updates question fields including page, displayOrder, text, type, options, required.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const qId = parseInt(id);
    const body = await request.json();

    const updateData: any = {};
    if (body.question !== undefined) updateData.question = body.question;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.questionType !== undefined) updateData.questionType = body.questionType;
    if (body.options !== undefined) updateData.options = body.options;
    if (body.required !== undefined) updateData.required = Boolean(body.required);
    if (body.page !== undefined) updateData.page = parseInt(body.page);
    if (body.displayOrder !== undefined) updateData.displayOrder = parseInt(body.displayOrder);
    if (body.hasFollowUp !== undefined) updateData.hasFollowUp = Boolean(body.hasFollowUp);
    if (body.followUpTrigger !== undefined) updateData.followUpTrigger = body.followUpTrigger;
    if (body.followUpText !== undefined) updateData.followUpText = body.followUpText;
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const updated = await prisma.question.update({
      where: { id: qId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/questions/[id]
 * Deletes question record.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const qId = parseInt(id);

    const deleted = await prisma.question.delete({
      where: { id: qId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
