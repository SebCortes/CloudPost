import { PostFeed } from "./components/PostFeed";
import { SiteHeader } from "./components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader active="feed" />
      <PostFeed />
    </>
  );
}
