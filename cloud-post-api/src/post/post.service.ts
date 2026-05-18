import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PostCategory, Prisma } from '../generated/prisma/client'
import { Mutex } from 'async-mutex'

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async posts(params: {
    select?: Prisma.PostSelect
    skip?: number
    take?: number
    cursor?: Prisma.PostWhereUniqueInput
    where?: Prisma.PostWhereInput
    orderBy?: Prisma.PostOrderByWithRelationInput
  }) {
    const { select, skip, take, cursor, where, orderBy } = params

    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    })
  }

  async countPosts(params: {
    where?: Prisma.PostWhereInput
  }) {
    const { where } = params

    return this.prisma.post.count({
      where,
    })
  }

  async countLikes(
    params: {
      where?: Prisma.PostWhereInput
    }
  ) {
    const { where } = params

    const result = await this.prisma.post.aggregate({
      where,
      _sum: {
        numberOfLikes: true,
      },
    })
    
    return result._sum.numberOfLikes ?? 0
  }

  private mutex = new Mutex()

  async likePost(id: string) {
    return this.mutex.runExclusive(async () => {
      const post = await this.prisma.post.findUnique({
        where: { id },
        select: { numberOfLikes: true },
      })

      if (!post) {
        throw new Error(`Post with ID ${id} not found`)
      }

      return this.prisma.post.update({
        where: { id },
        data: {
          numberOfLikes: {
            increment: 1,
          },
        },
      })
    })
  }

  async removeLike(id: string) {
    return this.mutex.runExclusive(async () => {
      const post = await this.prisma.post.findUnique({
        where: { id },
        select: { numberOfLikes: true },
      })

      if (!post) {
        throw new Error(`Post with ID ${id} not found`)
      }

      if (post.numberOfLikes <= 0) {
        throw new BadRequestException(`Post with ID ${id} has no likes to remove`)
      }

      return this.prisma.post.update({
        where: { id },
        data: {
          numberOfLikes: {
            decrement: 1,
          },
        },
      })
    })
  }

  async post(params: {
    where: Prisma.PostWhereUniqueInput
    select?: Prisma.PostSelect
  }) {
    const { where, select } = params

    return this.prisma.post.findUnique({
      where,
      select,
    })
  }

  public numberOfWordsAndTimeToRead(content: string) {
    const numberOfWords = content
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length
    const timeToRead = Math.ceil(numberOfWords / 200)

    return {
      numberOfWords,
      timeToRead,
    }
  }

  async createPost(params: {
    data: {
      title: string
      content: string
      authorName: string
      category: PostCategory
    }
  }) {
    const { numberOfWords, timeToRead } = this.numberOfWordsAndTimeToRead(params.data.content)

    const { title, content, authorName, category } = params.data

    return this.prisma.post.create({
      data: {
        title,
        content,
        authorName,
        category,
        numberOfWords,
        timeToRead,
      }
    })
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput
    data: {
      title?: string
      content?: string
      category?: PostCategory
    }
  }) {
    const { where, data } = params

    if (data.content !== undefined) {
      const { numberOfWords, timeToRead } = this.numberOfWordsAndTimeToRead(data.content)

      return this.prisma.post.update({
        where,
        data: {
          ...data,
          numberOfWords,
          timeToRead,
        }
      })
    }

    return this.prisma.post.update({
      where,
      data,
    })
  }

  async deletePost(params: {
    where: Prisma.PostWhereUniqueInput
  }) {
    const { where } = params

    return this.prisma.post.delete({
      where,
    })
  }

  async getCommentsOfPost(id: string) {
    return this.prisma.comment.findMany({
      where: {
        postId: id,
      },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async postComment(params: {
    data: {
      postId: string
      authorName: string
      content: string
    }
  }) {
    const { postId, authorName, content } = params.data

    return this.prisma.comment.create({
      data: {
        postId,
        authorName,
        content,
      },
    })
  }
}
