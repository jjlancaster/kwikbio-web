import Link from "next/link";
import WaitlistButton from "./WaitlistButton";

type Status = "live" | "beta" | "coming";

const STATUS_STYLES: Record<Status, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  coming: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Verticals() {
  return (
    <section id="verticals" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center">Verticals</h2>
      <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
        One ARS engine, many domains. Biomedical is live today — climate and
        energy are next on the FastScience!™ v7 substrate.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {/* Biomedical — LIVE */}
        <div className="flex flex-col rounded-xl border border-vertical-bio/30 bg-white p-6 shadow-sm">
          <StatusBadge status="live" label="LIVE" />
          <h3 className="mt-3 text-xl font-bold text-slate-900">Biomedical</h3>
          <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
            {["kwiKBio", "bioNook", "bioUnicorn", "CrowdCure", "Vermont Med"].map(
              (b) => (
                <li key={b}>· {b}</li>
              ),
            )}
          </ul>
          <div className="mt-6">
            <Link
              href="/gateway"
              className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Enter →
            </Link>
          </div>
        </div>

        {/* Climate — BETA Q3 */}
        <div className="flex flex-col rounded-xl border border-vertical-climate/30 bg-white p-6 shadow-sm">
          <StatusBadge status="beta" label="BETA Q3" />
          <h3 className="mt-3 text-xl font-bold text-slate-900">Climate</h3>
          <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
            {["ClimateCRO", "CRI", "CrowdAdapt", "ESPI · Cit-Sci"].map((b) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
          <div className="mt-6">
            <WaitlistButton vertical="climate" label="Notify me" />
          </div>
        </div>

        {/* Energy — COMING */}
        <div className="flex flex-col rounded-xl border border-vertical-energy/30 bg-white p-6 shadow-sm">
          <StatusBadge status="coming" label="COMING" />
          <h3 className="mt-3 text-xl font-bold text-slate-900">Energy</h3>
          <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
            <li>· Utilergy</li>
          </ul>
          <div className="mt-6">
            <WaitlistButton vertical="energy" label="Join waitlist" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <span
      className={`inline-block w-fit rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}
