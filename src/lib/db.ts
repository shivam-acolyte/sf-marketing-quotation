/**
 * ============================================================================
 * JSON File-based Data Store Engine (Simulated Database Layer)
 * ============================================================================
 * 
 * Instead of an external SQL/NoSQL database server (PostgreSQL, MySQL, MongoDB),
 * this application uses local flat JSON files located in the `data/` directory.
 * 
 * It exports a `prisma` client wrapper (`MockPrismaClient`) that mimics standard
 * Prisma ORM query syntax (findMany, findFirst, findUnique, create, update, delete, $transaction)
 * while reading and writing directly to local JSON files (`data/*.json`).
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Base directory path where all JSON table files are stored
const DATA_DIR = path.join(process.cwd(), 'data');

// Table mappings: associates table entity names to their corresponding JSON file in data/
const TABLE_FILES: Record<string, string> = {
  service: 'services.json',           // Marketing services catalog & pricing
  question: 'questions.json',         // Dynamic questionnaire questions
  serviceRule: 'service_rules.json',  // Recommendation engine rules
  customer: 'customers.json',         // Customer contact details & leads
  assessment: 'assessments.json',     // Submitted questionnaire answers & AI analyses
  quotation: 'quotations.json',       // Generated quotations & totals
  quotationItem: 'quotation_items.json', // Line items inside quotations
};

/**
 * Reads and parses table records from the matching JSON file.
 * If the file or data directory does not exist, it initializes an empty JSON array file.
 * 
 * @param tableName - Name of the table entity (e.g., 'service', 'quotation')
 * @returns Array of table records parsed from JSON
 */
function readTable(tableName: string): any[] {
  const fileName = TABLE_FILES[tableName];
  if (!fileName) throw new Error(`Unknown table: ${tableName}`);
  
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    // Auto-create empty JSON file if it doesn't exist
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
    console.error(`Error reading JSON table ${tableName}:`, error);
    return [];
  }
}

/**
 * Writes updated data array back to the matching JSON file on disk.
 * 
 * @param tableName - Name of the table entity
 * @param data - Array of record objects to persist in JSON format
 */
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

/**
 * Helper to evaluate Prisma-like `where` filter conditions on in-memory JSON objects.
 * Supports exact match, case-insensitive string match, and object comparison.
 * 
 * @param item - The JSON object record to test
 * @param where - Prisma-style filter condition object
 * @returns boolean indicating if the record matches the filter criteria
 */
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

/**
 * Helper to resolve relational foreign-key lookups across JSON files (similar to Prisma `include`).
 * E.g., attaching customer details to a quotation or rules to a service.
 * 
 * @param tableName - Current entity name
 * @param item - Current record
 * @param include - Relational inclusion configuration
 * @returns Record populated with linked JSON records
 */
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

/**
 * Helper to project specific fields based on Prisma-style `select` projection.
 */
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

/**
 * Generates an auto-incrementing integer ID or a UUID string depending on table schema.
 */
function generateId(tableName: string, existing: any[]): string | number {
  const integerIdTables = ['service', 'question', 'serviceRule', 'quotationItem'];
  if (integerIdTables.includes(tableName)) {
    const max = existing.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
    return max + 1;
  }
  return randomUUID();
}

/**
 * Table client simulator for interacting with a specific JSON file.
 * Implements standard CRUD operations conforming to Prisma's model delegates.
 */
class JsonTableClient {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Reads multiple records from JSON file with filtering, sorting, and relation inclusion.
   */
  async findMany(args?: any) {
    const data = readTable(this.tableName);
    const results = data.filter((item: any) => matches(item, args?.where));

    // Handle Order By sorting
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

    // Resolve inclusions & select projections
    return results.map((item: any) => {
      const withIncludes = resolveIncludes(this.tableName, item, args?.include);
      return applySelect(withIncludes, args?.select);
    });
  }

  /**
   * Finds the first matching record in the JSON file.
   */
  async findFirst(args?: any) {
    const data = readTable(this.tableName);
    const item = data.find((item: any) => matches(item, args?.where));
    if (!item) return null;
    
    const withIncludes = resolveIncludes(this.tableName, item, args?.include);
    return applySelect(withIncludes, args?.select);
  }

  /**
   * Finds a unique record in the JSON file by criteria.
   */
  async findUnique(args?: any) {
    return this.findFirst(args);
  }

  /**
   * Creates a single record and appends it to the JSON file.
   */
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

  /**
   * Creates multiple records and batch-appends them to the JSON file.
   */
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

  /**
   * Updates an existing record in the JSON file.
   */
  async update(args: { where: any; data: any; include?: any; select?: any }) {
    const data = readTable(this.tableName);
    const index = data.findIndex((item: any) => matches(item, args.where));
    if (index === -1) {
      throw new Error(`Record to update not found in JSON table ${this.tableName}`);
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

  /**
   * Updates all matching records in the JSON file.
   */
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

  /**
   * Deletes a matching record from the JSON file.
   */
  async delete(args: { where: any }) {
    const data = readTable(this.tableName);
    const index = data.findIndex((item: any) => matches(item, args.where));
    if (index === -1) {
      throw new Error(`Record to delete not found in JSON table ${this.tableName}`);
    }
    
    const deleted = data.splice(index, 1)[0];
    writeTable(this.tableName, data);
    return deleted;
  }

  /**
   * Deletes all matching records from the JSON file.
   */
  async deleteMany(args?: { where?: any }) {
    const data = readTable(this.tableName);
    const beforeCount = data.length;
    const filtered = data.filter((item: any) => !matches(item, args?.where));
    
    writeTable(this.tableName, filtered);
    return { count: beforeCount - filtered.length };
  }

  /**
   * Counts the number of matching records in the JSON file.
   */
  async count(args?: any) {
    const data = readTable(this.tableName);
    const filtered = data.filter((item: any) => matches(item, args?.where));
    return filtered.length;
  }
}

/**
 * Mock Prisma Client that delegates all queries to local JSON files in `data/`.
 * Allows the entire application to use Prisma-like semantics while persisting to JSON.
 */
class MockPrismaClient {
  service = new JsonTableClient('service');
  question = new JsonTableClient('question');
  serviceRule = new JsonTableClient('serviceRule');
  customer = new JsonTableClient('customer');
  assessment = new JsonTableClient('assessment');
  quotation = new JsonTableClient('quotation');
  quotationItem = new JsonTableClient('quotationItem');

  /**
   * Simulates transaction execution (runs callback directly against the JSON client).
   */
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
    // No-op for JSON file store (no persistent connection pool needed)
  }
}

// Export the singleton instance simulating Prisma for the app
export const prisma = new MockPrismaClient();


