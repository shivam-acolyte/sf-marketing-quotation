import { ServiceRule, Service } from '@/types/db';

export interface RuleCondition {
  field: string; // The question ID, e.g., "7" or "4"
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty';
  value?: string;
}

export function evaluateCondition(answers: Record<string, any>, condition: RuleCondition): boolean {
  if (!condition || !condition.field) return false;
  const answer = answers[condition.field];

  // If answer is undefined or null, we can only satisfy 'is_empty'
  if (answer === undefined || answer === null) {
    return condition.operator === 'is_empty';
  }

  const cleanString = (val: any) => String(val).trim().toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return cleanString(answer) === cleanString(condition.value);
    case 'not_equals':
      return cleanString(answer) !== cleanString(condition.value);
    case 'contains':
      if (Array.isArray(answer)) {
        return answer.some(val => cleanString(val) === cleanString(condition.value));
      }
      return cleanString(answer).includes(cleanString(condition.value));
    case 'is_empty':
      return answer === '' || (Array.isArray(answer) && answer.length === 0);
    case 'not_empty':
      return answer !== '' && (!Array.isArray(answer) || answer.length > 0);
    default:
      return false;
  }
}

export function getRecommendedServices(
  answers: Record<string, any>,
  servicesWithRules: (Service & { serviceRules: ServiceRule[] })[]
): Service[] {
  const recommended: Service[] = [];
  const recommendedIds = new Set<number>();

  for (const service of servicesWithRules) {
    if (!service.active) continue;
    const activeRules = service.serviceRules.filter(r => r.active);
    
    // If a service has no rules, it's not automatically recommended.
    if (activeRules.length === 0) continue;

    let isRecommended = false;

    // Check if ANY rule triggers (OR logic between rules for the same service)
    for (const rule of activeRules) {
      try {
        const condition = rule.condition as unknown as RuleCondition;
        if (evaluateCondition(answers, condition)) {
          isRecommended = true;
          break; // One rule triggered, we can recommend this service
        }
      } catch (err) {
        console.error(`Error evaluating rule ${rule.id} for service ${service.name}:`, err);
      }
    }

    if (isRecommended && !recommendedIds.has(service.id)) {
      recommended.push(service);
      recommendedIds.add(service.id);
    }
  }

  return recommended;
}
