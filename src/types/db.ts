/**
 * ============================================================================
 * JSON Data Store Type Definitions
 * ============================================================================
 * 
 * These TypeScript interfaces represent the data structure of records persisted
 * in the flat JSON files inside the `data/` directory (e.g., services.json,
 * customers.json, quotations.json, etc.).
 */

/**
 * Service Model - Represents an item in `data/services.json`
 */
export interface Service {
  id: number;
  name: string;
  minPrice: any; // Decimal or number
  maximumPrice: any;
  description: string | null;
  salesDescription: string | null;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  serviceRules?: ServiceRule[];
}

/**
 * Question Model - Represents a questionnaire prompt in `data/questions.json`
 */
export interface Question {
  id: number;
  question: string;
  description?: string | null;
  questionType: string; // text, single_choice, multi_choice, yes_no
  options: any; // Json
  required: boolean;
  page?: number | null;
  displayOrder: number | null;
  hasFollowUp?: boolean;
  followUpText?: string | null;
  followUpTrigger?: string | null;
  active: boolean;
  createdAt: Date | string;
}

/**
 * ServiceRule Model - Represents rule mapping in `data/service_rules.json`
 */
export interface ServiceRule {
  id: number;
  serviceId: number;
  condition: any; // Json
  priority: number;
  active: boolean;
  createdAt: Date | string;
  service?: Service;
}

/**
 * Customer Model - Represents lead/client details in `data/customers.json`
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: Date | string;
}

/**
 * Assessment Model - Represents submitted questions & AI answers in `data/assessments.json`
 */
export interface Assessment {
  id: string;
  customerId: string | null;
  answers: any;
  aiAnalysis: any;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Quotation Model - Represents generated quote headers in `data/quotations.json`
 */
export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string | null;
  assessmentId: string | null;
  subtotal: any;
  discount: any;
  tax: any;
  total: any;
  status: string;
  validUntil: Date | string | null;
  pdfPath: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * QuotationItem Model - Represents service items within a quotation in `data/quotation_items.json`
 */
export interface QuotationItem {
  id: number;
  quotationId: string;
  serviceId: number | null;
  serviceName: string;
  description: string | null;
  quantity: number;
  unitPrice: any;
  totalPrice: any;
}

