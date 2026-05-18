"use client"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import SearchIcon from "@mui/icons-material/Search"
import Link from "next/link"
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react"
import { PostCard } from "./PostCard"
import { feedCategories, getPosts, type FeedCategory, type Post, type PostCategory } from "../lib/posts"

const defaultPageSize = 6

type FeedFilter = FeedCategory

type PostFeedProps = {
  initialPosts: Post[]
  initialPage: number
  initialPageSize: number
  initialTotalPages: number
  initialTotalItems: number
}

export function PostFeed({
  initialPosts,
  initialPage,
  initialPageSize,
  initialTotalPages,
  initialTotalItems,
}: PostFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All")
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalItems, setTotalItems] = useState(initialTotalItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasMountedRef = useRef(false)
  const requestIdRef = useRef(0)

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      const currentRequestId = ++requestIdRef.current

      setIsLoading(true)

      if (replace) {
        setPage(1)
        setTotalPages(1)
        setTotalItems(0)
      }

      try {
        const response = await getPosts({
          page: nextPage,
          pageSize: initialPageSize || defaultPageSize,
          query: deferredQuery.trim() || undefined,
          category: activeFilter === "All" ? undefined : (activeFilter as PostCategory),
          orderBy: "createdAt",
          orderDirection: "desc",
        })

        if (currentRequestId !== requestIdRef.current) {
          return
        }

        setPosts((currentPosts) => (replace ? response.posts : [...currentPosts, ...response.posts]))
        setPage(response.page)
        setTotalPages(response.totalPages)
        setTotalItems(response.totalItems)
        setError(null)
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setError("We could not load the feed right now.")
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    },
    [activeFilter, deferredQuery, initialPageSize],
  )

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    void loadPage(1, true)
  }, [activeFilter, deferredQuery, initialPageSize, loadPage])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (!entry?.isIntersecting || isLoading || page >= totalPages) {
          return
        }

        void loadPage(page + 1, false)
      },
      {
        rootMargin: "400px",
      },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [activeFilter, deferredQuery, initialPageSize, isLoading, loadPage, page, totalPages])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 border-2 border-black bg-[var(--paper)] p-5 shadow-[6px_6px_0_#101010] sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="font-black uppercase tracking-normal text-[var(--accent)]">
              Anonymous public writing
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">
              Feed
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Read short anonymous posts, react to the ideas you like, and open
              any post to continue the conversation.
            </p>
          </div>

          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border-2 border-black bg-black px-5 py-3 font-black text-white shadow-[5px_5px_0_var(--accent)] transition hover:-translate-y-0.5"
            href="/create"
          >
            <AddCircleOutlineIcon />
            New post
          </Link>
        </div>
      </section>

      <section className="mb-8 grid gap-4">
        <label className="flex min-h-12 w-full items-center gap-2 border-2 border-black bg-white px-4 shadow-[4px_4px_0_#101010]">
          <SearchIcon />
          <input
            className="w-full bg-transparent py-3 font-semibold outline-none placeholder:text-[var(--muted)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts"
            value={query}
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {feedCategories.map((category) => (
            <button
              className={`shrink-0 rounded-full border-2 border-black px-4 py-2 text-sm font-black transition ${
                activeFilter === category
                  ? "bg-black text-white"
                  : "bg-white hover:bg-[var(--accent-soft)]"
              }`}
              key={category}
              onClick={() => setActiveFilter(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-[var(--muted)]">
        <p>
          {totalItems} post{totalItems === 1 ? "" : "s"} loaded
        </p>
        {isLoading ? <p className="text-[var(--accent)]">Loading feed...</p> : null}
      </section>

      {error ? (
        <div className="mb-6 border-2 border-black bg-[var(--sun)] p-4 font-bold shadow-[4px_4px_0_#101010]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_#101010]">
            <p className="text-2xl font-black">No posts found.</p>
            <p className="mt-2 text-[var(--muted)]">
              Try a different filter or a shorter search.
            </p>
          </div>
        )}
      </section>

      <div ref={sentinelRef} className="h-8" aria-hidden="true" />
    </main>
  )
}
