import axios from "axios"

export const postCategories = [
  "Idea",
  "Question",
  "Announcement",
  "Tutorial",
  "Story",
] as const

export type PostCategory = (typeof postCategories)[number]

export const feedCategories = ["All", ...postCategories] as const

export type FeedCategory = (typeof feedCategories)[number]

export type Comment = {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export type PostAccent = "violet" | "sun" | "mint" | "rose"

export type Post = {
  id: string
  title: string
  excerpt: string
  body: string
  author: string
  category: PostCategory
  readTime: string
  publishedAt: string
  reactions: number
  commentCount: number
  accent: PostAccent
  createdAt: string
  updatedAt: string
}

export type PostOrderField =
  | "createdAt"
  | "title"
  | "authorName"
  | "numberOfLikes"
  | "timeToRead"

export type SortOrder = "asc" | "desc"

export type PostsQuery = {
  orderBy?: PostOrderField
  orderDirection?: SortOrder
  query?: string
  category?: PostCategory
  page?: number
  pageSize?: number
}

export type PostsPage = {
  posts: Post[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export type CreatePostInput = {
  title: string
  content: string
  authorName: string
  category: PostCategory
}

export type UpdatePostInput = Partial<Pick<CreatePostInput, "title" | "content" | "category">>

type ApiPostListItem = {
  id: string
  title: string
  authorName: string
  content: string
  category: PostCategory
  numberOfLikes: number
  numberOfWords: number
  timeToRead: number
  createdAt: string
  updatedAt: string
  _count: {
    comments: number
  }
}

type ApiPost = Omit<ApiPostListItem, "_count">

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001").replace(/\/$/, ""),
})

const accentByCategory: Record<PostCategory, PostAccent> = {
  Idea: "violet",
  Question: "sun",
  Announcement: "mint",
  Tutorial: "rose",
  Story: "violet",
}

export function getPostAccent(category: PostCategory): PostAccent {
  return accentByCategory[category]
}

export function buildExcerpt(content: string) {
  const normalizedContent = content.replace(/\s+/g, " ").trim()

  if (normalizedContent.length <= 132) {
    return normalizedContent
  }

  return `${normalizedContent.slice(0, 132).trim()}...`
}

export function formatReadTime(timeToRead: number) {
  return `${Math.max(1, timeToRead)} min`
}

export function humanReadablePastDate(value: string) {
  const publishedDate = new Date(value)
  const diffInMs = Date.now() - publishedDate.getTime()

  if (Number.isNaN(publishedDate.getTime()) || diffInMs < 0) {
    return "Just now"
  }

  if (diffInMs < 60_000) {
    return "Just now"
  }

  if (diffInMs < 3_600_000) {
    return `${Math.max(1, Math.floor(diffInMs / 60_000))} min ago`
  }

  if (diffInMs < 86_400_000) {
    return `${Math.max(1, Math.floor(diffInMs / 3_600_000))} h ago`
  }

  if (diffInMs < 172_800_000) {
    return "Yesterday"
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(publishedDate)
}

function mapApiPostToPost(post: ApiPost, commentCount = 0): Post {
  return {
    id: post.id,
    title: post.title,
    excerpt: buildExcerpt(post.content),
    body: post.content,
    author: post.authorName,
    category: post.category,
    readTime: formatReadTime(post.timeToRead),
    publishedAt: humanReadablePastDate(post.createdAt),
    reactions: post.numberOfLikes,
    commentCount,
    accent: getPostAccent(post.category),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }
}

function mapApiListItemToPost(post: ApiPostListItem): Post {
  return mapApiPostToPost(post, post._count.comments)
}

export function buildDraftPost(params: {
  title: string
  body: string
  author: string
  category: PostCategory
}): Post {
  const createdAt = new Date().toISOString()

  return {
    id: "draft",
    title: params.title.trim() || "Your post title",
    excerpt: buildExcerpt(params.body) || "The first lines of your post will appear here.",
    body: params.body.trim() || "Your content will appear in the preview.",
    author: params.author.trim() || "Anonymous",
    category: params.category,
    readTime: formatReadTime(Math.max(1, Math.ceil(params.body.trim().split(/\s+/).filter(Boolean).length / 200))),
    publishedAt: "Just now",
    reactions: 0,
    commentCount: 0,
    accent: getPostAccent(params.category),
    createdAt,
    updatedAt: createdAt,
  }
}

export async function getPosts(params: PostsQuery = {}): Promise<PostsPage> {
  const { data } = await api.get<{
    posts: ApiPostListItem[]
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }>("/post/all", {
    params: {
      ...params,
      ...(params.category ? { category: params.category } : {}),
    },
  })

  return {
    ...data,
    posts: data.posts.map(mapApiListItemToPost),
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const { data } = await api.get<ApiPost>(`/post/${id}`)

    return mapApiPostToPost(data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }

    throw error
  }
}

export async function getPostCategories() {
  const { data } = await api.get<PostCategory[]>("/post/category")

  return data
}

export async function countPosts() {
  const { data } = await api.get<{ count: number }>("/post/stats/count")

  return data.count
}

export async function countLikes() {
  const { data } = await api.get<{ count: number }>("/post/stats/likes")

  return data.count
}

export async function getPostStats() {
  const [posts, likes] = await Promise.all([countPosts(), countLikes()])

  return {
    posts,
    likes,
  }
}

export async function createPost(payload: CreatePostInput) {
  const { data } = await api.post<{ id: string }>("/post", payload)
  return data.id
}

export async function updatePost(id: string, payload: UpdatePostInput) {
  await api.patch(`/post/${id}`, payload)
}

export async function deletePost(id: string) {
  await api.delete(`/post/${id}`)
}

export async function likePost(id: string) {
  await api.post(`/post/${id}/like`)
}

export async function unlikePost(id: string) {
  await api.delete(`/post/${id}/like`)
}

export async function getComments(postId: string) {
  const { data } = await api.get<Comment[]>(`/post/${postId}/comment/all`)
  return data
}

export async function postComment(postId: string, authorName: string, content: string) {
  const { data } = await api.post<{
    content: string
    createdAt: string
    authorName: string
    id: string
    updatedAt: string
    postId: string
  }>(`/post/${postId}/comment`, {
    authorName,
    content,
  })

  return data
}