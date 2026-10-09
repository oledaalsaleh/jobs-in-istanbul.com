import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { 
  trabzonAppArticleAr, 
  trabzonAppArticleEn, 
  trabzonAppArticleTr
} from '../src/data/trabzon-app-article'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

const articlesToSeed = [
  {
    id: 'blog-post-trabzon-app-ar',
    slug: trabzonAppArticleAr.slug,
    title: trabzonAppArticleAr.title,
    content: trabzonAppArticleAr.content
  },
  {
    id: 'blog-post-trabzon-app-en',
    slug: trabzonAppArticleEn.slug,
    title: trabzonAppArticleEn.title,
    content: trabzonAppArticleEn.content
  },
  {
    id: 'blog-post-trabzon-app-tr',
    slug: trabzonAppArticleTr.slug,
    title: trabzonAppArticleTr.title,
    content: trabzonAppArticleTr.content
  }
];

const nowMs = Date.now();
let sqlStatements = '';

for (const art of articlesToSeed) {
  const dataObj = {
    title: art.title,
    slug: art.slug,
    content: art.content
  };

  sqlStatements += `INSERT OR REPLACE INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
VALUES (
  '${art.id}',
  '${art.id}',
  'blog_post',
  'published',
  1,
  1,
  '${escapeSql(art.slug)}',
  '${escapeSql(art.title)}',
  '${escapeSql(JSON.stringify(dataObj))}',
  ${nowMs},
  ${nowMs},
  ${nowMs}
);\n\n`;
}

const sqlPath = path.join(__dirname, 'seed-trabzon-article.sql');
fs.writeFileSync(sqlPath, sqlStatements, 'utf8');
console.log(`✓ SQL seed file written to ${sqlPath}`);
