"use client";

import { useState } from "react";

const EDUCATION = [
  "High school",
  "Undergraduate",
  "Graduate",
  "Postdoc",
  "Industry / professional",
  "Independent researcher",
];

const INTERESTS = [
  "Biomedical",
  "Climate",
  "Energy",
  "Genomics",
  "Drug discovery",
  "Materials",
  "Neuroscience",
  "Public health",
];

const VERTICALS = ["Biomedical", "Climate", "Energy"];

const field =
  "w-full rounded-md border border-shell-border bg-shell-bg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-secondary/50 focus:border-accent focus:outline-none";

export default function ProfileForm({
  initialEmail,
}: {
  initialEmail?: string | null;
}) {
  const [passion, setPassion] = useState("");
  const [education, setEducation] = useState("");
  const [years, setYears] = useState("");
  const [verticals, setVerticals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          passion: passion.trim(),
          education,
          experienceYears: years ? Number(years) : null,
          verticals,
          interests,
        }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Block
        label="Research passion"
        hint="What problem do you most want to help solve?"
      >
        <textarea
          value={passion}
          onChange={(e) => setPassion(e.target.value)}
          rows={3}
          placeholder="e.g. reversing antibiotic resistance in chronic infections"
          className={`${field} resize-none`}
        />
      </Block>

      <Block label="Education level">
        <select
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className={field}
        >
          <option value="">Select…</option>
          {EDUCATION.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Block>

      <Block label="Years of experience">
        <input
          type="number"
          min={0}
          max={70}
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="0"
          className={field}
        />
      </Block>

      <Block label="Verticals" hint="Where do you work?">
        <ChipGroup
          options={VERTICALS}
          selected={verticals}
          onToggle={(v) => toggle(verticals, setVerticals, v)}
        />
      </Block>

      <Block label="Interests">
        <ChipGroup
          options={INTERESTS}
          selected={interests}
          onToggle={(v) => toggle(interests, setInterests, v)}
        />
      </Block>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-shell-bg transition hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "Saving…" : "Save profile"}
        </button>
        {state === "saved" && (
          <span className="text-sm text-vertical-climate">Saved ✓</span>
        )}
        {state === "error" && (
          <span className="text-sm text-vertical-bio">
            Couldn&apos;t save — try again.
          </span>
        )}
      </div>

      {initialEmail && (
        <p className="text-xs text-ink-secondary/50">Signed in as {initialEmail}</p>
      )}
    </form>
  );
}

function Block({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-primary">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-ink-secondary">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            aria-pressed={on}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              on
                ? "border-accent bg-accent/15 text-accent"
                : "border-shell-border text-ink-secondary hover:border-accent/60 hover:text-ink-primary"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
