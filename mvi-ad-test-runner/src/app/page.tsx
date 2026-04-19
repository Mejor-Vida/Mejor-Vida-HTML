import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="max-w-2xl text-zinc-400">
        Manage staged Facebook ad tests for final expense creatives: hook rounds,
        then image/template rounds built from winners — with optional Meta API
        dry-run.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/projects"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Open projects
        </Link>
        <Link
          href="/settings"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
