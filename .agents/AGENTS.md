# Jobs in Istanbul Portal Developer Rules

## Locales & Multi-Language Support
* The website supports three locales: Arabic (`ar`), English (`en`), and Turkish (`tr`).
* Always ensure routing allows all three language prefixes.
* When querying tables (such as `categories` or `jobs`), if the requested translation key (e.g., `name_tr`, `title_tr`, `location_tr`) is missing or empty, gracefully fallback to English (`name_en`, `title_en`, `location_en`).

## Active Features & Routes
* **Currency Prices**: Accessed at `/:locale/currency-prices`. Data is regularly seeded/scraped.
* **Gold Prices**: Accessed at `/:locale/gold-prices`. Data is regularly seeded/scraped.
* **Workplace Language Quiz**: Accessed at `/:locale/workplace-quiz` containing essential Turkish vocabulary.

## Technical Environment
* Built with Hono running on Cloudflare Workers.
* Local database: D1.
* Production env deployment command: `npx wrangler deploy --env production`.
