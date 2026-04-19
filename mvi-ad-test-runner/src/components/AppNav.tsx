import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/assets", label: "Assets" },
  { href: "/queue", label: "Facebook queue" },
  { href: "/results", label: "Results" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppNav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-emerald-400">
          MVI Ad Test Runner
        </Link>
        <span className="text-zinc-600">|</span>
        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-400 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
