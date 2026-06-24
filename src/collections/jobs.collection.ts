import type { CollectionConfig } from '@sonicjs-cms/core';

export default {
  name: 'jobs',
  displayName: 'Jobs',
  slug: 'jobs',
  description: 'Manage job postings for Istanbul',
  icon: '💼',

  schema: {
    type: 'object',
    properties: {
      title_ar: {
        type: 'string',
        title: 'Job Title (Arabic)',
        required: true,
        maxLength: 200,
      },
      title_en: {
        type: 'string',
        title: 'Job Title (English)',
        required: true,
        maxLength: 200,
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        required: true,
        maxLength: 200,
      },
      description_ar: {
        type: 'textarea',
        title: 'Description & Requirements (Arabic)',
        required: true,
      },
      description_en: {
        type: 'textarea',
        title: 'Description & Requirements (English)',
        required: true,
      },
      company: {
        type: 'reference',
        collection: 'companies',
        title: 'Hiring Company',
        required: true,
      },
      category: {
        type: 'reference',
        collection: 'categories',
        title: 'Job Category',
        required: true,
      },
      location_ar: {
        type: 'string',
        title: 'Location / District (Arabic, e.g. الفاتح)',
        required: true,
        maxLength: 100,
      },
      location_en: {
        type: 'string',
        title: 'Location / District (English, e.g. Fatih)',
        required: true,
        maxLength: 100,
      },
      jobType: {
        type: 'select',
        title: 'Job Type',
        required: true,
        enum: ['full-time', 'part-time', 'remote', 'internship'],
        enumLabels: ['Full Time', 'Part Time', 'Remote', 'Internship'],
      },
      salary: {
        type: 'string',
        title: 'Salary Range (e.g. 20,000 - 30,000 TL)',
        required: false,
      },
      applyLink: {
        type: 'url',
        title: 'Application Link (URL)',
        required: false,
      },
      applyEmail: {
        type: 'email',
        title: 'Application Email',
        required: false,
      },
      language: {
        type: 'select',
        title: 'Required Language',
        required: true,
        enum: ['ar', 'en', 'both'],
        enumLabels: ['Arabic', 'English', 'Both / Bilingual'],
      },
      featured: {
        type: 'boolean',
        title: 'Featured Post?',
        default: false,
      },
      publishedAt: {
        type: 'datetime',
        title: 'Publish Date',
        required: true,
      },
      status: {
        type: 'select',
        title: 'Status',
        required: true,
        enum: ['draft', 'published', 'archived'],
        enumLabels: ['Draft', 'Published', 'Archived'],
        default: 'draft',
      },
    },
    required: [
      'title_ar',
      'title_en',
      'slug',
      'description_ar',
      'description_en',
      'company',
      'category',
      'location_ar',
      'location_en',
      'jobType',
      'language',
      'publishedAt',
      'status',
    ],
  },

  listFields: ['title_en', 'company', 'category', 'status', 'publishedAt'],
  searchFields: ['title_en', 'title_ar', 'description_en', 'description_ar', 'location_en', 'location_ar'],
  defaultSort: 'publishedAt',
  defaultSortOrder: 'desc',

  managed: true,
  isActive: true,
  cache: {
    enabled: true,
    ttl: 60,
  },
} satisfies CollectionConfig;
