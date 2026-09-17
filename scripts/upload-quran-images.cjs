const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, '../public/images/quran-app');
const files = fs.readdirSync(dir);

console.log(`Found ${files.length} images to upload...`);

for (const file of files) {
  const filePath = path.join(dir, file);
  const ext = path.extname(file).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const r2Key = `public/images/quran-app/${file}`;

  console.log(`Uploading local: ${file}...`);
  try {
    execSync(`npx.cmd wrangler r2 object put "jobs-media/${r2Key}" --file="${filePath}" --content-type="${contentType}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed local upload for ${file}:`, e.message);
  }

  // Also upload remote if wrangler is authenticated
  console.log(`Uploading remote (production): ${file}...`);
  try {
    execSync(`npx.cmd wrangler r2 object put "jobs-media/${r2Key}" --file="${filePath}" --content-type="${contentType}" --remote`, { stdio: 'inherit' });
  } catch (e) {
    console.warn(`Remote upload for ${file} skipped or failed:`, e.message);
  }
}

console.log('Finished image uploads.');
