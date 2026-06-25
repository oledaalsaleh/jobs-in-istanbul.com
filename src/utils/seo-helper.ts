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
  industry?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  seoKeywords?: string[];
}

export function generateMetaTags(locale: 'ar' | 'en', pageType: 'home' | 'job' | 'submit', data: MetaDataInput = {}) {
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
  let desc = data.description || defaults.desc;
  
  if (pageType === 'job') {
    title = locale === 'ar' 
      ? `${data.title} - وظيفة في إسطنبول لدى ${data.companyName}`
      : `${data.title} - Job in Istanbul at ${data.companyName}`;
    desc = data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc;
  } else if (pageType === 'submit') {
    title = locale === 'ar' ? 'أعلن عن وظيفة شاغرة في إسطنبول' : 'Post a Job Vacancy in Istanbul';
    desc = locale === 'ar' 
      ? 'أعلن عن وظيفة شاغرة في شركتك وقم بالوصول إلى آلاف الكفاءات والباحثين عن عمل في إسطنبول.'
      : 'Post a vacancy in your organization and reach thousands of skilled job seekers in Istanbul.';
  }

  const canonicalUrl = `${siteUrl}/${locale}${data.slug ? `/jobs/${data.slug}` : ''}`;
  const oppositeLocale = locale === 'ar' ? 'en' : 'ar';
  const alternateUrl = `${siteUrl}/${oppositeLocale}${data.slug ? `/jobs/${data.slug}` : ''}`;

  let keywordsStr = locale === 'ar'
    ? 'وظائف في إسطنبول, فرص عمل في تركيا, شغل في تركيا للعرب, وظائف شاغرة, توظيف, jobsintr, تركيا'
    : 'jobs in istanbul, working in turkey, employment, vacancies, istanbul jobs';

  if (data.seoKeywords && Array.isArray(data.seoKeywords) && data.seoKeywords.length > 0) {
    keywordsStr = data.seoKeywords.join(', ') + ', ' + keywordsStr;
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
  <link rel="alternate" hreflang="x-default" href="${siteUrl}/ar${data.slug ? `/jobs/${data.slug}` : ''}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${pageType === 'job' ? 'article' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  ${pageType === 'job' && data.publishedAt ? `<meta property="article:published_time" content="${new Date(data.publishedAt).toISOString()}">` : ''}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${canonicalUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${desc}">
  <meta property="twitter:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  `;
}

export function generateJsonLd(locale: 'ar' | 'en', pageType: 'home' | 'job', data: MetaDataInput = {}) {
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

  if (pageType === 'job') {
    // Standardize JobPosting structured data for Google Job Search
    const typeLabel = data.jobType === 'full-time' ? 'FULL_TIME' : data.jobType === 'part-time' ? 'PART_TIME' : data.jobType === 'remote' ? 'TELECOMMUTE' : 'INTERN';
    
    const jobSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.title,
      "description": data.description,
      "datePosted": data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString(),
      "validThrough": data.publishedAt ? new Date(data.publishedAt + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
      "employmentType": typeLabel,
      "hiringOrganization": {
        "@type": "Organization",
        "name": data.companyName || 'Confidential Company',
        "sameAs": siteUrl
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": data.location || 'Istanbul',
          "addressRegion": 'Istanbul',
          "addressCountry": 'TR'
        }
      },
      ...(data.salary ? {
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "TRY",
          "value": {
            "@type": "QuantitativeValue",
            "value": data.salary,
            "unitText": "MONTH"
          }
        }
      } : {})
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
