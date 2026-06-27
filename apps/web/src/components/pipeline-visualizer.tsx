"use client";

import { useEffect, useRef, useState } from "react";

type PipelineNode = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
};

const nodes: PipelineNode[] = [
  { id: "client",   label: "Client",      sublabel: "HTTP POST",    color: "#7c3aed", bg: "#ede9fe" },
  { id: "api",      label: "Express API", sublabel: "Zod Validate", color: "#2563eb", bg: "#dbeafe" },
  { id: "bullmq",   label: "BullMQ",      sublabel: "Redis Queue",  color: "#d97706", bg: "#fef3c7" },
  { id: "worker",   label: "Worker",      sublabel: "Background",   color: "#0891b2", bg: "#cffafe" },
  { id: "socketio", label: "Socket.io",   sublabel: "WebSocket",    color: "#059669", bg: "#d1fae5" },
  { id: "browser",  label: "Browser",     sublabel: "Live Update",  color: "#e11d48", bg: "#ffe4e6" },
];

type Props = {
  triggered?: boolean;
  /** "hero" = big decorative, "card" = compact dashboard card */
  variant?: "hero" | "card";
};

export function PipelineVisualizer({ triggered = false, variant = "hero" }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isPulsing, setIsPulsing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // auto-demo pulse on the hero every 3 seconds
  useEffect(() => {
    if (variant !== "hero") return;
    const run = () => {
      startPulse();
    };
    const id = setInterval(run, 3000);
    run();
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  // external trigger from dashboard
  useEffect(() => {
    if (triggered) startPulse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered]);

  function startPulse() {
    if (isPulsing) return;
    setIsPulsing(true);
    setActiveIndex(0);

    let i = 0;
    const step = () => {
      i++;
      if (i < nodes.length) {
        setActiveIndex(i);
        timerRef.current = setTimeout(step, 220);
      } else {
        timerRef.current = setTimeout(() => {
          setActiveIndex(-1);
          setIsPulsing(false);
        }, 400);
      }
    };
    timerRef.current = setTimeout(step, 220);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (variant === "card") {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {nodes.map((node, i) => {
          const isActive = activeIndex === i;
          return (
            <div key={node.id} className="flex items-center gap-1 flex-shrink-0">
              <div
                className="flex flex-col items-center gap-0.5 transition-all duration-200"
                style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
              >
                <div
                  className="rounded-lg px-2 py-1 text-[10px] font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? node.color : node.bg,
                    color: isActive ? "#fff" : node.color,
                    boxShadow: isActive ? `0 0 8px ${node.color}60` : "none",
                  }}
                >
                  {node.label}
                </div>
                <span className="text-[9px] text-slate-400">{node.sublabel}</span>
              </div>
              {i < nodes.length - 1 && (
                <div className="flex-shrink-0 flex items-center">
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path
                      d="M0 4h10M8 1l3 3-3 3"
                      stroke={activeIndex > i ? nodes[i + 1].color : "#d1d5db"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: "stroke 0.2s" }}
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Hero variant
  return (
    <div className="relative w-full overflow-x-auto">
      <div className="flex items-center justify-center gap-3 min-w-max mx-auto py-4 px-2">
        {nodes.map((node, i) => {
          const isActive = activeIndex === i;
          const isPast = activeIndex > i;
          return (
            <div key={node.id} className="flex items-center gap-3">
              {/* Node */}
              <div
                className="flex flex-col items-center gap-2 transition-all duration-300"
                style={{
                  transform: isActive ? "translateY(-4px) scale(1.08)" : "translateY(0) scale(1)",
                }}
              >
                {/* Dot indicator */}
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-pulse-glow"
                      style={{ background: node.color, opacity: 0.35, transform: "scale(2)" }}
                    />
                  )}
                  <div
                    className="relative w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: isActive || isPast ? node.color : "#e2e8f0",
                      boxShadow: isActive ? `0 0 10px ${node.color}` : "none",
                    }}
                  />
                </div>

                {/* Node card */}
                <div
                  className="rounded-2xl px-4 py-3 text-center transition-all duration-300 min-w-[90px]"
                  style={{
                    background: isActive ? node.color : isPast ? node.bg : "#f8fafc",
                    border: `1.5px solid ${isActive || isPast ? node.color : "#e2e8f0"}`,
                    boxShadow: isActive ? `0 8px 24px ${node.color}40` : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    className="text-xs font-bold tracking-wide transition-colors duration-300"
                    style={{ color: isActive ? "#fff" : node.color }}
                  >
                    {node.label}
                  </p>
                  <p
                    className="text-[10px] mt-0.5 transition-colors duration-300"
                    style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#94a3b8" }}
                  >
                    {node.sublabel}
                  </p>
                </div>
              </div>

              {/* Arrow connector */}
              {i < nodes.length - 1 && (
                <div className="flex items-center">
                  <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                    <path
                      d="M0 6h20M16 2l5 4-5 4"
                      stroke={activeIndex > i ? nodes[i + 1].color : "#cbd5e1"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transition: "stroke 0.25s ease" }}
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
