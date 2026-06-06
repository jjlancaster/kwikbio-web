export type Week = { title: string; summary: string };

export type Course = {
  slug: string;
  title: string;
  track: string;
  icon: string;
  blurb: string;
  progress: number; // 0–100
  locked?: boolean;
  weeks: Week[];
};

// Static course catalog for the NS-tier shell. Course content is MDX-driven in
// a later phase; this seeds the browser + detail pages with the launch tracks.
export const COURSES: Course[] = [
  {
    slug: "fs-foundations",
    title: "FastScience! Foundations",
    track: "Core",
    icon: "📘",
    blurb:
      "How the ARS engine thinks: PRISM-9 reduction, the SSKM, and reading a research question like a system.",
    progress: 40,
    weeks: [
      {
        title: "Week 1 — The research loop",
        summary:
          "USG → LOPE → ExpChooser → RPEM → VOI. Why automated research is a loop, not a pipeline.",
      },
      {
        title: "Week 2 — PRISM-9 reduction",
        summary:
          "Reducing any system to its ≤9 dominant entities. Hands-on with the kwiKBio Gateway.",
      },
      {
        title: "Week 3 — The SSKM",
        summary:
          "Building a Studied System Knowledge Model and growing it across queries.",
      },
    ],
  },
  {
    slug: "biomedical-track",
    title: "Biomedical Track",
    track: "Vertical",
    icon: "🔬",
    blurb:
      "Apply ARS to biomedical systems — from red blood cell oxygen dynamics to biofilm resistance.",
    progress: 0,
    weeks: [
      {
        title: "Week 1 — Energy at cellular scale",
        summary:
          "Thermodynamic variables (T, Gibbs, enthalpy, entropy, potential) as the centralizing principle.",
      },
      {
        title: "Week 2 — RBC oxygen uptake",
        summary:
          "Modeling the red blood cell regaining oxygen — the first VizSim quest.",
      },
    ],
  },
  {
    slug: "climate-track",
    title: "Climate Track",
    track: "Vertical",
    icon: "🌍",
    blurb: "Coming Q3 — energy dynamics applied to climate adaptation systems.",
    progress: 0,
    locked: true,
    weeks: [],
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
