import { BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, NotFoundException, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { RequiredPipe } from '../required/required.pipe';
import { $Enums, PostCategory, Prisma } from '../generated/prisma/client';
import { ZodValidationPipe } from '../zod-validation-pipe/zod-validation-pipe.pipe';
import { createPostOpenApiSchema, createPostSchema, postCategoryOpenApiSchema, updatePostOpenApiSchema, updatePostSchema } from './post.dto';
import type { CreatePostDto, UpdatePostDto } from './post.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

enum orderByAll {
  createdAt = 'createdAt',
  title = 'title',
  authorName = 'authorName',
  numberOfLikes = 'numberOfLikes',
  timeToRead = 'timeToRead',
}

const postListItemOpenApiSchema = {
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

const postOpenApiSchema = {
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

@ApiTags('posts')
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
  ) { }

  @Get('all')
  @ApiOperation({
    summary: 'List posts',
    description: 'Returns posts with optional full-text search, category filtering, ordering, and pagination.',
  })
  @ApiQuery({ name: 'orderBy', required: false, enum: orderByAll, example: orderByAll.createdAt })
  @ApiQuery({ name: 'orderDirection', required: false, enum: Prisma.SortOrder, example: Prisma.SortOrder.desc })
  @ApiQuery({ name: 'query', required: false, type: String, maxLength: 100, example: 'anonymous writing' })
  @ApiQuery({ name: 'category', required: false, schema: postCategoryOpenApiSchema })
  @ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, minimum: 1, maximum: 100, example: 20 })
  @ApiOkResponse({
    description: 'Posts returned successfully.',
    schema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: postListItemOpenApiSchema,
        },
        page: { type: 'integer', example: 1 },
        pageSize: { type: 'integer', example: 20 },
        totalPages: { type: 'integer', example: 3 },
        totalItems: { type: 'integer', example: 57 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query, pagination, category, or ordering parameter.' })
  async posts(
    @Query('orderBy', new DefaultValuePipe(orderByAll.createdAt), new ParseEnumPipe(orderByAll)) orderBy: orderByAll,
    @Query('orderDirection', new DefaultValuePipe(Prisma.SortOrder.desc), new ParseEnumPipe(Prisma.SortOrder)) orderDirection: Prisma.SortOrder,
    @Query('query') query?: string,
    @Query('category', new ParseEnumPipe($Enums.PostCategory, { optional: true })) category?: PostCategory | null,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number | null,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number | null,
  
  ): Promise<{
    posts: Awaited<ReturnType<PostService['posts']>>
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }> {
    const pagination = this.getPagination(page, pageSize)
    const searchTerms = this.getSearchTerms(query)
    const postWhereInput = this.buildPostWhereInput(searchTerms, category === null ? undefined : category)

    const numberOfPosts = await this.postService.countPosts({
      where: postWhereInput,
    })

    const posts = (await this.postService.posts({
      select: {
        id: true,
        title: true,
        authorName: true,
        content: true,
        category: true,
        numberOfLikes: true,
        numberOfWords: true,
        timeToRead: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        [orderBy]: orderDirection,
      },
      ...(pagination.isPagination ? {
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
      } : {}),
      where: postWhereInput,
    }))

    return this.buildPostListResponse({
      posts,
      numberOfPosts,
      pagination,
    })
  }

  private getPagination(
    page?: number | null,
    pageSize?: number | null,
  ) {
    const hasPage = page !== undefined && page !== null
    const hasPageSize = pageSize !== undefined && pageSize !== null

    if (hasPage !== hasPageSize) {
      throw new BadRequestException('Both page and pageSize must be provided for pagination')
    }

    const isPagination = hasPage && hasPageSize

    if (isPagination) {
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0')
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new BadRequestException('Page size must be between 1 and 100')
      }
    }

    return {
      isPagination,
      page: page ?? 1,
      pageSize: pageSize ?? 0,
    }
  }

  private getSearchTerms(query?: string) {
    if (!query) {
      return []
    }

    if (query.length > 100) {
      throw new BadRequestException('Query is too long')
    }

    return query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  }

  private buildPostWhereInput(searchTerms: string[], category?: PostCategory): Prisma.PostWhereInput | undefined {
    if (searchTerms.length === 0 && category === undefined) {
      return undefined
    }

    return {
      AND: searchTerms.map((searchWord) => ({
        OR: [
          { title: { contains: searchWord, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: searchWord, mode: Prisma.QueryMode.insensitive } },
          { authorName: { contains: searchWord, mode: Prisma.QueryMode.insensitive } },
        ],
      })),
      ...(category !== undefined ? { category } : {}),
    }
  }

  private buildPostListResponse(params: {
    posts: Awaited<ReturnType<PostService['posts']>>
    numberOfPosts: number
    pagination: {
      isPagination: boolean
      page: number
      pageSize: number
    }
  }) {
    const { posts, numberOfPosts, pagination } = params

    if (pagination.isPagination) {
      return {
        posts,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(numberOfPosts / pagination.pageSize),
        totalItems: numberOfPosts,
      }
    }

    return {
      posts,
      page: 1,
      pageSize: numberOfPosts,
      totalPages: 1,
      totalItems: numberOfPosts,
    }
  }

  @Get('orderBy/fields')
  @ApiOperation({ summary: 'List sortable post fields' })
  @ApiOkResponse({
    description: 'Sortable fields returned successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(orderByAll),
      },
      example: Object.values(orderByAll),
    },
  })
  async getOrderByFields() {
    return Object.keys(orderByAll)
  }

  @Get('category')
  @ApiOperation({ summary: 'List post categories' })
  @ApiOkResponse({
    description: 'Post categories returned successfully.',
    schema: {
      type: 'array',
      items: postCategoryOpenApiSchema,
      example: Object.values($Enums.PostCategory),
    },
  })
  async getCategories() {
    return Object.values($Enums.PostCategory)
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count posts' })
  @ApiOkResponse({
    description: 'Post count returned successfully.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'integer', example: 42 },
      },
    },
  })
  async countPosts(): Promise<{ count: number }> {
    const count = await this.postService.countPosts({})

    return {
      count,
    }
  }

  @Get('stats/likes')
  @ApiOperation({ summary: 'Count all post likes' })
  @ApiOkResponse({
    description: 'Total number of likes returned successfully.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'integer', example: 128 },
      },
    },
  })
  async countLikes(): Promise<{ count: number }> {
    const count = await this.postService.countLikes({})

    return {
      count,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one post' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Post identifier.' })
  @ApiOkResponse({
    description: 'Post returned successfully.',
    schema: postOpenApiSchema,
  })
  @ApiBadRequestResponse({ description: 'Post id is missing or invalid.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async post(
    @Param('id', new RequiredPipe()) id: string,
  ): Promise<Awaited<ReturnType<PostService['post']>>> {
    const post = await this.postService.post({
      where: {
        id,
      },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    return post
  }

  @Patch(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Post identifier.' })
  @ApiBody({
    description: 'Post fields to update. At least one field must be provided.',
    schema: updatePostOpenApiSchema,
  })
  @ApiNoContentResponse({ description: 'Post updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid post id or request body.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async updatePost(
    @Param('id', new RequiredPipe()) id: string,
    @Body(new ZodValidationPipe(updatePostSchema)) body: UpdatePostDto,
  ) {
    const { title, content, category } = body

    await this.postService.updatePost({
      where: {
        id,
      },
      data: {
        title,
        content,
        category,
      }
    })
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Post identifier.' })
  @ApiNoContentResponse({ description: 'Post deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Post id is missing or invalid.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async deletePost(
    @Param('id', new RequiredPipe()) id: string,
  ) {
    await this.postService.deletePost({
      where: {
        id,
      },
    })
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a post' })
  @ApiBody({
    description: 'Post creation payload.',
    schema: createPostOpenApiSchema,
  })
  @ApiCreatedResponse({ description: 'Post created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  async createPost(
    @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostDto,
  ) {
    const { title, content, authorName, category } = body

    await this.postService.createPost({
      data: {
        title,
        content,
        authorName,
        category,
      }
    })
  }
}
