"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SendIcon from "@mui/icons-material/Send";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Comment, Post } from "../lib/posts";

type PostReaderProps = {
  post: Post;
};

export function PostReader({ post }: PostReaderProps) {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const reactionCount = liked ? post.reactions + 1 : post.reactions;

  const wordCount = useMemo(
    () => post.body.trim().split(/\s+/).filter(Boolean).length,
    [post.body],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    setComments((currentComments) => [
      {
        id: Date.now(),
        author: author.trim() || "Anonymous",
        body: body.trim(),
        publishedAt: "Just now",
      },
      ...currentComments,
    ]);
    setBody("");
    setAuthor("");
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black hover:bg-[var(--accent-soft)]"
        href="/"
      >
        <ArrowBackIcon fontSize="small" />
        Back to feed
      </Link>

      <article className="border-2 border-black bg-[var(--paper)] p-5 shadow-[6px_6px_0_#101010] sm:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border-2 border-black bg-[var(--accent-soft)] px-3 py-1 text-xs font-black uppercase tracking-normal">
            {post.category}
          </span>
          <span className="text-sm font-semibold text-[var(--muted)]">
            {post.publishedAt}
          </span>
          <span className="text-sm font-semibold text-[var(--muted)]">
            {post.readTime} · {wordCount} words
          </span>
        </div>

        <h1 className="text-4xl font-black leading-tight sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-5 text-xl leading-8 text-[var(--muted)]">
          {post.excerpt}
        </p>

        <div className="mt-8 whitespace-pre-line border-y-2 border-black py-8 text-lg leading-9">
          {post.body}
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full border-2 border-black bg-white font-black">
              {post.author.charAt(0)}
            </span>
            <div>
              <p className="font-black">{post.author}</p>
              <p className="text-sm font-semibold text-[var(--muted)]">
                Anonymous publication
              </p>
            </div>
          </div>

          <button
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`inline-flex items-center gap-2 rounded-md border-2 border-black px-4 py-2 font-black shadow-[4px_4px_0_#101010] transition hover:-translate-y-0.5 ${
              liked
                ? "bg-[var(--accent)] text-white"
                : "bg-white text-black hover:bg-[var(--accent-soft)]"
            }`}
            onClick={() => setLiked((current) => !current)}
            type="button"
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            {reactionCount}
          </button>
        </footer>
      </article>

      <section className="grid gap-5">
        <div>
          <p className="font-black uppercase tracking-normal text-[var(--accent)]">
            Discussion
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-3xl font-black">
            <ChatBubbleOutlineIcon />
            {comments.length} comments
          </h2>
        </div>

        <form
          className="grid gap-4 border-2 border-black bg-white p-5 shadow-[5px_5px_0_var(--accent)]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <input
              className="border-2 border-black bg-[var(--paper)] px-4 py-3 font-bold outline-none focus:bg-[var(--accent-soft)]"
              maxLength={32}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Optional pseudonym"
              value={author}
            />
            <input
              className="border-2 border-black bg-[var(--paper)] px-4 py-3 outline-none focus:bg-[var(--accent-soft)]"
              onChange={(event) => setBody(event.target.value)}
              placeholder="Add an anonymous comment"
              value={body}
            />
          </div>
          <button
            className="inline-flex w-fit items-center gap-2 rounded-md border-2 border-black bg-black px-5 py-3 font-black text-white shadow-[4px_4px_0_var(--accent)] transition hover:-translate-y-0.5"
            type="submit"
          >
            <SendIcon fontSize="small" />
            Publish comment
          </button>
        </form>

        <div className="grid gap-4">
          {comments.map((comment) => (
            <article
              className="border-2 border-black bg-[var(--paper)] p-5 shadow-[4px_4px_0_#101010]"
              key={comment.id}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-black">{comment.author}</p>
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {comment.publishedAt}
                </p>
              </div>
              <p className="mt-3 leading-7 text-[var(--muted)]">{comment.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
