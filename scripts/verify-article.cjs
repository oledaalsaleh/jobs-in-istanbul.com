const fs = require('fs');

const content = fs.readFileSync('src/data/trabzon-app-article.ts', 'utf8');

const keywords = [
  'السياحة في طرابزون',
  'دليل طرابزون السياحي 2026',
  'أماكن سياحية في طرابزون',
  'السياحة في الشمال التركي',
  'رحلتي إلى طرابزون',
  'السفر إلى طرابزون',
  'أفضل الأماكن في طرابزون للعوائل',
  'دليل الشمال التركي الشامل',
  'تطبيق دليل طرابزون',
  'تحميل تطبيق طرابزون السياحي',
  'تطبيق سياحي طرابزون بدون نت',
  'خريطة طرابزون السياحية بدون إنترنت',
  'إحداثيات الشمال التركي GPS',
  'برنامج ملاحة طرابزون أوفلاين',
  'خريطة الشمال التركي بالعربي',
  'تطبيق المسافر إلى تركيا',
  'دليل المسافر إلى طرابزون Google Play',
  'بحيرة أوزنجول طرابزون',
  'دير سوميلا في طرابزون',
  'مرتفعات آيدر ريزا',
  'مطل بوزتبي طرابزون',
  'قرية هامسي كوي طرابزون',
  'مغارة تشال طرابزون',
  'وادي فرتنا ريزا والرافتنج',
  'قلعة زيل ريزا (Zilkale)',
  'هضبة بوكوت فوق الغيوم',
  'هضبة هوسر بحر السحاب',
  'شلال بالوفيت ريزا',
  'بحيرة سيرا غول طرابزون',
  'مرتفعات سلطان مراد',
  'استئجار سيارة في طرابزون',
  'تأجير سيارات مطار طرابزون',
  'سائق خاص في طرابزون',
  'أسعار استئجار السيارات في طرابزون',
  'القيادة في الشمال التركي نصائح',
  'سيارة بدون سائق في طرابزون',
  'تكلفة السائق اليومي في طرابزون',
  'برنامج سياحي طرابزون 7 أيام',
  'جدول سياحي طرابزون والشمال التركي',
  'طقس طرابزون في الصيف',
  'أفضل وقت لزيارة طرابزون',
  'تكلفة السافر إلى طرابزون لشخصين', // check alternative spelling if any
  'طرابزون في الخريف وشهر أكتوبر',
  'السياحة في طرابزون في الشتاء',
  'أكواخ طرابزون على النهر',
  'أكواخ أوزنجول الخشبية',
  'مطاعم طرابزون الموصى بها',
  'كفتة أكتشابات طرابزون',
  'مهلبية هامسي كوي الأصلية (سوتلاج)',
  'أساور طرابزون الذهبية (Trabzon Hasırı)'
];

// Extract trabzonAppArticleAr content
const arStart = content.indexOf('export const trabzonAppArticleAr');
const enStart = content.indexOf('export const trabzonAppArticleEn');
const arSection = content.substring(arStart, enStart !== -1 ? enStart : content.length);

const stripped = arSection.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const words = stripped.split(' ').length;

console.log('--- ARABIC ARTICLE STATS ---');
console.log('Total words in Arabic section:', words);

let matchedCount = 0;
const missing = [];
keywords.forEach((kw, index) => {
  // Try normal check, also replace 'السافر' if typo with 'السفر'
  let target = kw;
  if (kw === 'تكلفة السافر إلى طرابزون لشخصين') target = 'تكلفة السفر إلى طرابزون لشخصين';
  
  if (arSection.includes(target)) {
    matchedCount++;
  } else {
    missing.push({ index: index + 1, keyword: target });
  }
});

console.log(`Matched keywords: ${matchedCount} / ${keywords.length}`);
if (missing.length > 0) {
  console.log('Missing keywords:', JSON.stringify(missing, null, 2));
} else {
  console.log('ALL 50 KEYWORDS ARE PRESENT!');
}
