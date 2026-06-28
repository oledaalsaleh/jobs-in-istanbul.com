import type { CollectionConfig } from '@sonicjs-cms/core';

export default {
  name: 'categories',
  displayName: 'Categories',
  slug: 'categories',
  description: 'Job categories and sectors',
  icon: '📁',

  schema: {
    type: 'object',
    properties: {
      name_ar: {
        type: 'string',
        title: 'Name (Arabic)',
        required: true,
        maxLength: 100,
      },
      name_en: {
        type: 'string',
        title: 'Name (English)',
        required: true,
        maxLength: 100,
      },
      name_tr: {
        type: 'string',
        title: 'Name (Turkish)',
        required: true,
        maxLength: 100,
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        required: true,
        maxLength: 100,
      },
      icon: {
        type: 'string',
        title: 'Icon (Emoji or CSS Class)',
        required: false,
        maxLength: 50,
      },
    },
    required: ['name_ar', 'name_en', 'name_tr', 'slug'],
  },

  listFields: ['name_en', 'name_ar', 'name_tr', 'slug', 'icon'],
  searchFields: ['name_en', 'name_ar', 'name_tr'],
  defaultSort: 'name_en',
  defaultSortOrder: 'asc',

  managed: true,
  isActive: true,
  cache: {
    enabled: true,
    ttl: 300,
  },
} satisfies CollectionConfig;
