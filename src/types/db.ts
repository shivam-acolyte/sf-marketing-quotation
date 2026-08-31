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

export interface Question {
  id: number;
  question: string;
  questionType: string;
  options: any; // Json
  required: boolean;
  displayOrder: number | null;
  active: boolean;
  createdAt: Date | string;
}

export interface ServiceRule {
  id: number;
  serviceId: number;
  condition: any; // Json
  priority: number;
  active: boolean;
  createdAt: Date | string;
  service?: Service;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: Date | string;
}

export interface Assessment {
  id: string;
  customerId: string | null;
  answers: any;
  aiAnalysis: any;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

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
