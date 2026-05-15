import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '../generated/prisma/client'

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
  ) {

  }

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

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput
    data: Prisma.PostUpdateInput
  }) {
    const { where, data } = params

    return this.prisma.post.update({
      where,
      data,
    })
  }

  async createPost(params: {
    data: Prisma.PostCreateInput
  }) {
    const { data } = params

    return this.prisma.post.create({
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
