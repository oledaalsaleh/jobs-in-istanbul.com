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
}

export function generateMetaTags(locale: 'ar' | 'en', pageType: 'home' | 'job' | 'submit' | 'blog' | 'blog_post', data: MetaDataInput = {}) {
  const siteUrl = 'https://jobs-in-istanbul.com';
  
  const defaults = {
    ar: {
      title: 'فرص عمل في إسطنبول | وظائف شاغرة في تركيا للعرب',
      desc: 'ابحث عن أحدث فرص العمل والوظائف الشاغرة في إسطنبول وتركيا. منصتنا توفر شغل في تركيا للعرب بمختلف القطاعات: مبيعات، تسويق، برمجة، سياحة، وخدمة عملاء.',
    },
    en: {
      title: 'Istanbul Jobs | Vacancies & Employment',
      desc: 'Find the latest job opportunities and vacancies in Istanbul. The leading job portal for locals and internationals in Turkey. Full-time, part-time, and remote jobs.',
    }
  }[locale];

  let title = data.title || defaults.title;
  let desc = data.seoDescription || data.description || defaults.desc;
  
  if (pageType === 'job') {
    title = locale === 'ar' 
      ? `${data.title} - وظيفة في إسطنبول لدى ${data.companyName}`
      : `${data.title} - Job in Istanbul at ${data.companyName}`;
    desc = data.seoDescription || (data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc);
  } else if (pageType === 'submit') {
    title = locale === 'ar' ? 'أعلن عن وظيفة شاغرة في إسطنبول' : 'Post a Job Vacancy in Istanbul';
    desc = locale === 'ar' 
      ? 'أعلن عن وظيفة شاغرة في شركتك وقم بالوصول إلى آلاف الكفاءات والباحثين عن عمل في إسطنبول.'
      : 'Post a vacancy in your organization and reach thousands of skilled job seekers in Istanbul.';
  } else if (pageType === 'blog') {
    title = locale === 'ar' 
      ? 'مدونة المهنة - إسطنبول | نصائح التوظيف وإقامة العمل في تركيا'
      : 'Career Blog - Istanbul | Work Permits & Commuting Tips';
    desc = locale === 'ar' 
      ? 'دليلك المهني الشامل ونواصح التوظيف في إسطنبول. اقرأ حول تعديل السير الذاتية لأنظمة ATS وقوانين إقامة العمل والمواصلات في إسطنبول.'
      : 'Your ultimate guide to working in Istanbul. Read articles on ATS resume optimization, work permit laws, and navigating transportation.';
  } else if (pageType === 'blog_post') {
    title = locale === 'ar' 
      ? `${data.title} | مدونة المهنة إسطنبول`
      : `${data.title} | Istanbul Career Blog`;
    desc = data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc;
  }

  // Calculate canonical & alternate URLs based on pageType
  let canonicalUrl = `${siteUrl}/${locale}`;
  if (pageType === 'job' && data.slug) {
    canonicalUrl = `${siteUrl}/${locale}/jobs/${data.slug}`;
  } else if (pageType === 'blog') {
    canonicalUrl = `${siteUrl}/${locale}/blog`;
  } else if (pageType === 'blog_post' && data.slug) {
    canonicalUrl = `${siteUrl}/${locale}/blog/${data.slug}`;
  } else if (data.slug) {
    canonicalUrl = `${siteUrl}/${locale}/${data.slug}`;
  }

  const oppositeLocale = locale === 'ar' ? 'en' : 'ar';
  let alternateUrl = `${siteUrl}/${oppositeLocale}`;
  if (pageType === 'job' && data.slug) {
    alternateUrl = `${siteUrl}/${oppositeLocale}/jobs/${data.slug}`;
  } else if (pageType === 'blog') {
    alternateUrl = `${siteUrl}/${oppositeLocale}/blog`;
  } else if (pageType === 'blog_post' && data.slug) {
    alternateUrl = `${siteUrl}/${oppositeLocale}/blog/${data.slug}`;
  } else if (data.slug) {
    alternateUrl = `${siteUrl}/${oppositeLocale}/${data.slug}`;
  }

  let xDefaultUrl = `${siteUrl}/ar`;
  if (pageType === 'job' && data.slug) {
    xDefaultUrl = `${siteUrl}/ar/jobs/${data.slug}`;
  } else if (pageType === 'blog') {
    xDefaultUrl = `${siteUrl}/ar/blog`;
  } else if (pageType === 'blog_post' && data.slug) {
    xDefaultUrl = `${siteUrl}/ar/blog/${data.slug}`;
  } else if (data.slug) {
    xDefaultUrl = `${siteUrl}/ar/${data.slug}`;
  }

  let keywordsStr = locale === 'ar'
    ? 'وظائف في إسطنبول, فرص عمل في تركيا, شغل في تركيا للعرب, وظائف شاغرة, توظيف, jobsintr, تركيا, مدونة التوظيف'
    : 'jobs in istanbul, working in turkey, employment, vacancies, istanbul jobs, career blog, work permit turkey';

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
  <link rel="alternate" hreflang="${locale}" href="${canonicalUrl}">
  <link rel="alternate" hreflang="${oppositeLocale}" href="${alternateUrl}">
  <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}">

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

export function generateJsonLd(locale: 'ar' | 'en', pageType: 'home' | 'job' | 'blog' | 'blog_post', data: MetaDataInput = {}) {
  const siteUrl = 'https://jobs-in-istanbul.com';
  
  if (pageType === 'home') {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs',
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
      "name": locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs',
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
          "name": locale === 'ar' ? 'الرئيسية' : 'Home',
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'ar' ? 'المدونة' : 'Blog',
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
        "name": locale === 'ar' ? 'وظائف إسطنبول' : 'Istanbul Jobs',
        "url": `${siteUrl}/${locale}`
      },
      "publisher": {
        "@type": "Organization",
        "name": locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs',
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
          "name": locale === 'ar' ? 'الرئيسية' : 'Home',
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'ar' ? 'المدونة' : 'Blog',
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
        "addressLocality": data.location || 'Istanbul',
        "addressRegion": 'Istanbul',
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

        jobSchema.baseSalary = {
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'ar' ? 'الرئيسية' : 'Home',
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'ar' ? 'الوظائف' : 'Jobs',
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
