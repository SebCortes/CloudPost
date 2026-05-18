import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import Link from "next/link"

type SiteHeaderProps = {
  active?: "about" | "feed" | "create"
}

export function SiteHeader({ active = "feed" }: SiteHeaderProps) {
  const navItem = (href: string, label: string, key: SiteHeaderProps["active"]) => (
    <Link
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active === key
          ? "bg-black text-white"
          : "text-black hover:bg-black hover:text-white"
      }`}
      href={href}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-20 border-b-2 border-black bg-[var(--paper)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2" href="/">
          <span className="grid size-10 place-items-center rounded-full border-2 border-black bg-[var(--accent)] text-white shadow-[3px_3px_0_#101010]">
            <AutoAwesomeIcon fontSize="small" />
          </span>
          <span className="text-2xl font-black tracking-normal">CloudPost</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {navItem("/about", "About", "about")}
          {navItem("/", "Feed", "feed")}
          {navItem("/create", "Create", "create")}
        </nav>

        <Link
          className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0_var(--accent)] transition hover:-translate-y-0.5"
          href="/create"
        >
          <AddCircleOutlineIcon fontSize="small" />
          Publish
        </Link>
      </div>
    </header>
  )
}
