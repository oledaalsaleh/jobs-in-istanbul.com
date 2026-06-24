import { DatabaseSync } from 'node:sqlite'
import * as fs from 'node:fs'
import * as path from 'node:path'

async function run() {
  try {
    const baseDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    if (!fs.existsSync(baseDir)) {
      console.error('❌ Miniflare state directory not found');
      process.exit(1);
    }

    const files = fs.readdirSync(baseDir)
      .filter(f => f.endsWith('.sqlite') && f !== 'metadata.sqlite')
      .map(f => ({ name: f, size: fs.statSync(path.join(baseDir, f)).size }));

    if (files.length === 0) {
      console.error('❌ No SQLite database files found');
      process.exit(1);
    }

    // Sort by size descending to pick the populated database
    files.sort((a, b) => b.size - a.size);
    const dbFile = files[0].name;
    const dbPath = path.join(baseDir, dbFile);
    console.log(`⏳ Exporting tables from local database: ${dbFile} (${Math.round(files[0].size/1024)} KB)`);

    const db = new DatabaseSync(dbPath);

    const tables = [
      'document_types',
      'documents',
      'document_references',
      'auth_user',
      'auth_account'
    ];

    let sqlOutput = `-- Auto-generated Production Seed Dump\n`;
    sqlOutput += `PRAGMA foreign_keys = OFF;\n\n`;

    for (const table of tables) {
      // Check if table exists
      const tableCheck = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table) as any;
      if (!tableCheck) {
        console.log(`⚠️ Table ${table} does not exist in local database. Skipping.`);
        continue;
      }

      console.log(`⏳ Exporting table: ${table}...`);
      const rows = db.prepare(`SELECT * FROM ${table}`).all() as any[];
      console.log(`   Found ${rows.length} rows`);

      if (rows.length === 0) continue;

      sqlOutput += `-- Data for ${table}\n`;
      for (const row of rows) {
        const columns = Object.keys(row).filter(col => !col.startsWith('q_'));
        const values = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val.toString();
          // Escape single quotes
          const escaped = val.toString().replace(/'/g, "''");
          return `'${escaped}'`;
        });

        sqlOutput += `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlOutput += `\n`;
    }

    sqlOutput += `PRAGMA foreign_keys = ON;\n`;

    const destPath = path.join(process.cwd(), 'seed_production.sql');
    fs.writeFileSync(destPath, sqlOutput, 'utf8');
    console.log(`✓ Production SQL seed file generated at: seed_production.sql`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

run();
