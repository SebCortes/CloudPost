import { notFound } from "next/navigation"
import { PostReader } from "../../components/PostReader"
import { SiteHeader } from "../../components/SiteHeader"
import { getComments, getPost } from "../../lib/posts"

export const dynamic = "force-dynamic"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let post
  let comments

  try {
    post = await getPost(id)
    comments = await getComments(id)
  } catch (error) {
    console.error("Error fetching post data:", error)
    throw error
  }

  if (!post) {
    notFound()
  }

  return (
    <>
      <SiteHeader active="feed" />
      <PostReader post={post} comments={comments} />
    </>
  )
}
