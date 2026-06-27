"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ── Card ────────────────────────────────────────────────────── */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}
    >
      {children}
    </div>
  );
}

/* ── SectionTitle ─────────────────────────────────────────────── */
const BADGE_VARIANTS: Record<string, { color: string; bg: string }> = {
  Connected:    { color: "#059669", bg: "rgba(5,150,105,0.08)" },
  Connecting:   { color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  Disconnected: { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  BullMQ:       { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  default:      { color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

export function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  const style = badge ? (BADGE_VARIANTS[badge] ?? BADGE_VARIANTS.default) : null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em", textTransform: "uppercase" }}>
        {title}
      </h3>
      {badge && style && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: style.color,
            background: style.bg,
            borderRadius: "999px",
            padding: "2px 8px",
            border: `1px solid ${style.color}25`,
            fontFamily: "JetBrains Mono",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── StatCard (animated value) ────────────────────────────────── */
export function StatCard({
  label,
  value,
  accent = "var(--color-text)",
  icon,
}: {
  label: string;
  value: string | number;
  accent?: string;
  icon?: ReactNode;
}) {
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setAnimating(true);
      const id = setTimeout(() => setAnimating(false), 450);
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "16px 18px",
        transition: "box-shadow 0.2s",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--color-text-muted)",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {icon}
        {label}
      </p>
      <p
        className={animating ? "animate-count-pop" : ""}
        style={{
          margin: "8px 0 0",
          fontSize: "24px",
          fontWeight: 700,
          color: accent,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {value}
      </p>
    </div>
  );
}
