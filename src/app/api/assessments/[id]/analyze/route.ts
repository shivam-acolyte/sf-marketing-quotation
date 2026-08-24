import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRecommendedServices } from '@/lib/recommendation';
import { analyzeRequirements } from '@/lib/ai';
import { getAugmentedAnswers } from '@/lib/answers';
import { calculateComplexityScore, calculateServicePrice } from '@/lib/pricing';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Fetch assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const answers = assessment.answers as Record<string, any>;

    // Fetch questions to map IDs to standard semantic fields
    const questions = await prisma.question.findMany({
      where: { active: true },
    });

    const augmentedAnswers = getAugmentedAnswers(answers, questions);

    // 2. Fetch all active services & rules
    const services = await prisma.service.findMany({
      where: { active: true },
      include: { serviceRules: true },
    });

    // 3. Evaluate deterministic rules
    const ruleRecommended = getRecommendedServices(answers, services);

    // 4. Run AI analysis
    const aiResult = await analyzeRequirements(augmentedAnswers, services, ruleRecommended);

    // 5. Update assessment with AI analysis
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        aiAnalysis: aiResult as any,
        status: 'analyzed',
      },
    });

    // 6. Calculate recommended prices
    const complexityScore = calculateComplexityScore(augmentedAnswers);
    
    // Map recommended services and pricing
    const recommendedDetails = aiResult.recommended_services.map((rec) => {
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
      assessment: updatedAssessment,
      aiAnalysis: aiResult,
      recommendedServices: recommendedDetails,
      complexityScore,
    });
  } catch (error) {
    console.error('Error running assessment analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
