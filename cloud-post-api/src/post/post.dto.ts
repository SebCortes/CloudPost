import { z } from 'zod'
import { $Enums, PostCategory } from '../generated/prisma/client'

const minText = (fieldName: string, minLength: number) =>
  `${fieldName} must be at least ${minLength} characters long`

const maxText = (fieldName: string, maxLength: number) =>
  `${fieldName} must be at most ${maxLength} characters long`

const postCategoryValues = Object.values($Enums.PostCategory) as PostCategory[]

export const postCategorySchema = z.enum(postCategoryValues)

const titleSchemaMinLength = 5
const titleSchemaMaxLength = 100
const titleSchema = z
  .string()
  .trim()
  .min(titleSchemaMinLength, minText('Title', titleSchemaMinLength))
  .max(titleSchemaMaxLength, maxText('Title', titleSchemaMaxLength))

const contentSchemaMinLength = 20
const contentSchemaMaxLength = 50000
const contentSchema = z
  .string()
  .trim()
  .min(contentSchemaMinLength, minText('Content', contentSchemaMinLength))
  .max(contentSchemaMaxLength, maxText('Content', contentSchemaMaxLength))

const authorNameSchemaMinLength = 3
const authorNameSchemaMaxLength = 100
const authorNameSchema = z
  .string()
  .trim()
  .min(authorNameSchemaMinLength, minText('Author Name', authorNameSchemaMinLength))
  .max(authorNameSchemaMaxLength, maxText('Author Name', authorNameSchemaMaxLength))

export const createPostSchema = z
  .object({
    title: titleSchema,
    content: contentSchema,
    authorName: authorNameSchema,
    category: postCategorySchema,
  })
  .required()

export type CreatePostDto = z.infer<typeof createPostSchema>

export const updatePostSchema = z
  .object({
    title: titleSchema.optional(),
    content: contentSchema.optional(),
    category: postCategorySchema.optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.content !== undefined ||
      body.category !== undefined,
    {
      message: 'At least one of title, content or category must be provided',
    },
  )

export type UpdatePostDto = z.infer<typeof updatePostSchema>

export const postCategoryOpenApiSchema = {
  type: 'string',
  enum: postCategoryValues,
  example: postCategoryValues[0],
}

export const createPostOpenApiSchema = {
  type: 'object',
  required: ['title', 'content', 'authorName', 'category'],
  properties: {
    title: {
      type: 'string',
      minLength: titleSchemaMinLength,
      maxLength: titleSchemaMaxLength,
      example: 'Small ideas deserve a public shelf too',
    },
    content: {
      type: 'string',
      minLength: contentSchemaMinLength,
      maxLength: contentSchemaMaxLength,
      example: 'Publishing anonymously removes part of the social theater.',
    },
    authorName: {
      type: 'string',
      minLength: authorNameSchemaMinLength,
      maxLength: authorNameSchemaMaxLength,
      example: 'Anonymous',
    },
    category: postCategoryOpenApiSchema,
  },
}

export const updatePostOpenApiSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    title: createPostOpenApiSchema.properties.title,
    content: createPostOpenApiSchema.properties.content,
    category: postCategoryOpenApiSchema,
  },
  example: {
    title: 'Updated post title',
    category: postCategoryValues[0],
  },
}

export const createCommentSchema = z
  .object({
    authorName: authorNameSchema,
    content: z
      .string()
      .trim()
      .min(1, minText('Content', 1))
      .max(1000, maxText('Content', 1000)),
  })
  .required()

export type CreateCommentDto = z.infer<typeof createCommentSchema>

export const createCommentOpenApiSchema = {
  type: 'object',
  required: ['authorName', 'content'],
  properties: {
    authorName: {
      type: 'string',
      example: 'John Doe',
    },
    content: {
      type: 'string',
      example: 'Great post!',
    },
  },
  example: {
    authorName: 'Jane Doe',
    content: 'This is a comment on the post.',
  },
}