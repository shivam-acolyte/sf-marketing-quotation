import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

// Table mappings to file names
const TABLE_FILES: Record<string, string> = {
  service: 'services.json',
  question: 'questions.json',
  serviceRule: 'service_rules.json',
  customer: 'customers.json',
  assessment: 'assessments.json',
  quotation: 'quotations.json',
  quotationItem: 'quotation_items.json',
};

// Reads data for a table
function readTable(tableName: string): any[] {
  const fileName = TABLE_FILES[tableName];
  if (!fileName) throw new Error(`Unknown table: ${tableName}`);
  
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    // Auto-create empty file if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading table ${tableName}:`, error);
    return [];
  }
}

// Writes data for a table
function writeTable(tableName: string, data: any[]): void {
  const fileName = TABLE_FILES[tableName];
  if (!fileName) throw new Error(`Unknown table: ${tableName}`);
  
  const filePath = path.join(DATA_DIR, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing table ${tableName}:`, error);
  }
}

// Helper to evaluate Prisma-like where conditions
function matches(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const condition = where[key];
    const val = item[key];
    
    if (condition && typeof condition === 'object') {
      if ('equals' in condition) {
        const equalsVal = condition.equals;
        if (condition.mode === 'insensitive') {
          if (String(val).toLowerCase() !== String(equalsVal).toLowerCase()) return false;
        } else {
          if (val !== equalsVal) return false;
        }
      } else {
        // Fallback for nested objects
        if (JSON.stringify(val) !== JSON.stringify(condition)) return false;
      }
    } else {
      if (val !== condition) return false;
    }
  }
  return true;
}

// Helper to resolve relationships
function resolveIncludes(tableName: string, item: any, include: any): any {
  if (!include) return item;
  const resolved = { ...item };
  
  for (const key of Object.keys(include)) {
    if (!include[key]) continue;
    
    if (tableName === 'service' && key === 'serviceRules') {
      const rules = readTable('serviceRule');
      resolved.serviceRules = rules.filter((r: any) => r.serviceId === item.id);
    }
    else if (tableName === 'serviceRule' && key === 'service') {
      const services = readTable('service');
      resolved.service = services.find((s: any) => s.id === item.serviceId) || null;
    }
    else if (tableName === 'quotation' && key === 'customer') {
      const customers = readTable('customer');
      resolved.customer = customers.find((c: any) => c.id === item.customerId) || null;
    }
    else if (tableName === 'quotation' && key === 'assessment') {
      const assessments = readTable('assessment');
      resolved.assessment = assessments.find((a: any) => a.id === item.assessmentId) || null;
    }
    else if (tableName === 'quotation' && key === 'items') {
      const items = readTable('quotationItem');
      resolved.items = items.filter((i: any) => i.quotationId === item.id);
    }
    else if (tableName === 'assessment' && key === 'customer') {
      const customers = readTable('customer');
      resolved.customer = customers.find((c: any) => c.id === item.customerId) || null;
    }
    else if (tableName === 'quotationItem' && key === 'service') {
      const services = readTable('service');
      resolved.service = services.find((s: any) => s.id === item.serviceId) || null;
    }
  }
  return resolved;
}

// Helper to project fields based on select
function applySelect(item: any, select: any): any {
  if (!select) return item;
  const selected: any = {};
  for (const key of Object.keys(select)) {
    if (select[key]) {
      selected[key] = item[key];
    }
  }
  return selected;
}

// Generates next ID depending on type
function generateId(tableName: string, existing: any[]): string | number {
  const integerIdTables = ['service', 'question', 'serviceRule', 'quotationItem'];
  if (integerIdTables.includes(tableName)) {
    const max = existing.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
    return max + 1;
  }
  return randomUUID();
}

class JsonTableClient {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findMany(args?: any) {
    const data = readTable(this.tableName);
    const results = data.filter((item: any) => matches(item, args?.where));

    // Order By
    if (args?.orderBy) {
      const orderBy = args.orderBy;
      const keys = Object.keys(orderBy);
      if (keys.length > 0) {
        const key = keys[0];
        const dir = orderBy[key] === 'desc' ? -1 : 1;
        results.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          return valA > valB ? dir : -dir;
        });
      }
    }

    // Resolve inclusions & selections
    return results.map((item: any) => {
      const withIncludes = resolveIncludes(this.tableName, item, args?.include);
      return applySelect(withIncludes, args?.select);
    });
  }

  async findFirst(args?: any) {
    const data = readTable(this.tableName);
    const item = data.find((item: any) => matches(item, args?.where));
    if (!item) return null;
    
    const withIncludes = resolveIncludes(this.tableName, item, args?.include);
    return applySelect(withIncludes, args?.select);
  }

  async findUnique(args?: any) {
    return this.findFirst(args);
  }

  async create(args: { data: any; include?: any; select?: any }) {
    const data = readTable(this.tableName);
    const now = new Date().toISOString();
    
    const newRecord = {
      id: generateId(this.tableName, data),
      ...args.data,
      createdAt: now,
      updatedAt: now,
    };
    
    data.push(newRecord);
    writeTable(this.tableName, data);
    
    const withIncludes = resolveIncludes(this.tableName, newRecord, args.include);
    return applySelect(withIncludes, args.select);
  }

  async createMany(args: { data: any[] }) {
    const data = readTable(this.tableName);
    const now = new Date().toISOString();
    
    const newRecords = args.data.map(item => ({
      id: generateId(this.tableName, data),
      ...item,
      createdAt: now,
      updatedAt: now,
    }));
    
    data.push(...newRecords);
    writeTable(this.tableName, data);
    return { count: newRecords.length };
  }

  async update(args: { where: any; data: any; include?: any; select?: any }) {
    const data = readTable(this.tableName);
    const index = data.findIndex((item: any) => matches(item, args.where));
    if (index === -1) {
      throw new Error(`Record to update not found in table ${this.tableName}`);
    }
    
    const now = new Date().toISOString();
    const updatedRecord = {
      ...data[index],
      ...args.data,
      updatedAt: now,
    };
    
    data[index] = updatedRecord;
    writeTable(this.tableName, data);
    
    const withIncludes = resolveIncludes(this.tableName, updatedRecord, args.include);
    return applySelect(withIncludes, args.select);
  }

  async updateMany(args: { where?: any; data: any }) {
    const data = readTable(this.tableName);
    let count = 0;
    const now = new Date().toISOString();
    
    const updated = data.map((item: any) => {
      if (matches(item, args.where)) {
        count++;
        return {
          ...item,
          ...args.data,
          updatedAt: now,
        };
      }
      return item;
    });
    
    writeTable(this.tableName, updated);
    return { count };
  }

  async delete(args: { where: any }) {
    const data = readTable(this.tableName);
    const index = data.findIndex((item: any) => matches(item, args.where));
    if (index === -1) {
      throw new Error(`Record to delete not found in table ${this.tableName}`);
    }
    
    const deleted = data.splice(index, 1)[0];
    writeTable(this.tableName, data);
    return deleted;
  }

  async deleteMany(args?: { where?: any }) {
    const data = readTable(this.tableName);
    const beforeCount = data.length;
    const filtered = data.filter((item: any) => !matches(item, args?.where));
    
    writeTable(this.tableName, filtered);
    return { count: beforeCount - filtered.length };
  }

  async count(args?: any) {
    const data = readTable(this.tableName);
    const filtered = data.filter((item: any) => matches(item, args?.where));
    return filtered.length;
  }
}

class MockPrismaClient {
  service = new JsonTableClient('service');
  question = new JsonTableClient('question');
  serviceRule = new JsonTableClient('serviceRule');
  customer = new JsonTableClient('customer');
  assessment = new JsonTableClient('assessment');
  quotation = new JsonTableClient('quotation');
  quotationItem = new JsonTableClient('quotationItem');

  async $transaction(arg: any) {
    if (typeof arg === 'function') {
      return await arg(this);
    } else if (Array.isArray(arg)) {
      const results = [];
      for (const item of arg) {
        results.push(await item);
      }
      return results;
    }
    throw new Error('Unsupported transaction argument');
  }

  async $disconnect() {
    // No-op for mock client
  }
}

export const prisma = new MockPrismaClient();

