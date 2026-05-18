import { PostFeed } from "./components/PostFeed"
import { SiteHeader } from "./components/SiteHeader"
import { getPosts } from "./lib/posts"

export const dynamic = "force-dynamic"

const initialPageSize = 6

export default async function Home() {
  const initialFeed = await getPosts({
    page: 1,
    pageSize: initialPageSize,
    orderBy: "createdAt",
    orderDirection: "desc",
  })

  return (
    <>
      <SiteHeader active="feed" />
      <PostFeed
        initialPage={initialFeed.page}
        initialPageSize={initialFeed.pageSize}
        initialPosts={initialFeed.posts}
        initialTotalItems={initialFeed.totalItems}
        initialTotalPages={initialFeed.totalPages}
      />
    </>
  )
}
