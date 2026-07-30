import type { Level } from "@/lib/ars-query";

// Level difficulty markers follow international ski-trail marking, reused for the
// CAST / UDL adaptive-learning level system:
//   green circle  → Easy      (easiest)
//   blue square   → Novice    (intermediate)
//   black diamond → Pro       (advanced)
//   double black  → (future)  (expert — anticipated, not yet a live Level)
//
// Shape AND colour both encode difficulty, so the level is legible without
// relying on colour alone (accessibility, and it survives greyscale/print).
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
  circle: "#22c55e", // green — easiest
  square: "#3b82f6", // blue — intermediate
  diamond: "#0b0b0b", // black — advanced
  "double-diamond": "#0b0b0b", // black — expert (future)
};

// Light outline keeps the black diamond legible on dark backgrounds (the app
// shell is bio-navy); it reads as a plain black diamond on light surfaces too.
const OUTLINE = "rgba(226,232,240,0.85)";

export function LevelSymbol({
  shape,
  size = 14,
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
      {shape === "circle" && <circle cx="8" cy="8" r="6" fill={fill} />}
      {shape === "square" && (
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill={fill} />
      )}
      {shape === "diamond" && (
        <rect
          x="3.5"
          y="3.5"
          width="9"
          height="9"
          rx="1"
          fill={fill}
          stroke={OUTLINE}
          strokeWidth="1"
          transform="rotate(45 8 8)"
        />
      )}
      {shape === "double-diamond" && (
        <>
          <rect
            x="1"
            y="4"
            width="7"
            height="7"
            rx="0.8"
            fill={fill}
            stroke={OUTLINE}
            strokeWidth="1"
            transform="rotate(45 4.5 7.5)"
          />
          <rect
            x="8"
            y="4"
            width="7"
            height="7"
            rx="0.8"
            fill={fill}
            stroke={OUTLINE}
            strokeWidth="1"
            transform="rotate(45 11.5 7.5)"
          />
        </>
      )}
    </svg>
  );
}
