import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { 
  aktuelAppArticleAr, 
  aktuelAppArticleEn, 
  aktuelAppArticleTr
} from '../src/data/aktuel-app-article'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

const articlesToSeed = [
  {
    id: 'blog-post-aktuel-app-ar',
    slug: aktuelAppArticleAr.slug,
    title: aktuelAppArticleAr.title,
    content: aktuelAppArticleAr.content
  },
  {
    id: 'blog-post-aktuel-app-en',
    slug: aktuelAppArticleEn.slug,
    title: aktuelAppArticleEn.title,
    content: aktuelAppArticleEn.content
  },
  {
    id: 'blog-post-aktuel-app-tr',
    slug: aktuelAppArticleTr.slug,
    title: aktuelAppArticleTr.title,
    content: aktuelAppArticleTr.content
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

const sqlPath = path.join(__dirname, 'seed-aktuel-article.sql');
fs.writeFileSync(sqlPath, sqlStatements, 'utf8');
console.log(`✓ SQL seed file written to ${sqlPath}`);
