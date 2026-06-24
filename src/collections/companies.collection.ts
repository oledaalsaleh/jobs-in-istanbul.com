import type { CollectionConfig } from '@sonicjs-cms/core';

export default {
  name: 'companies',
  displayName: 'Companies',
  slug: 'companies',
  description: 'Hiring companies list',
  icon: '🏢',

  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Company Name',
        required: true,
        maxLength: 200,
      },
      slug: {
        type: 'slug',
        title: 'URL Slug',
        required: true,
        maxLength: 200,
      },
      logo: {
        type: 'string',
        title: 'Logo URL / Path',
        required: false,
      },
      website: {
        type: 'url',
        title: 'Website URL',
        required: false,
      },
      industry: {
        type: 'string',
        title: 'Industry',
        required: false,
      },
      description: {
        type: 'textarea',
        title: 'Company Description',
        required: false,
      },
    },
    required: ['name', 'slug'],
  },

  listFields: ['name', 'industry', 'website'],
  searchFields: ['name', 'industry', 'description'],
  defaultSort: 'name',
  defaultSortOrder: 'asc',

  managed: true,
  isActive: true,
  cache: {
    enabled: true,
    ttl: 300,
  },
} satisfies CollectionConfig;
