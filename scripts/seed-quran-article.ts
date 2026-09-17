import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { 
  quranAppArticleAr, 
  quranAppArticleEn, 
  quranAppArticleTr,
  quranAppArticleUr,
  quranAppArticleId,
  quranAppArticleFr,
  quranAppArticleRu,
  quranAppArticleFa,
  quranAppArticleBn,
  quranAppArticleDe
} from '../src/data/quran-app-article'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

const articlesToSeed = [
  {
    id: 'blog-post-quran-app-ar',
    slug: quranAppArticleAr.slug,
    title: quranAppArticleAr.title,
    content: quranAppArticleAr.content
  },
  {
    id: 'blog-post-quran-app-en',
    slug: quranAppArticleEn.slug,
    title: quranAppArticleEn.title,
    content: quranAppArticleEn.content
  },
  {
    id: 'blog-post-quran-app-tr',
    slug: quranAppArticleTr.slug,
    title: quranAppArticleTr.title,
    content: quranAppArticleTr.content
  },
  {
    id: 'blog-post-quran-app-ur',
    slug: quranAppArticleUr.slug,
    title: quranAppArticleUr.title,
    content: quranAppArticleUr.content
  },
  {
    id: 'blog-post-quran-app-id',
    slug: quranAppArticleId.slug,
    title: quranAppArticleId.title,
    content: quranAppArticleId.content
  },
  {
    id: 'blog-post-quran-app-fr',
    slug: quranAppArticleFr.slug,
    title: quranAppArticleFr.title,
    content: quranAppArticleFr.content
  },
  {
    id: 'blog-post-quran-app-ru',
    slug: quranAppArticleRu.slug,
    title: quranAppArticleRu.title,
    content: quranAppArticleRu.content
  },
  {
    id: 'blog-post-quran-app-fa',
    slug: quranAppArticleFa.slug,
    title: quranAppArticleFa.title,
    content: quranAppArticleFa.content
  },
  {
    id: 'blog-post-quran-app-bn',
    slug: quranAppArticleBn.slug,
    title: quranAppArticleBn.title,
    content: quranAppArticleBn.content
  },
  {
    id: 'blog-post-quran-app-de',
    slug: quranAppArticleDe.slug,
    title: quranAppArticleDe.title,
    content: quranAppArticleDe.content
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

const sqlPath = path.join(__dirname, 'seed-quran-article.sql');
fs.writeFileSync(sqlPath, sqlStatements, 'utf8');
console.log(`✓ SQL seed file written to ${sqlPath}`);
