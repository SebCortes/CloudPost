import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PostCategory, Prisma } from '../generated/prisma/client'

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
}
