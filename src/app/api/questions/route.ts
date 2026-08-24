import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, questionType, options, required, displayOrder, active } = body;

    if (!question || !questionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        questionType,
        options: options || null,
        required: required !== undefined ? Boolean(required) : true,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
