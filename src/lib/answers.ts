import { Question } from '@prisma/client';

export function getAugmentedAnswers(
  answers: Record<string, any>,
  questions: Question[]
): Record<string, any> {
  const augmented = { ...answers };

  for (const q of questions) {
    const answerVal = answers[String(q.id)];
    if (answerVal !== undefined && answerVal !== null && answerVal !== '') {
      if (q.displayOrder === 1) {
        augmented['business_name'] = answerVal;
        augmented['1'] = answerVal;
      }
      else if (q.displayOrder === 2) {
        augmented['industry'] = answerVal;
        augmented['2'] = answerVal;
      }
      else if (q.displayOrder === 3) {
        augmented['business_size'] = answerVal;
        augmented['3'] = answerVal;
      }
      else if (q.displayOrder === 4) {
        augmented['website'] = answerVal;
        augmented['4'] = answerVal;
      }
      else if (q.displayOrder === 5) {
        augmented['social_channels'] = answerVal;
        augmented['5'] = answerVal;
      }
      else if (q.displayOrder === 6) {
        augmented['paid_ads'] = answerVal;
        augmented['6'] = answerVal;
      }
      else if (q.displayOrder === 7) {
        augmented['goals'] = answerVal;
        augmented['7'] = answerVal;
      }
      else if (q.displayOrder === 8) {
        augmented['location'] = answerVal;
        augmented['8'] = answerVal;
      }
      else if (q.displayOrder === 9) {
        augmented['budget'] = answerVal;
        augmented['9'] = answerVal;
      }
      else if (q.displayOrder === 10) {
        augmented['timeline'] = answerVal;
        augmented['10'] = answerVal;
      }
    }
  }

  return augmented;
}
