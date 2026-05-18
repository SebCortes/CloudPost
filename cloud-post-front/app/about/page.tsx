import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FeedIcon from "@mui/icons-material/Feed"
import Link from "next/link"
import { SiteHeader } from "../components/SiteHeader"
import { getPostCategories, getPostStats } from "../lib/posts"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const [stats, categories] = await Promise.all([
    getPostStats(),
    getPostCategories(),
  ])

  return (
    <>
      <SiteHeader active="about" />
      <main>
        <section className="border-b-2 border-black bg-[var(--paper)]">
          <div className="mx-auto grid max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="border-black py-12 lg:border-r-2 lg:py-20 lg:pr-12">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[var(--sun)] px-4 py-2 text-sm font-black">
                <FeedIcon fontSize="small" />
                Anonymous posts, public ideas
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">
                Publish a thought. Let the feed do the rest.
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-[var(--muted)]">
                CloudPost is an anonymous publishing platform with a live
                feed, post pages, and a clean publishing flow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-5 py-3 font-black text-white shadow-[5px_5px_0_var(--accent)] transition hover:-translate-y-0.5"
                  href="/create"
                >
                  <AddCircleOutlineIcon />
                  Create a post
                </Link>
                <Link
                  className="rounded-md border-2 border-black bg-[var(--accent-soft)] px-5 py-3 font-black shadow-[5px_5px_0_#101010] transition hover:-translate-y-0.5"
                  href="/"
                >
                  Open the feed
                </Link>
              </div>
            </div>

            <div className="grid min-h-[420px] content-between border-t-2 border-black bg-[var(--accent)] p-6 text-white lg:border-t-0 lg:p-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-black bg-[var(--sun)] p-4 text-black shadow-[4px_4px_0_#101010]">
                  <p className="text-4xl font-black">{stats.posts}</p>
                  <p className="font-bold">published posts</p>
                </div>
                <div className="border-2 border-black bg-[var(--mint)] p-4 text-black shadow-[4px_4px_0_#101010]">
                  <p className="text-4xl font-black">{stats.likes}</p>
                  <p className="font-bold">likes</p>
                </div>
              </div>
              <div className="mt-12 border-2 border-black bg-[var(--paper)] p-6 text-black shadow-[8px_8px_0_#101010]">
                <p className="text-sm font-black uppercase tracking-normal">
                  Live categories
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      className="rounded-full border-2 border-black bg-[var(--accent-soft)] px-3 py-1 text-sm font-black"
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            {
              icon: <AddCircleOutlineIcon />,
              title: "Create",
              copy: "Draft a post with an optional pseudonym and preview how it will look in the feed.",
            },
            {
              icon: <FavoriteBorderIcon />,
              title: "React",
              copy: "Like posts directly from the feed or from the full reading page.",
            },
            {
              icon: <ChatBubbleOutlineIcon />,
              title: "Discuss",
              copy: "Open any post to read the full text and add anonymous comments locally.",
            },
          ].map((item) => (
            <article
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_#101010]"
              key={item.title}
            >
              <span className="grid size-12 place-items-center rounded-full border-2 border-black bg-[var(--accent-soft)]">
                {item.icon}
              </span>
              <h2 className="mt-5 text-2xl font-black">{item.title}</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">{item.copy}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
