import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAugmentedAnswers } from '@/lib/answers';
import { calculateComplexityScore, calculateServicePrice } from '@/lib/pricing';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (!assessment.aiAnalysis) {
      return NextResponse.json({ 
        assessment, 
        recommendedServices: [], 
        status: 'pending_analysis' 
      });
    }

    const answers = assessment.answers as Record<string, any>;
    const aiAnalysis = assessment.aiAnalysis as any;

    // Fetch questions to map IDs to standard semantic fields
    const questions = await prisma.question.findMany({
      where: { active: true },
    });

    const augmentedAnswers = getAugmentedAnswers(answers, questions);

    // Fetch all active services
    const services = await prisma.service.findMany({
      where: { active: true },
    });

    const complexityScore = calculateComplexityScore(augmentedAnswers);

    // Map recommended services and pricing
    const recommendedServices = aiAnalysis.recommended_services.map((rec: any) => {
      const serviceObj = services.find((s) => s.id === rec.service_id);
      if (!serviceObj) return null;

      const pricing = calculateServicePrice(serviceObj, complexityScore);
      return {
        ...pricing,
        reason: rec.reason,
        options: rec.options || [],
      };
    }).filter(Boolean);

    return NextResponse.json({
      assessment,
      aiAnalysis,
      recommendedServices,
      complexityScore,
    });
  } catch (error) {
    console.error('Error fetching assessment detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
