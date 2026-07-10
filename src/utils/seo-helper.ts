/**
 * SEO & Structured Data Helpers
 *
 * Generates meta tags and Schema.org structured data (JSON-LD) for different pages.
 */

interface MetaDataInput {
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  publishedAt?: number;
  companyName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  industry?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  seoKeywords?: string[] | string;
  seoDescription?: string;
  canonical?: string;
}

export function generateMetaTags(locale: 'ar' | 'en' | 'tr' | 'ru', pageType: 'home' | 'job' | 'submit' | 'blog' | 'blog_post', data: MetaDataInput = {}) {
  const siteUrl = 'https://jobs-in-istanbul.com';

  const defaults = {
    ar: {
      title: 'وظائف في إسطنبول | وظائف لمتحدثي الإنجليزية في تركيا',
      desc: 'ابحث عن أحدث فرص العمل للوافدين والمحترفين المتحدثين باللغة الإنجليزية في إسطنبول. تقدّم للوظائف التقنية، المبيعات، والتعليم اليوم.',
    },
    en: {
      title: 'Jobs in Istanbul | English Speaking Jobs in Turkey',
      desc: 'Find the latest job opportunities for expats and English-speaking professionals in Istanbul. Apply to tech, sales, and education roles today.',
    },
    tr: {
      title: 'İstanbul İş İlanları | Türkiye\'de İngilizce ve Türkçe İş Fırsatları',
      desc: 'İstanbul\'daki yabancılar ve yerel profesyoneller için en son iş fırsatlarını bulun. Teknoloji, satış, eğitim ve diğer sektörlerdeki işlere bugün başvurun.',
    },
    ru: {
      title: 'Работа в Стамбуле | Вакансии для иностранцев и русскоязычных',
      desc: 'Найдите последние вакансии для экспатов и русскоязычных специалистов в Стамбуле. Подайте заявку на работу в сфере IT, продаж и образования сегодня.',
    }
  }[locale];

  let title = data.title || defaults.title;
  let desc = data.seoDescription || data.description || defaults.desc;

  if (pageType === 'job') {
    title = locale === 'tr'
      ? `${data.title} - ${data.companyName} bünyesinde İstanbul'da İş İlanı`
      : (locale === 'ar'
        ? `${data.title} - وظيفة في إسطنبول لدى ${data.companyName}`
        : (locale === 'ru'
          ? `${data.title} - Работа в Стамбуле в компании ${data.companyName}`
          : `${data.title} - Job in Istanbul at ${data.companyName}`));
    desc = data.seoDescription || (data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc);
  } else if (pageType === 'submit') {
    title = locale === 'tr' ? 'İstanbul\'da İş İlanı Yayınlayın' : (locale === 'ar' ? 'أعلن عن وظيفة شاغرة في إسطنبول' : (locale === 'ru' ? 'Разместить вакансию в Стамбуле' : 'Post a Job Vacancy in Istanbul'));
    desc = locale === 'tr'
      ? 'Şirketinizdeki açık pozisyonlar için ilan verin, İstanbul\'daki binlerce nitelikli iş arayana ulaşın.'
      : (locale === 'ar'
        ? 'أعلن عن وظيفة شاغرة في شركتك وقم بالوصول إلى آلاف الكفاءات والباحثين عن عمل في إسطنبول.'
        : (locale === 'ru'
          ? 'Разместите вакансию вашей компании и привлеките тысячи квалифицированных соискателей в Стамбуле.'
          : 'Post a vacancy in your organization and reach thousands of skilled job seekers in Istanbul.'));
  } else if (pageType === 'blog') {
    title = locale === 'tr'
      ? 'Kariyer Blogu - İstanbul | Çalışma İzni ve Ulaşım İpuçları'
      : (locale === 'ar'
        ? 'مدونة المهنة - إسطنبول | نصائح التوظيف وإقامة العمل في تركيا'
        : (locale === 'ru'
          ? 'Блог о карьере в Стамбуле | Разрешения на работу и транспорт'
          : 'Career Blog - Istanbul | Work Permits & Commuting Tips'));
    desc = locale === 'tr'
      ? 'İstanbul\'da çalışmaya dair rehberiniz. ATS özgeçmiş optimizasyonu, çalışma izni yasaları ve ulaşım hakkında ipuçları içeren yazıları okuyun.'
      : (locale === 'ar'
        ? 'دليلك المهني الشامل ونواصح التوظيف في إسطنبول. اقرأ حول تعديل السير الذاتية لأنظمة ATS وقوانين إقامة العمل والمواصلات في إسطنبول.'
        : (locale === 'ru'
          ? 'Ваш гид по работе в Стамбуле. Читайте статьи об оптимизации резюме для ATS, законах о разрешениях на работу и транспорте.'
          : 'Your ultimate guide to working in Istanbul. Read articles on ATS resume optimization, work permit laws, and navigating transportation.'));
  } else if (pageType === 'blog_post') {
    title = locale === 'tr'
      ? `${data.title} | İstanbul Kariyer Blogu`
      : (locale === 'ar'
        ? `${data.title} | مدونة المهنة إسطنبول`
        : (locale === 'ru'
          ? `${data.title} | Блог о карьере в Стамбуле`
          : `${data.title} | Istanbul Career Blog`));
    desc = data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc;
  }

  // Calculate canonical & alternate URLs based on pageType
  let canonicalUrl = data.canonical || `${siteUrl}/${locale}`;
  if (!data.canonical) {
    if (pageType === 'job' && data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/jobs/${data.slug}`;
    } else if (pageType === 'blog') {
      canonicalUrl = `${siteUrl}/${locale}/blog`;
    } else if (pageType === 'blog_post' && data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/blog/${data.slug}`;
    } else if (data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/${data.slug}`;
    }
  }

  // Helper to build alternate URLs
  const getLocaleUrl = (loc: string) => {
    let url = `${siteUrl}/${loc}`;
    if (pageType === 'job' && data.slug) {
      url = `${siteUrl}/${loc}/jobs/${data.slug}`;
    } else if (pageType === 'blog') {
      url = `${siteUrl}/${loc}/blog`;
    } else if (pageType === 'blog_post' && data.slug) {
      url = `${siteUrl}/${loc}/blog/${data.slug}`;
    } else if (data.slug) {
      url = `${siteUrl}/${loc}/${data.slug}`;
    }
    return url;
  };

  const arUrl = getLocaleUrl('ar');
  const enUrl = getLocaleUrl('en');
  const trUrl = getLocaleUrl('tr');
  const ruUrl = getLocaleUrl('ru');

  let keywordsStr = locale === 'tr'
    ? 'istanbul iş ilanları, türkiye iş fırsatları, istanbulda iş bulmak, türkçe iş ilanları, ingilizce işler, kariyer blogu, çalışma izni türkiye'
    : (locale === 'ar'
      ? 'وظائف في إسطنبول, فرص عمل في تركيا, شغل في تركيا للعرب, وظائف شاغرة, توظيف, jobsintr, تركيا, مدونة التوظيف'
      : (locale === 'ru'
        ? 'работа в стамбуле, вакансии в турции, поиск работы в стамбуле, работа для русских, блог о карьере, разрешение на работу в турции'
        : 'jobs in istanbul, working in turkey, employment, vacancies, istanbul jobs, career blog, work permit turkey'));

  if (data.seoKeywords) {
    let list: string[] = [];
    if (Array.isArray(data.seoKeywords)) {
      list = data.seoKeywords;
    } else if (typeof data.seoKeywords === 'string') {
      try {
        // In case it was saved as a JSON string containing an array
        if (data.seoKeywords.trim().startsWith('[')) {
          const parsed = JSON.parse(data.seoKeywords);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } else {
          list = data.seoKeywords.split(',').map(s => s.trim()).filter(Boolean);
        }
      } catch (err) {
        list = data.seoKeywords.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (list.length > 0) {
      keywordsStr = list.join(', ') + ', ' + keywordsStr;
    }
  }

  return `
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywordsStr}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/png" href="${siteUrl}/public/images/logo.png">
  
  <!-- i18n Multilingual Links -->
  <link rel="alternate" hreflang="ar" href="${arUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="tr" href="${trUrl}">
  <link rel="alternate" hreflang="ru" href="${ruUrl}">
  <link rel="alternate" hreflang="x-default" href="${arUrl}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${(pageType === 'job' || pageType === 'blog_post') ? 'article' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  ${(pageType === 'job' || pageType === 'blog_post') && data.publishedAt ? `<meta property="article:published_time" content="${new Date(data.publishedAt).toISOString()}">` : ''}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${canonicalUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${desc}">
  <meta property="twitter:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  `;
}

function parseSalary(salaryStr: string) {
  if (!salaryStr) return null;
  // Remove commas, TL, TRY, and spaces
  const clean = salaryStr.replace(/,/g, '').trim();
  const matches = clean.match(/\d+/g);
  if (!matches) return null;

  if (matches.length >= 2) {
    const val1 = parseFloat(matches[0]);
    const val2 = parseFloat(matches[1]);
    return {
      "minValue": Math.min(val1, val2),
      "maxValue": Math.max(val1, val2)
    };
  } else if (matches.length === 1) {
    return {
      "value": parseFloat(matches[0])
    };
  }
  return null;
}

function getIstanbulPostalCode(locationStr?: string): string {
  if (!locationStr) return '34000';
  const loc = locationStr.toLowerCase();

  // District to Postal Code map (major districts)
  const districtMap: Record<string, string> = {
    'şişli': '34360', 'sisli': '34360',
    'kadıköy': '34710', 'kadikoy': '34710',
    'beşiktaş': '34330', 'besiktas': '34330',
    'fatih': '34090',
    'esenyurt': '34510',
    'üsküdar': '34660', 'uskudar': '34660',
    'pendik': '34890',
    'beyoğlu': '34421', 'beyoglu': '34421',
    'ataşehir': '34758', 'atasehir': '34758',
    'kağıthane': '34403', 'kagithane': '34403',
    'sarıyer': '34450', 'sariyer': '34450',
    'kartal': '34860',
    'maltepe': '34840',
    'ümraniye': '34764', 'umraniye': '34764',
    'başakşehir': '34480', 'basaksehir': '34480',
    'beylikdüzü': '34520', 'beylikduzu': '34520',
    'bakırköy': '34142', 'bakirkoy': '34142',
    'bağcılar': '34200', 'bagcilar': '34200',
    'bahçelievler': '34180', 'bahcelievler': '34180',
    'eyüp': '34050', 'eyup': '34050',
    'gaziosmanpaşa': '34245', 'gaziosmanpasa': '34245',
    'tuzla': '34947',
    'çekmeköy': '34782', 'cekmekoy': '34782',
    'beykoz': '34820',
    'sancaktepe': '34785',
    'sultangazi': '34265',
    'arnavutköy': '34275', 'arnavutkoy': '34275',
    'silivri': '34570',
    'çatalca': '34540', 'catalca': '34540',
    'شيشلي': '34360',
    'كاديكوي': '34710',
    'بشكتاش': '34330',
    'الفاتح': '34090',
    'اسنيورت': '34510',
    'اسكودار': '34660',
    'بينديك': '34890',
    'بيوغلو': '34421',
    'أتاشهير': '34758',
    'كاغيت هانة': '34403',
    'ساريير': '34450',
    'كارتال': '34860',
    'مالتيبي': '34840',
    'عمرانية': '34764',
    'باشاك شهير': '34480',
    'بيليك دوزو': '34520',
    'باقركوي': '34142',
    'باغجلار': '34200',
    'باهتشلي ايفلر': '34180',
    'أيوب': '34050',
    'غازي عثمان باشا': '34245',
    'توزلا': '34947',
    'تشيكميكوي': '34782',
    'بيكوز': '34820',
    'سنجاق تبي': '34785',
    'سلطان غازي': '34265',
    'أرناؤوط كوي': '34275'
  };

  for (const [district, zip] of Object.entries(districtMap)) {
    if (loc.includes(district)) {
      return zip;
    }
  }

  return '34000'; // Default Istanbul zip
}

function getStreetAddress(locationStr?: string): string {
  if (!locationStr) return 'Istanbul, Turkey';
  const loc = locationStr.toLowerCase();
  if (loc.includes('remote') || loc.includes('عن بعد')) {
    return 'Istanbul, Turkey';
  }
  return locationStr;
}

export function generateJsonLd(locale: 'ar' | 'en' | 'tr' | 'ru', pageType: 'home' | 'job' | 'blog' | 'blog_post', data: MetaDataInput = {}) {
  const siteUrl = 'https://jobs-in-istanbul.com';

  if (pageType === 'home') {
    const orgName = locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs');
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": orgName,
      "url": `${siteUrl}/${locale}`,
      "logo": `${siteUrl}/public/images/logo.png`,
      "sameAs": [
        "https://www.facebook.com/istanbuljobs",
        "https://twitter.com/istanbuljobs",
        "https://www.linkedin.com/company/istanbuljobs"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": orgName,
      "url": `${siteUrl}/${locale}`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/${locale}?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    return `
    <script type="application/ld+json">${JSON.stringify(orgSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>
    `;
  }

  if (pageType === 'blog') {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'Blog' : (locale === 'ar' ? 'المدونة' : 'Blog'),
          "item": `${siteUrl}/${locale}/blog`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  if (pageType === 'blog_post') {
    let publishedTime = Date.now();
    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt).getTime();
      if (!isNaN(parsed)) {
        publishedTime = parsed;
      }
    }

    const cleanDesc = data.description
      ? data.description.substring(0, 160).replace(/<[^>]*>/g, '')
      : (locale === 'ar' ? 'مقال مهني في إسطنبول' : 'Career article in Istanbul');

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": data.title,
      "description": cleanDesc,
      "image": data.image || `${siteUrl}/public/images/og-share.png`,
      "datePublished": new Date(publishedTime).toISOString(),
      "dateModified": new Date(publishedTime).toISOString(),
      "author": {
        "@type": "Organization",
        "name": locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'وظائف إسطنبول' : 'Istanbul Jobs'),
        "url": `${siteUrl}/${locale}`
      },
      "publisher": {
        "@type": "Organization",
        "name": locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs'),
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/public/images/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${siteUrl}/${locale}/blog/${data.slug}`
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'Blog' : (locale === 'ar' ? 'المدونة' : 'Blog'),
          "item": `${siteUrl}/${locale}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": data.title,
          "item": `${siteUrl}/${locale}/blog/${data.slug}`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(blogPostingSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  if (pageType === 'job') {
    // Map jobType to standard Google Schema JobPosting values
    const typeLabel = data.jobType === 'full-time' ? 'FULL_TIME' : data.jobType === 'part-time' ? 'PART_TIME' : data.jobType === 'internship' ? 'INTERN' : 'FULL_TIME';

    let publishedTime = Date.now();
    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt).getTime();
      if (!isNaN(parsed)) {
        publishedTime = parsed;
      }
    }

    // HTML-formatted description is highly recommended by Google
    let formattedDescription = data.description || '';
    if (formattedDescription && !formattedDescription.includes('<p>') && !formattedDescription.includes('<br>')) {
      formattedDescription = formattedDescription.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
    }

    const hiringOrg: Record<string, any> = {
      "@type": "Organization",
      "name": data.companyName || 'Confidential Company',
      "sameAs": data.companyWebsite || siteUrl
    };

    if (data.companyLogo) {
      let logoUrl = data.companyLogo;
      if (!logoUrl.startsWith('http')) {
        logoUrl = `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
      }
      hiringOrg.logo = logoUrl;
    }

    const jobLocationSchema: Record<string, any> = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": getStreetAddress(data.location),
        "addressLocality": data.location || 'Istanbul',
        "addressRegion": 'Istanbul',
        "postalCode": getIstanbulPostalCode(data.location),
        "addressCountry": 'TR'
      }
    };

    const jobSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.title,
      "description": formattedDescription,
      "datePosted": new Date(publishedTime).toISOString(),
      "validThrough": new Date(publishedTime + 180 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": typeLabel,
      "hiringOrganization": hiringOrg,
      "jobLocation": jobLocationSchema
    };

    if (data.jobType === 'remote') {
      jobSchema.jobLocationType = "TELECOMMUTE";
      jobSchema.applicantLocationRequirements = {
        "@type": "Area",
        "name": "Turkey"
      };
    }

    let salaryObject = null;
    if (data.salary) {
      const parsedSalary = parseSalary(data.salary);
      if (parsedSalary) {
        let currency = "TRY";
        const upperSalary = data.salary.toUpperCase();
        if (upperSalary.includes('$') || upperSalary.includes('USD')) {
          currency = "USD";
        } else if (upperSalary.includes('€') || upperSalary.includes('EUR')) {
          currency = "EUR";
        }

        salaryObject = {
          "@type": "MonetaryAmount",
          "currency": currency,
          "value": {
            "@type": "QuantitativeValue",
            ...parsedSalary,
            "unitText": "MONTH"
          }
        };
      }
    }

    if (!salaryObject) {
      // Fallback baseSalary for Istanbul jobs when salary is not specified
      salaryObject = {
        "@type": "MonetaryAmount",
        "currency": "TRY",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": 20000,
          "maxValue": 35000,
          "unitText": "MONTH"
        }
      };
    }

    jobSchema.baseSalary = salaryObject;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'İş İlanları' : (locale === 'ar' ? 'الوظائف' : 'Jobs'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": data.title,
          "item": `${siteUrl}/${locale}/jobs/${data.slug}`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(jobSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  return '';
}
