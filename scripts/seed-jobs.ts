import { bootstrapDocumentTypes, registerCollections } from '@sonicjs-cms/core'
import { getPlatformProxy } from 'wrangler'
import categoriesCollection from '../src/collections/categories.collection'
import companiesCollection from '../src/collections/companies.collection'
import jobsCollection from '../src/collections/jobs.collection'

// Register collections in memory so bootstrapDocumentTypes knows about them
registerCollections([
  categoriesCollection,
  companiesCollection,
  jobsCollection,
])

async function seed() {
  const { env, dispose } = await getPlatformProxy()

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Run migrations first: npm run db:migrate:local')
    process.exit(1)
  }

  try {
    console.log('⏳ Registering collection schemas in DB...');
    // This will register system schemas
    await bootstrapDocumentTypes(env.DB)
    console.log('✓ System schemas bootstrapped');

    console.log('⏳ Inserting custom collection document types into document_types table...');
    const nowSec = Math.floor(Date.now() / 1000);
    const typesToRegister = [
      { id: 'categories', name: 'categories', displayName: 'Categories', desc: 'Job categories and sectors' },
      { id: 'companies', name: 'companies', displayName: 'Companies', desc: 'Hiring companies list' },
      { id: 'jobs', name: 'jobs', displayName: 'Jobs', desc: 'Manage job postings for Istanbul' }
    ];

    for (const t of typesToRegister) {
      await env.DB.prepare(
        `INSERT OR REPLACE INTO document_types (id, name, display_name, description, schema, queryable_fields, settings, source, schema_version, is_system, is_active, is_auth, created_at, updated_at)
         VALUES (?, ?, ?, ?, '{}', '[]', '{"baseGrants":{"public":["read"],"admin":["read","create","update","delete","publish","manage"],"editor":["read","create","update","publish"],"viewer":["read"]},"maxVersionsPerRoot":50}', 'code', 1, 0, 1, 0, ?, ?)`
      ).bind(t.id, t.name, t.displayName, t.desc, nowSec, nowSec).run();
    }
    console.log('✓ Custom document types registered in DB');

    const types = await env.DB.prepare('SELECT id, name FROM document_types').all();
    console.log('Registered document types in DB:', types.results);

    // Clean existing data for clean re-seeding
    console.log('⏳ Cleaning old data...');
    await env.DB.prepare("DELETE FROM documents WHERE type_id IN ('categories', 'companies', 'jobs')").run();
    await env.DB.prepare("DELETE FROM document_references").run();
    console.log('✓ Old data cleaned');

    const nowMs = Date.now();

    // 1. Seed Categories
    console.log('⏳ Seeding categories...');
    const categories = [
      { id: 'cat-it', name_ar: 'تكنولوجيا المعلومات والبرمجة', name_en: 'IT & Software', slug: 'it-software', icon: '💻' },
      { id: 'cat-tourism', name_ar: 'السياحة والفنادق', name_en: 'Tourism & Hospitality', slug: 'tourism-hospitality', icon: '✈️' },
      { id: 'cat-realestate', name_ar: 'العقارات والمبيعات', name_en: 'Real Estate & Sales', slug: 'real-estate-sales', icon: '🏢' },
      { id: 'cat-education', name_ar: 'التعليم والتدريس', name_en: 'Education & Teaching', slug: 'education-teaching', icon: '🎓' },
      { id: 'cat-customer', name_ar: 'خدمة العملاء والترجمة', name_en: 'Customer Service & Translation', slug: 'customer-service-translation', icon: '📞' }
    ];

    for (const cat of categories) {
      const data = JSON.stringify({
        name_ar: cat.name_ar,
        name_en: cat.name_en,
        slug: cat.slug,
        icon: cat.icon
      });

      await env.DB.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
         VALUES (?, ?, 'categories', 'published', 1, 1, ?, ?, ?, ?, ?)`
      ).bind(cat.id, cat.id, cat.slug, cat.name_en, data, nowMs, nowMs).run();
    }
    console.log('✓ Categories seeded');

    // 2. Seed Companies
    console.log('⏳ Seeding companies...');
    const companies = [
      {
        id: 'comp-ist-tech',
        name: 'Istanbul Tech Hub',
        slug: 'istanbul-tech-hub',
        logo: '/public/images/company-tech.svg',
        website: 'https://istanbultechhub.example.com',
        industry: 'Software Development',
        description: 'A leading innovative technology and co-working center based in Şişli.'
      },
      {
        id: 'comp-bosporus-re',
        name: 'Bosporus Real Estate',
        slug: 'bosporus-real-estate',
        logo: '/public/images/company-re.svg',
        website: 'https://bosporusre.example.com',
        industry: 'Real Estate',
        description: 'Premium real estate advisory and sales company operating in Fatih and Beyoğlu.'
      },
      {
        id: 'comp-tulip-hotels',
        name: 'Tulip Hospitality Group',
        slug: 'tulip-hospitality-group',
        logo: '/public/images/company-hotel.svg',
        website: 'https://tuliphotels.example.com',
        industry: 'Tourism',
        description: 'Five-star boutique hotel chain with multiple locations in Sultanahmet and Taksim.'
      },
      {
        id: 'comp-ist-academy',
        name: 'Istanbul English Academy',
        slug: 'istanbul-english-academy',
        logo: '/public/images/company-education.svg',
        website: 'https://istanbulacademy.example.com',
        industry: 'Education',
        description: 'International language center in Başakşehir offering TOEFL and general English tutoring.'
      }
    ];

    for (const comp of companies) {
      const data = JSON.stringify({
        name: comp.name,
        slug: comp.slug,
        logo: comp.logo,
        website: comp.website,
        industry: comp.industry,
        description: comp.description
      });

      await env.DB.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
         VALUES (?, ?, 'companies', 'published', 1, 1, ?, ?, ?, ?, ?)`
      ).bind(comp.id, comp.id, comp.slug, comp.name, data, nowMs, nowMs).run();
    }
    console.log('✓ Companies seeded');

    // 3. Seed Jobs
    console.log('⏳ Seeding jobs...');
    const jobs = [
      {
        id: 'job-react-dev',
        title_ar: 'مطور واجهات أمامية React (دوام كامل)',
        title_en: 'React Frontend Developer (Full-time)',
        slug: 'react-frontend-developer-full-time',
        description_ar: 'نبحث عن مطور React ذو خبرة للانضمام إلى فريقنا البرمجي في شيشلي. المهام تشمل بناء واجهات الويب التفاعلية وتحسين أداء المواقع. المتطلبات: خبرة سنتين على الأقل في React/Next.js وإجادة اللغة الإنجليزية.',
        description_en: 'We are looking for an experienced React Developer to join our engineering team in Şişli. Responsibilities include building responsive UI components and web performance tuning. Requirements: 2+ years of experience with React/Next.js and proficiency in English.',
        company: 'comp-ist-tech',
        category: 'cat-it',
        location_ar: 'شيشلي، إسطنبول',
        location_en: 'Sisli, Istanbul',
        jobType: 'full-time',
        salary: '35,000 - 48,000 TL',
        applyLink: 'https://istanbultechhub.example.com/apply',
        applyEmail: 'careers@istanbultechhub.example.com',
        language: 'en',
        featured: true
      },
      {
        id: 'job-sales-agent',
        title_ar: 'مستشار عقاري ناطق بالعربية والانجليزية',
        title_en: 'Bilingual Real Estate Consultant',
        slug: 'bilingual-real-estate-consultant',
        description_ar: 'مطلوب مستشار مبيعات عقارية للعمل في مكتبنا الرئيسي في الفاتح. يتطلب العمل التواصل مع العملاء العرب والأجانب المهتمين بالاستثمار العقاري في تركيا. يفضل توفر رخصة قيادة وخبرة في مبيعات المجمعات السكنية.',
        description_en: 'We are seeking a Real Estate Consultant for our Fatih office. The role involves negotiating and coordinating transactions with Arab and international buyers investing in Turkey. Drivers license and real estate sales experience in Istanbul are highly preferred.',
        company: 'comp-bosporus-re',
        category: 'cat-realestate',
        location_ar: 'الفاتح، إسطنبول',
        location_en: 'Fatih, Istanbul',
        jobType: 'full-time',
        salary: '25,000 TL + عمولات مجزية',
        applyLink: '',
        applyEmail: 'sales@bosporusre.example.com',
        language: 'both',
        featured: true
      },
      {
        id: 'job-receptionist',
        title_ar: 'موظف استقبال فندقي (شيفت مسائي)',
        title_en: 'Hotel Receptionist (Night Shift)',
        slug: 'hotel-receptionist-night-shift',
        description_ar: 'فندق بوتيك في السلطان أحمد يبحث عن موظف استقبال للعمل في الوردية المسائية. المهام: استقبال النزلاء وتسهيل تسجيل الدخول والرد على الاستفسارات الهاتفية. يجب معرفة جيدة باللغة الإنجليزية والعربية.',
        description_en: 'A boutique hotel in Sultanahmet is looking for a Night Shift Receptionist. Tasks include welcoming guests, handling check-ins/check-outs, and answering phone inquiries. Good command of English and Arabic is required.',
        company: 'comp-tulip-hotels',
        category: 'cat-tourism',
        location_ar: 'السلطان أحمد، إسطنبول',
        location_en: 'Sultanahmet, Istanbul',
        jobType: 'full-time',
        salary: '22,000 - 26,000 TL',
        applyLink: 'https://tuliphotels.example.com/careers',
        applyEmail: 'hr@tuliphotels.example.com',
        language: 'both',
        featured: false
      },
      {
        id: 'job-english-teacher',
        title_ar: 'مدرس لغة إنجليزية بدوام جزئي',
        title_en: 'Part-time English Tutor',
        slug: 'part-time-english-tutor',
        description_ar: 'مطلوب مدرس لغة إنجليزية ناطق بها كلغة أم أو بمستواها لتدريس مجموعات صغيرة من الطلاب في باشاك شهير. العمل مسائي أو في عطلة نهاية الأسبوع. يفضل توفر شهادة CELTA أو TEFL.',
        description_en: 'We require a native-level English teacher to tutor small groups of students at our language institute in Basaksehir. Evening or weekend sessions. CELTA/TEFL certificate is preferred.',
        company: 'comp-ist-academy',
        category: 'cat-education',
        location_ar: 'باشاك شهير، إسطنبول',
        location_en: 'Basaksehir, Istanbul',
        jobType: 'part-time',
        salary: '350 TL / ساعة',
        applyLink: '',
        applyEmail: 'apply@istanbulacademy.example.com',
        language: 'en',
        featured: false
      },
      {
        id: 'job-customer-rep',
        title_ar: 'ممثل خدمة عملاء كول سنتر (عمل عن بعد)',
        title_en: 'Remote Customer Service Representative',
        slug: 'remote-customer-service-representative',
        description_ar: 'مطلوب موظف خدمة عملاء للعمل عن بعد لصالح متجر إلكتروني. المهام: الرد على استفسارات العملاء وحل المشكلات الفنية عبر الواتساب والإيميل. ساعات العمل مرنة ويشترط توفر إنترنت سريع وحاسوب شخصي.',
        description_en: 'Remote customer support position for an e-commerce platform. Tasks include answering client requests and troubleshooting issues via WhatsApp and email. Flexible hours, reliable internet connection and a personal computer are required.',
        company: 'comp-ist-tech',
        category: 'cat-customer',
        location_ar: 'عمل عن بعد، إسطنبول',
        location_en: 'Remote, Istanbul',
        jobType: 'remote',
        salary: '18,000 - 22,000 TL',
        applyLink: 'https://istanbultechhub.example.com/apply',
        applyEmail: 'careers@istanbultechhub.example.com',
        language: 'ar',
        featured: false
      }
    ];

    for (const job of jobs) {
      const data = JSON.stringify({
        title_ar: job.title_ar,
        title_en: job.title_en,
        slug: job.slug,
        description_ar: job.description_ar,
        description_en: job.description_en,
        company: job.company,
        category: job.category,
        location_ar: job.location_ar,
        location_en: job.location_en,
        jobType: job.jobType,
        salary: job.salary,
        applyLink: job.applyLink,
        applyEmail: job.applyEmail,
        language: job.language,
        featured: job.featured,
        publishedAt: nowMs,
        status: 'published'
      });

      // Insert document
      await env.DB.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
         VALUES (?, ?, 'jobs', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
      ).bind(job.id, job.id, job.slug, job.title_en, data, nowMs, nowMs, nowMs).run();

      // Insert references to create relational links (document_references table)
      // 1. Company reference
      await env.DB.prepare(
        `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
         VALUES (?, 'default', ?, ?, 'company', 0, ?, 'weak')`
      ).bind(`ref-${job.id}-company`, job.id, job.id, job.company).run();

      // 2. Category reference
      await env.DB.prepare(
        `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
         VALUES (?, 'default', ?, ?, 'category', 0, ?, 'weak')`
      ).bind(`ref-${job.id}-category`, job.id, job.id, job.category).run();
    }
    console.log('✓ Jobs seeded');

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    await dispose()
    process.exit(1)
  }

  await dispose()
  console.log('🎉 Seeding complete successfully!')
}

seed();
