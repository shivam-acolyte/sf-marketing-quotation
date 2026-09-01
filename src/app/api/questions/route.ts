import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/questions.json)

/**
 * GET /api/questions
 * Fetches all active questionnaire questions from `data/questions.json` ordered by displayOrder.
 */
export async function GET() {
  try {
    // Query active questions from data/questions.json
    const questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions from JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/questions
 * Appends a new question to `data/questions.json`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, questionType, options, required, displayOrder, active } = body;

    if (!question || !questionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Persist new question record to data/questions.json
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
    console.error('Error creating question in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

