import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const totalLeads = await prisma.customer.count();
    const totalAssessments = await prisma.assessment.count();
    const quotationsGenerated = await prisma.quotation.count();
    const quotationsAccepted = await prisma.quotation.count({
      where: { status: 'accepted' },
    });

    const acceptedQuotations = await prisma.quotation.findMany({
      where: { status: 'accepted' },
      select: { total: true },
    });

    const estimatedRevenue = acceptedQuotations.reduce((sum, q) => sum + Number(q.total), 0);

    const conversionRate = totalAssessments > 0 
      ? Math.round((quotationsAccepted / totalAssessments) * 1000) / 10 
      : 0;

    // Funnel analytics
    const startedCount = await prisma.assessment.count({ where: { status: 'started' } });
    const completedCount = await prisma.assessment.count({ where: { status: 'completed' } });
    const analyzedCount = await prisma.assessment.count({ where: { status: 'analyzed' } });

    return NextResponse.json({
      totalLeads,
      totalAssessments,
      quotationsGenerated,
      quotationsAccepted,
      conversionRate,
      estimatedRevenue,
      funnel: {
        started: startedCount + completedCount + analyzedCount,
        completed: completedCount + analyzedCount,
        analyzed: analyzedCount,
        quotations: quotationsGenerated,
        accepted: quotationsAccepted,
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
