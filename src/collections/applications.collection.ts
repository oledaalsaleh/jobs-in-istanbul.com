import type { CollectionConfig } from '@sonicjs-cms/core';

export default {
  name: 'applications',
  displayName: 'Applications',
  slug: 'applications',
  description: 'Job applications submitted by candidates',
  icon: '📩',

  schema: {
    type: 'object',
    properties: {
      jobId: {
        type: 'reference',
        collection: 'jobs',
        title: 'Job Posting',
        required: true,
      },
      candidateName: {
        type: 'string',
        title: 'Candidate Name',
        required: true,
        maxLength: 200,
      },
      candidateEmail: {
        type: 'email',
        title: 'Candidate Email',
        required: true,
        maxLength: 200,
      },
      coverLetter: {
        type: 'textarea',
        title: 'Cover Letter',
        required: true,
      },
      resumeUrl: {
        type: 'string',
        title: 'Resume URL (R2 Key)',
        required: true,
      },
      status: {
        type: 'select',
        title: 'Application Status',
        required: true,
        enum: ['applied', 'reviewed', 'shortlisted', 'rejected'],
        enumLabels: ['Applied', 'Reviewed', 'Shortlisted', 'Rejected'],
        default: 'applied',
      },
      createdAt: {
        type: 'datetime',
        title: 'Application Date',
        required: true,
      },
      quizScore: {
        type: 'string',
        title: 'Screening Quiz Score',
        required: false,
      },
      videoPitchUrl: {
        type: 'string',
        title: 'Video Pitch R2 Key',
        required: false,
      },
    },
    required: [
      'jobId',
      'candidateName',
      'candidateEmail',
      'coverLetter',
      'resumeUrl',
      'status',
      'createdAt',
    ],
  },

  listFields: ['candidateName', 'candidateEmail', 'jobId', 'status', 'createdAt'],
  searchFields: ['candidateName', 'candidateEmail', 'coverLetter'],
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc',

  managed: true,
  isActive: true,
  cache: {
    enabled: false,
  },
} satisfies CollectionConfig;
