import type { Level } from "@/lib/ars-query";

// Level difficulty markers follow international ski-trail marking, reused for the
// CAST / UDL adaptive-learning level system. Each marker sits on its own WHITE
// SIGN panel (like real trail signage), so the shape reads correctly on any
// background — in particular the black diamond is genuinely black-on-white
// rather than an outline on the dark app shell:
//   green circle  → Easy      (easiest)
//   blue square   → Novice    (intermediate)
//   black diamond → Pro       (advanced)
//   double black  → (future)  (expert — anticipated, not yet a live Level)
//
// Shape AND colour both encode difficulty (accessibility; survives greyscale).
export type LevelShape = "circle" | "square" | "diamond" | "double-diamond";

export interface LevelMeta {
  value: Level;
  label: string;
  shape: LevelShape;
  hint: string;
}

// Single source of truth for the Level UI, ordered easiest → hardest.
//
// FUTURE LEVEL: a more advanced tier drops in here as one entry — e.g.
//   { value: "expert", label: "Expert", shape: "double-diamond", hint: … }
// once lib/ars-query adds "expert" to the `Level` union and a LevelPlan. The
// symbol renderer already draws the double black diamond, and every consumer
// iterates LEVEL_META, so no UI rewiring is needed when that day comes.
export const LEVEL_META: readonly LevelMeta[] = [
  {
    value: "beginner",
    label: "Easy",
    shape: "circle",
    hint: "Easy · layers 0–1 — plain-language, shallow graph, guided pathways",
  },
  {
    value: "novice",
    label: "Novice",
    shape: "square",
    hint: "Novice · layers 0–3 — terminology + confidence, more research routes",
  },
  {
    value: "pro",
    label: "Pro",
    shape: "diamond",
    hint: "Pro · layers 0–5 — full depth, provenance, LOPE/SSKM, all pathways",
  },
];

const SHAPE_FILL: Record<LevelShape, string> = {
  circle: "#16a34a", // green — easiest
  square: "#2563eb", // blue — intermediate
  diamond: "#0b0b0b", // black — advanced
  "double-diamond": "#0b0b0b", // black — expert (future)
};

export function LevelSymbol({
  shape,
  size = 15,
  className = "",
}: {
  shape: LevelShape;
  size?: number;
  className?: string;
}) {
  const fill = SHAPE_FILL[shape];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* White sign panel — the marker always sits on white, so a black diamond
          is truly black-on-white on any background. */}
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3"
        fill="#ffffff"
        stroke="rgba(15,23,42,0.25)"
        strokeWidth="0.75"
      />
      {shape === "circle" && <circle cx="8" cy="8" r="4.3" fill={fill} />}
      {shape === "square" && (
        <rect x="4" y="4" width="8" height="8" rx="1" fill={fill} />
      )}
      {shape === "diamond" && (
        <rect
          x="4.75"
          y="4.75"
          width="6.5"
          height="6.5"
          rx="0.6"
          fill={fill}
          transform="rotate(45 8 8)"
        />
      )}
      {shape === "double-diamond" && (
        <>
          <rect
            x="2.5"
            y="5.5"
            width="5"
            height="5"
            rx="0.5"
            fill={fill}
            transform="rotate(45 5 8)"
          />
          <rect
            x="8.5"
            y="5.5"
            width="5"
            height="5"
            rx="0.5"
            fill={fill}
            transform="rotate(45 11 8)"
          />
        </>
      )}
    </svg>
  );
}
