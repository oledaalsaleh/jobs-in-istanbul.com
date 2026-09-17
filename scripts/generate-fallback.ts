import * as fs from 'node:fs';
import * as path from 'node:path';

const sqlPath = path.join(process.cwd(), 'seed_production.sql');
const content = fs.readFileSync(sqlPath, 'utf8');
const lines = content.split('\n');

const categories: any[] = [];
const companies: any[] = [];
const jobs: any[] = [];

for (const line of lines) {
  if (!line.startsWith('INSERT OR REPLACE INTO documents')) continue;
  
  if (line.includes("'categories'")) {
    const dataMatch = line.match(/'(\{"name_ar":.*?\})'/);
    const idMatch = line.match(/VALUES \('([^']+)'/);
    const slugMatch = line.match(/, '([^']+)', NULL,/);
    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1].replace(/''/g, "'"));
        const id = idMatch ? idMatch[1] : '';
        const slug = slugMatch ? slugMatch[1] : (parsed.slug || id);
        categories.push({ id, slug, ...parsed });
      } catch (e) {}
    }
  } else if (line.includes("'companies'")) {
    const dataMatch = line.match(/'(\{"name":.*?\})'/);
    const idMatch = line.match(/VALUES \('([^']+)'/);
    const slugMatch = line.match(/, '([^']+)', NULL,/);
    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1].replace(/''/g, "'"));
        const id = idMatch ? idMatch[1] : '';
        const slug = slugMatch ? slugMatch[1] : (parsed.slug || id);
        companies.push({ id, slug, ...parsed });
      } catch (e) {}
    }
  } else if (line.includes("'jobs'")) {
    const dataMatch = line.match(/'(\{"title_ar":.*?\})'/);
    const idMatch = line.match(/VALUES \('([^']+)'/);
    const slugMatch = line.match(/, '([^']+)', NULL,/);
    const pubMatch = line.match(/, (17\d{11}),/);
    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1].replace(/''/g, "'"));
        const id = idMatch ? idMatch[1] : '';
        const slug = slugMatch ? slugMatch[1] : (parsed.slug || id);
        const publishedAt = pubMatch ? parseInt(pubMatch[1], 10) : (parsed.publishedAt || Date.now());
        jobs.push({ id, slug, publishedAt, ...parsed });
      } catch (e) {}
    }
  }
}

// Generate TS module
const tsContent = `// Auto-generated Fallback Dataset for High-Availability & D1 Rate Limit Fallback
// Contains static snapshot of jobs, categories, and companies

export interface FallbackCategory {
  id: string;
  slug: string;
  name_ar?: string;
  name_en?: string;
  name_tr?: string;
  icon?: string;
  [key: string]: any;
}

export interface FallbackCompany {
  id: string;
  slug: string;
  name?: string;
  logo?: string;
  website?: string;
  industry?: string;
  description?: string;
  [key: string]: any;
}

export interface FallbackJob {
  id: string;
  slug: string;
  title_ar?: string;
  title_en?: string;
  title_tr?: string;
  title_ru?: string;
  title_fa?: string;
  title_ur?: string;
  description_ar?: string;
  description_en?: string;
  description_tr?: string;
  description_ru?: string;
  description_fa?: string;
  description_ur?: string;
  location_ar?: string;
  location_en?: string;
  location_tr?: string;
  company?: string;
  category?: string;
  jobType?: string;
  salary?: string;
  applyLink?: string;
  applyEmail?: string;
  language?: string;
  featured?: boolean;
  publishedAt?: number;
  transitLine?: string;
  [key: string]: any;
}

export const FALLBACK_CATEGORIES: FallbackCategory[] = ${JSON.stringify(categories, null, 2)};

export const FALLBACK_COMPANIES: FallbackCompany[] = ${JSON.stringify(companies, null, 2)};

export const FALLBACK_JOBS: FallbackJob[] = ${JSON.stringify(jobs, null, 2)};

export function getFallbackJobs(filterFn?: (job: FallbackJob) => boolean): FallbackJob[] {
  if (filterFn) {
    return FALLBACK_JOBS.filter(filterFn);
  }
  return FALLBACK_JOBS;
}

export function getFallbackJobBySlug(slug: string): FallbackJob | undefined {
  return FALLBACK_JOBS.find(j => j.slug === slug || j.id === slug);
}

export function getFallbackCategories(): FallbackCategory[] {
  return FALLBACK_CATEGORIES;
}

export function getFallbackCompanies(): FallbackCompany[] {
  return FALLBACK_COMPANIES;
}
`;

const targetDir = path.join(process.cwd(), 'src/data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
fs.writeFileSync(path.join(targetDir, 'fallback-dataset.ts'), tsContent, 'utf8');
console.log(`Generated src/data/fallback-dataset.ts with ${categories.length} categories, ${companies.length} companies, and ${jobs.length} jobs.`);

