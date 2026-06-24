# Istanbul Jobs Portal (فرص عمل في إسطنبول)

A premium, high-performance, and secure multilingual jobs board for Istanbul ("فرص عمل في إسطنبول") built with **SonicJS CMS** and deployed natively on **Cloudflare Workers**. 

---

## 🚀 Features

1. **Premium & Responsive UI**: Designed with bespoke Vanilla CSS, Outfit (for English) & Cairo (for Arabic) google fonts, smooth card hover micro-animations, and dynamic mobile-first responsive layouts.
2. **Built-in CMS & Custom Collections**:
   - **Jobs**: Title, slug, i18n description, location (Istanbul districts), salary, email/link application method, featured posts, and status tracking.
   - **Companies**: Name, slug, logo (R2 linked), website, industry, and description.
   - **Categories**: Arabic/English display names, icon emojis, and slugs.
3. **Advanced Technical SEO**:
   - **Dynamic Sitemap (`/sitemap.xml`)**: Automatically registers active jobs, categories, and static pages with correct multilingual `xhtml:link` hreflang alternate tags.
   - **robots.txt (`/robots.txt`)**: Directs web crawlers and specifies the dynamic sitemap location.
   - **RSS Feed (`/rss.xml`)**: RSS 2.0 job feed for automated aggregators.
   - **SEO Metadata**: Automatic insertion of OpenGraph, Twitter Cards, Canonical Links, and `hreflang` translation mappings.
   - **Schema.org Structured Data**: Generates dynamic JSON-LD scripts for `Organization`, `WebSite`, `BreadcrumbList`, and `JobPosting` (complying with Google Job Search indexing guidelines).
4. **Security Hardening**:
   - **Rate Limiter**: Cloudflare KV-based rate limiting (5 requests per 10 minutes per IP) to protect public form submissions.
   - **Input Validation**: Server-side request validation using **Zod** schema.
   - **Audit Events**: Sensitive action logger (e.g. form submissions, blocked IPs) stored inside the CMS `security_event` collection.
   - **HTTP Headers**: Enforces secure HSTS, Content-Security-Policy (CSP), Frame-options, and Referrer policies.
5. **High Performance Caching**:
   - **Edge Cache**: Hono Cache API middleware for fast TTFB (60s homepage, 300s job details).
   - **Lazy Loading**: Automatic browser lazy-loading for image assets.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18 or higher
- A Cloudflare account (free tier works great)

### Installation
1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Local Database & Schema**:
   ```bash
   npm run db:migrate:local
   ```

3. **Seed Database (Admin + Jobs Board Data)**:
   - Registers admin credentials: `admin@jobs-in-istanbul.com` / `AdminSecurePassword2026!`
   - Seeds categories, 4 companies, and 5 job vacancies in Istanbul (Fatih, Sisli, Basaksehir, etc.) in both Arabic and English.
   ```bash
   npm run seed
   npm run seed:jobs
   ```

4. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:8787` (Public English), `http://localhost:8787/ar` (Public Arabic), or `http://localhost:8787/admin` (SonicJS CMS admin dashboard).

---

## 🧪 Running Tests

Verify the routes, D1 database queries, and SEO XML configurations locally:
```bash
npm run test
```

To run TypeScript compilation validation:
```bash
npm run type-check
```

---

## ⛅ Cloudflare Deployment

To deploy this application to your own Cloudflare account:

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Create Production D1 Database**:
   ```bash
   npx wrangler d1 create jobs_db
   ```
   Copy the `database_id` from the terminal output and paste it under the `database_id` field inside the `wrangler.toml` file.

3. **Create Production R2 Media Bucket**:
   ```bash
   npx wrangler r2 bucket create jobs-media
   ```

4. **Create Production KV Namespace (for Caching & Rate Limiting)**:
   ```bash
   npx wrangler kv:namespace create CACHE_KV
   ```
   Copy the `id` from the output and add the binding details in your `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE_KV"
   id = "PASTE_THE_KV_ID_HERE"
   ```

5. **Deploy code to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

6. **Apply Migrations to Production DB**:
   ```bash
   npm run db:migrate
   ```

7. **Seed Production DB**:
   Ensure you have configured your environment variables and secrets (like `JWT_SECRET`) on Cloudflare before running.

---

## 📦 Directory Structure

```
jobs-in-istanbul.com/
├── migrations/                # SQLite/D1 Migrations
├── scripts/
│   ├── seed-admin.ts          # Default Admin User seed
│   └── seed-jobs.ts           # Categories, Companies, and Jobs seed
├── src/
│   ├── collections/           # SonicJS Schema Definitions
│   │   ├── categories.collection.ts
│   │   ├── companies.collection.ts
│   │   └── jobs.collection.ts
│   ├── middleware/            # Security and validation middlewares
│   │   └── security.ts
│   ├── routes/                # Application routes
│   │   ├── public.ts          # Public Multilingual frontend
│   │   └── seo.ts             # robots.txt, sitemap.xml, rss.xml
│   ├── utils/
│   │   └── seo-helper.ts      # HTML Meta tags & JSON-LD helpers
│   └── index.ts               # Application entry point
├── tests/
│   └── smoke.test.ts          # Vitest integration smoke tests
├── wrangler.toml              # Cloudflare worker/bindings configuration
├── package.json
└── tsconfig.json
```

---

## 📄 License
MIT
