import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { RequiredPipe } from '../required/required.pipe';
import { Prisma } from '../generated/prisma/client';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
  ) {

  }

  @Get()
  async posts(
    @Query('query') query?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number | null,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number | null,
  ) {
    const pagination = this.getPagination(page, pageSize)
    const searchTerms = this.getSearchTerms(query)
    const postWhereInput = this.buildPostWhereInput(searchTerms)

    const numberOfPosts = await this.postService.countPosts({
      where: postWhereInput,
    })

    const posts = await this.postService.posts({
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(pagination.isPagination ? {
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
      } : {}),
      where: postWhereInput,
    })

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

  private buildPostWhereInput(searchTerms: string[]): Prisma.PostWhereInput | undefined {
    if (searchTerms.length === 0) {
      return undefined
    }

    return {
      AND: searchTerms.map((searchWord) => ({
        OR: [
          { title: { contains: searchWord, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: searchWord, mode: Prisma.QueryMode.insensitive } },
        ],
      })),
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

  @Get(':id')
  async post(
    @Param('id', new RequiredPipe()) id: string,
  ) {
    return this.postService.post({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  @Patch(':id')
  async updatePost(
    @Param('id', new RequiredPipe()) id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    if (title === undefined && content === undefined) {
      throw new BadRequestException('At least one of title or content must be provided')
    }

    return this.postService.updatePost({
      where: {
        id,
      },
      data: {
        title,
        content,
      }
    })
  }

  @Delete(':id')
  async deletePost(
    @Param('id', new RequiredPipe()) id: string,
  ) {
    return this.postService.deletePost({
      where: {
        id,
      },
    })
  }

  @Post()
  async createPost(
    @Body('title', new RequiredPipe()) title: string,
    @Body('content', new RequiredPipe()) content: string,
  ) {
    return this.postService.createPost({
      data: {
        title,
        content,
      }
    })
  }
}
