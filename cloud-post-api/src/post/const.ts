import { postCategoryOpenApiSchema } from './post.dto'

export enum orderByAll {
  createdAt = 'createdAt',
  title = 'title',
  authorName = 'authorName',
  numberOfLikes = 'numberOfLikes',
  timeToRead = 'timeToRead'
}

export const postListItemOpenApiSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    authorName: { type: 'string' },
    content: { type: 'string' },
    category: postCategoryOpenApiSchema,
    numberOfLikes: { type: 'integer', example: 12 },
    numberOfWords: { type: 'integer', example: 420 },
    timeToRead: { type: 'integer', example: 3 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    _count: {
      type: 'object',
      properties: {
        comments: { type: 'integer', example: 4 },
      },
    },
  },
} as const

export const postOpenApiSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    content: { type: 'string' },
    authorName: { type: 'string' },
    category: postCategoryOpenApiSchema,
    numberOfLikes: { type: 'integer', example: 12 },
    numberOfWords: { type: 'integer', example: 420 },
    timeToRead: { type: 'integer', example: 3 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const
