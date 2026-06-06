import GatewayWorkspace from "@/components/shell/GatewayWorkspace";

export const metadata = { title: "kwiKBio Gateway — kwiKBio" };

export default function KwikbioGatewayPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">kwiKBio</h1>
          <span aria-hidden>🔬</span>
          <span className="rounded-md border border-vertical-bio/40 bg-vertical-bio/10 px-2 py-0.5 text-xs text-ink-secondary">
            Biomedical
          </span>
        </div>
        <span className="rounded-md border border-shell-border px-2 py-1 text-xs text-ink-secondary">
          Gateway
        </span>
      </div>

      <GatewayWorkspace />
    </div>
  );
}
