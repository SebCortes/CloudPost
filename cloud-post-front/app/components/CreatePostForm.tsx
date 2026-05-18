"use client"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import SendIcon from "@mui/icons-material/Send"
import Link from "next/link"
import { useMemo, useState } from "react"
import { PostCard } from "./PostCard"
import {
  buildDraftPost,
  createPost,
  postCategories,
  type Post,
  type PostCategory,
} from "../lib/posts"
import { useRouter } from "next/navigation"

const selectableCategories = postCategories

export function CreatePostForm() {
  const [title, setTitle] = useState("What I wish more people wrote about")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState<PostCategory>("Idea")
  const [body, setBody] = useState(
    "A post that states one idea clearly without trying to solve everything. The discussion can do the rest.",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const router = useRouter()

  const previewPost = useMemo<Post>(
    () => buildDraftPost({
      title,
      body,
      author,
      category,
    }),
    [author, body, category, title],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()
    const trimmedAuthor = author.trim()

    if (!trimmedTitle || !trimmedBody) {
      setFeedback({
        type: "error",
        message: "Title and content are required before publishing.",
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const postId = await createPost({
        title: trimmedTitle,
        content: trimmedBody,
        authorName: trimmedAuthor || "Anonymous",
        category,
      })

      setFeedback({
        type: "success",
        message: "Post published through the API. It will appear in the feed on the next refresh or infinite-scroll fetch.",
      })

      router.push(`/posts/${postId}`)
    } catch {
      setFeedback({
        type: "error",
        message: "The API rejected the post. Check the required title, content, and author rules.",
      })
    } finally {
      setIsSubmitting(false)
      window.scrollTo(0, 0)
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 border-2 border-black bg-[var(--paper)] p-4 shadow-[5px_5px_0_#101010] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black hover:bg-[var(--accent-soft)]"
            href="/"
          >
            <ArrowBackIcon fontSize="small" />
            Back to feed
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[var(--mint)] px-4 py-2 text-sm font-black">
            <DriveFileRenameOutlineIcon fontSize="small" />
            Local draft
          </span>
        </div>
        <p className="max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">
          What&apos;s on your mind? Write a post and see it come alive in the feed preview.
        </p>
      </section>

      {feedback ? (
        <div className="flex items-start gap-3 border-2 border-black bg-[var(--sun)] p-4 shadow-[4px_4px_0_#101010]">
          <CheckCircleOutlineIcon />
          <p className="font-bold">
            {feedback.message}
          </p>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form
          className="grid gap-5 border-2 border-black bg-white p-5 shadow-[6px_6px_0_var(--accent)] sm:p-7"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-black uppercase tracking-normal" htmlFor="title">
              Title
            </label>
            <input
              className="mt-2 w-full border-2 border-black bg-[var(--paper)] px-4 py-3 text-lg font-bold outline-none focus:bg-[var(--accent-soft)]"
              id="title"
              maxLength={96}
              onChange={(event) => {
                  setFeedback(null)
                setTitle(event.target.value)
              }}
              value={title}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-black uppercase tracking-normal" htmlFor="author">
                Optional pseudonym
              </label>
              <input
                className="mt-2 w-full border-2 border-black bg-[var(--paper)] px-4 py-3 font-bold outline-none focus:bg-[var(--accent-soft)]"
                id="author"
                maxLength={32}
                onChange={(event) => {
                  setFeedback(null)
                  setAuthor(event.target.value)
                }}
                placeholder="Anonymous"
                value={author}
              />
            </div>

            <div>
              <label className="text-sm font-black uppercase tracking-normal" htmlFor="category">
                Category
              </label>
              <select
                className="mt-2 w-full border-2 border-black bg-[var(--paper)] px-4 py-3 font-bold outline-none focus:bg-[var(--accent-soft)]"
                id="category"
                onChange={(event) => {
                  setFeedback(null)
                  setCategory(event.target.value as PostCategory)
                }}
                value={category}
              >
                {selectableCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid min-h-[55vh]">
            <label className="text-sm font-black uppercase tracking-normal" htmlFor="body">
              Content
            </label>
            <textarea
              className="mt-2 min-h-[50vh] w-full resize-y border-2 border-black bg-[var(--paper)] px-4 py-3 leading-7 outline-none focus:bg-[var(--accent-soft)]"
              id="body"
              onChange={(event) => {
                setFeedback(null)
                setBody(event.target.value)
              }}
              value={body}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-5">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
              <AutoAwesomeIcon fontSize="small" />
              {body.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-5 py-3 font-black text-white shadow-[5px_5px_0_var(--accent)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <SendIcon fontSize="small" />
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-black uppercase tracking-normal text-[var(--accent)]">
            Feed preview
          </p>
          <PostCard post={previewPost} />
        </aside>
      </section>
    </main>
  )
}
