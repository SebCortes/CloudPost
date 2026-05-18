"use client";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PostCard } from "./PostCard";
import { categories, initialPosts, type PostCategory } from "../lib/posts";

type FeedFilter = PostCategory | "All";

export function PostFeed() {
  const [posts] = useState(initialPosts);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All");
  const [query, setQuery] = useState("");

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesFilter = activeFilter === "All" || post.category === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${post.title} ${post.excerpt} ${post.body}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, posts, query]);

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
          {categories.map((category) => (
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

      <section className="grid gap-6">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_#101010]">
            <p className="text-2xl font-black">No posts found.</p>
            <p className="mt-2 text-[var(--muted)]">
              Try a different filter or a shorter search.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
