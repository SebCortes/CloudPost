import { CreatePostForm } from "../components/CreatePostForm"
import { SiteHeader } from "../components/SiteHeader"

export default function CreatePostPage() {
  return (
    <>
      <SiteHeader active="create" />
      <CreatePostForm />
    </>
  )
}
