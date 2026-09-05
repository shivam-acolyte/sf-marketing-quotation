import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // JSON-backed database client (reads/writes data/questions.json)

export const dynamic = 'force-dynamic';

/**
 * GET /api/questions
 * Fetches all active questionnaire questions from `data/questions.json` ordered by page and displayOrder.
 */
export async function GET() {
  try {
    // Query active questions from data/questions.json
    const questions = await prisma.question.findMany({
      where: { active: true },
    });

    // Sort by page (default 1), then displayOrder (default 1)
    const sorted = [...questions].sort((a: any, b: any) => {
      const pageA = a.page ?? 1;
      const pageB = b.page ?? 1;
      if (pageA !== pageB) return pageA - pageB;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });

    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching questions from JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/questions
 * Appends a new question to `data/questions.json` with page, order, and optional follow-up button trigger.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      question, 
      description,
      questionType, 
      options, 
      required, 
      page, 
      displayOrder, 
      hasFollowUp,
      followUpTrigger,
      followUpText,
      active 
    } = body;

    if (!question || !questionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const assignedPage = page !== undefined && page !== null ? parseInt(page) : 1;

    // Determine default order within the page if not specified
    let order = displayOrder !== undefined && displayOrder !== null && displayOrder !== ''
      ? parseInt(displayOrder)
      : null;

    if (order === null) {
      const existing = await prisma.question.findMany({
        where: { page: assignedPage, active: true },
      });
      const maxOrder = existing.reduce((max: number, q: any) => Math.max(max, q.displayOrder || 0), 0);
      order = maxOrder + 1;
    }

    const finalOptions = questionType === 'yes_no' 
      ? ['Yes', 'No'] 
      : options || null;

    // Persist new question record to data/questions.json
    const newQuestion = await prisma.question.create({
      data: {
        question,
        description: description || null,
        questionType,
        options: finalOptions,
        required: required !== undefined ? Boolean(required) : true,
        page: assignedPage,
        displayOrder: order,
        hasFollowUp: Boolean(hasFollowUp),
        followUpTrigger: followUpTrigger || (hasFollowUp ? 'Yes' : null),
        followUpText: followUpText || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question in JSON store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
