"use client"

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import ScheduleIcon from "@mui/icons-material/Schedule"
import VisibilityIcon from "@mui/icons-material/Visibility"
import Link from "next/link"
import { useState } from "react"
import { likePost, unlikePost, type Post } from "../lib/posts"

const accentClassNames: Record<Post["accent"], string> = {
  violet: "bg-[var(--accent-soft)]",
  sun: "bg-[var(--sun)]",
  mint: "bg-[var(--mint)]",
  rose: "bg-[var(--rose)]",
}

type PostCardProps = {
  post: Post
  expanded?: boolean
}

function getPreview(body: string, expanded: boolean) {
  if (expanded || body.length <= 260) {
    return body
  }

  return `${body.slice(0, 260).trim()}...`
}

export function PostCard({ post, expanded = false }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const reactionCount = liked ? post.reactions + 1 : post.reactions
  const preview = getPreview(post.body, expanded)
  const isTruncated = !expanded && post.body.length > preview.length

  async function handleLikeToggle() {
    if (isUpdatingLike) {
      return
    }

    const nextLikedState = !liked

    setLiked(nextLikedState)
    setIsUpdatingLike(true)

    try {
      if (nextLikedState) {
        await likePost(post.id)
      } else {
        await unlikePost(post.id)
      }
    } catch {
      setLiked((currentLiked) => !currentLiked)
      alert(
        nextLikedState
          ? "Failed to like the post. Please try again."
          : "Failed to unlike the post. Please try again.",
      )
    } finally {
      setIsUpdatingLike(false)
    }
  }

  return (
    <article className="group border-2 border-black bg-[var(--paper)] p-5 shadow-[6px_6px_0_#101010] transition hover:-translate-y-1 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-normal ${
            accentClassNames[post.accent]
          }`}
        >
          {post.category}
        </span>
        <span className="text-sm font-semibold text-[var(--muted)]">
          {post.publishedAt}
        </span>
      </div>

      <Link className="block" href={`/posts/${post.id}`}>
        <h2 className="text-2xl font-black leading-tight tracking-normal sm:text-4xl">
          {post.title}
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {post.excerpt}
        </p>
        <p className="mt-5 whitespace-pre-line text-lg leading-8">
          {preview}
          {isTruncated ? (
            <span className="font-black text-[var(--accent)]"> Read more...</span>
          ) : null}
        </p>
      </Link>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-2 border-black pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border-2 border-black bg-white font-black">
            {post.author.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-black">{post.author}</p>
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)]">
              <ScheduleIcon sx={{ fontSize: 15 }} />
              {post.readTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold">
          <button
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-[var(--accent-soft)] ${
              liked ? "text-[var(--accent)]" : ""
            }`}
            disabled={isUpdatingLike}
            onClick={handleLikeToggle}
            type="button"
          >
            {liked ? (
              <FavoriteIcon sx={{ fontSize: 18 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            )}
            {reactionCount}
          </button>
          <span className="inline-flex items-center gap-1">
            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            {post.commentCount}
          </span>
          <Link
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-[var(--accent-soft)]"
            href={`/posts/${post.id}`}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
            Read
          </Link>
        </div>
      </footer>
    </article>
  )
}
