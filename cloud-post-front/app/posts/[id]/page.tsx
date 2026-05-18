import { notFound } from "next/navigation";
import { PostReader } from "../../components/PostReader";
import { SiteHeader } from "../../components/SiteHeader";
import { getPostById, initialPosts } from "../../lib/posts";

export function generateStaticParams() {
  return initialPosts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SiteHeader active="feed" />
      <PostReader post={post} />
    </>
  );
}
