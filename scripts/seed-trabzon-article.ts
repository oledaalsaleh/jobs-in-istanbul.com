import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { 
  trabzonAppArticleAr, 
  trabzonAppArticleEn, 
  trabzonAppArticleTr,
  trabzonAppArticleRu,
  trabzonAppArticleFa,
  trabzonAppArticleUr,
  trabzonAppArticleId,
  trabzonAppArticleFr,
  trabzonAppArticleBn,
  trabzonAppArticleDe
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
  },
  {
    id: 'blog-post-trabzon-app-ru',
    slug: trabzonAppArticleRu.slug,
    title: trabzonAppArticleRu.title,
    content: trabzonAppArticleRu.content
  },
  {
    id: 'blog-post-trabzon-app-fa',
    slug: trabzonAppArticleFa.slug,
    title: trabzonAppArticleFa.title,
    content: trabzonAppArticleFa.content
  },
  {
    id: 'blog-post-trabzon-app-ur',
    slug: trabzonAppArticleUr.slug,
    title: trabzonAppArticleUr.title,
    content: trabzonAppArticleUr.content
  },
  {
    id: 'blog-post-trabzon-app-id',
    slug: trabzonAppArticleId.slug,
    title: trabzonAppArticleId.title,
    content: trabzonAppArticleId.content
  },
  {
    id: 'blog-post-trabzon-app-fr',
    slug: trabzonAppArticleFr.slug,
    title: trabzonAppArticleFr.title,
    content: trabzonAppArticleFr.content
  },
  {
    id: 'blog-post-trabzon-app-bn',
    slug: trabzonAppArticleBn.slug,
    title: trabzonAppArticleBn.title,
    content: trabzonAppArticleBn.content
  },
  {
    id: 'blog-post-trabzon-app-de',
    slug: trabzonAppArticleDe.slug,
    title: trabzonAppArticleDe.title,
    content: trabzonAppArticleDe.content
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
console.log(`✓ SQL seed file for all 10 languages written to ${sqlPath}`);
