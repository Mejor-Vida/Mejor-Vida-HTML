export const dynamic = "force-dynamic";

function flag(on: boolean) {
  return on ? (
    <span className="text-emerald-400">set</span>
  ) : (
    <span className="text-zinc-600">missing</span>
  );
}

export default function SettingsPage() {
  const metaToken = Boolean(process.env.META_ACCESS_TOKEN?.trim());
  const metaAcct = Boolean(process.env.META_AD_ACCOUNT_ID?.trim());
  const live =
    process.env.MVI_ALLOW_LIVE_META !== "false" && metaToken && metaAcct;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <p className="text-sm text-zinc-500">
        Environment flags (names only — never paste secrets here). Configure in{" "}
        <code className="text-zinc-400">.env.local</code>.
      </p>
      <ul className="space-y-2 text-sm text-zinc-300">
        <li className="flex justify-between gap-4">
          <span>DATABASE_URL</span>
          {flag(Boolean(process.env.DATABASE_URL))}
        </li>
        <li className="flex justify-between gap-4">
          <span>META_ACCESS_TOKEN</span>
          {flag(metaToken)}
        </li>
        <li className="flex justify-between gap-4">
          <span>META_AD_ACCOUNT_ID</span>
          {flag(metaAcct)}
        </li>
        <li className="flex justify-between gap-4">
          <span>MVI_ALLOW_LIVE_META (not false + tokens)</span>
          {flag(live)}
        </li>
      </ul>
      <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-sm text-amber-100">
        Live submissions require explicit API confirmation and duplicate guards.
        Default is dry-run only.
      </div>
    </div>
  );
}
