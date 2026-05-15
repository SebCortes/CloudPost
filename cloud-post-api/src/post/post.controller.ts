import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { RequiredPipe } from '../required/required.pipe';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
  ) {

  }

  @Get()
  async posts() {
    return this.postService.posts({
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  @Get(':id')
  async post(
    @Query('id', new RequiredPipe()) id: string,
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
    @Query('id', new RequiredPipe()) id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
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
    @Query('id', new RequiredPipe()) id: string,
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
