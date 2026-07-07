"use client";

interface BlurLayerProps {
  blurred: boolean;
  children: React.ReactNode;
  intensity?: number; // default 8px
  className?: string;
}

/**
 * BlurLayer — wraps any result block with conditional CSS blur.
 * Used by PreGate to obscure D4, D5, and top hypothesis card until auth.
 * Spec: specs/KWIKBIO-PREGATE-UX-SPEC-2026-07-05.md
 */
export default function BlurLayer({
  blurred,
  children,
  intensity = 8,
  className = "",
}: BlurLayerProps) {
  return (
    <div
      className={`relative transition-all duration-400 ${className}`}
      style={{
        filter: blurred ? `blur(${intensity}px)` : "none",
        transition: "filter 0.4s ease",
        pointerEvents: blurred ? "none" : undefined,
        userSelect: blurred ? "none" : undefined,
      }}
    >
      {children}
    </div>
  );
}
