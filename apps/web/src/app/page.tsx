"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Layers,
  Cpu,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  Server,
  TrendingUp,
  GitBranch,
  ArrowRight,
  Database,
  Terminal,
  ArrowRightLeft,
  ShieldCheck,
  Send,
  Workflow
} from "lucide-react";
import { PipelineVisualizer } from "../components/pipeline-visualizer";

const techBadges = [
  { name: "BullMQ",       color: "#7c3aed" },
  { name: "Redis",        color: "#dc2626" },
  { name: "Socket.io",    color: "#059669" },
  { name: "Express.js",   color: "#2563eb" },
  { name: "Next.js 16",   color: "#0f0f0f" },
  { name: "TypeScript",   color: "#2563eb" },
  { name: "Docker",       color: "#0ea5e9" },
  { name: "Zod",          color: "#c026d3" },
];

const capabilities = [
  { icon: Workflow, title: "Event-driven Architecture", desc: "Loose coupling of publisher and consumer streams via message channels." },
  { icon: Database, title: "Redis Queue Store", desc: "High-speed, in-memory transport providing reliable message buffering." },
  { icon: Cpu, title: "BullMQ Distributed Workers", desc: "State-aware workers handling resource-intensive processes asynchronously." },
  { icon: Wifi, title: "WebSocket Broadcasting", desc: "Multiplexed Socket.io connection delivering alerts without browser polling." },
  { icon: AlertTriangle, title: "Automatic Retries", desc: "Resilient failure recovery handling with configurable exponential backoff." },
  { icon: Clock, title: "Delayed & Scheduled Jobs", desc: "Job scheduling built directly on Redis timers for precise delivery windows." },
  { icon: ShieldCheck, title: "Strict Input Validation", desc: "Zod verification on the API boundary, filtering invalid payloads." },
  { icon: TrendingUp, title: "Horizontal Scaling", desc: "Scale workers and API nodes independently to match request workloads." },
  { icon: Send, title: "Multi-Channel Fan-out", desc: "Generate push, SMS, and email alerts concurrently from a single action." },
  { icon: Terminal, title: "Structured Event logs", desc: "JSON-based structured logging facilitating clean Datadog/ELK parsing." },
  { icon: Server, title: "System Health Checks", desc: "Observability endpoints monitoring active state across Redis, API, and workers." },
  { icon: GitBranch, title: "Type-safe Contracts", desc: "Shared schema contracts across client, API, and workers in a monorepo." },
];

function Clock(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function LandingPage() {
  const [pipelineActive, setPipelineActive] = useState(false);

  // Auto animate the flow diagram every 4 seconds to catch eye
  useEffect(() => {
    const id = setInterval(() => {
      setPipelineActive(true);
      setTimeout(() => setPipelineActive(false), 2000);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "Inter, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px min(48px, 5%)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "rgba(252, 251, 249, 0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #8b5cf6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: "0 2px 10px rgba(139,92,246,0.15)",
            }}
          >
            🔔
          </div>
          <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em" }}>NotifyHub</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            Source Code
          </a>
          <Link
            href="/dashboard"
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              background: "var(--color-violet)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(124,58,237,0.2)",
            }}
          >
            Open Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "80px 24px 60px", maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: "clamp(34px, 5.5vw, 60px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}
        >
          Production-Ready <br />
          <span style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Event-Driven Notification
          </span>{" "}
          System
        </h1>

        <p style={{ margin: "0 auto 36px", fontSize: "clamp(15px, 2vw, 18px)", color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: "700px" }}>
          A scalable backend architecture demonstrating Redis queues, BullMQ workers, WebSockets, retries, and real-time event delivery.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "48px" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
            }}
          >
            🚀 Open Live Dashboard
          </Link>
          <a
            href="https://github.com"
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              border: "1px solid var(--color-border)",
            }}
          >
            View Source Code
          </a>
        </div>

        {/* Tech Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
          {techBadges.map((badge) => (
            <span
              key={badge.name}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: badge.color,
                background: `${badge.color}10`,
                border: `1px solid ${badge.color}25`,
                borderRadius: "6px",
                padding: "4px 10px",
              }}
            >
              {badge.name}
            </span>
          ))}
        </div>
      </section>

      {/* Live Observability Metrics Grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "18px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Activity size={16} style={{ color: "var(--color-emerald)" }} />
            <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text)" }}>
              Live Telemetry Simulation
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
            {[
              { label: "Average Latency", val: "82 ms" },
              { label: "P95 Latency", val: "118 ms" },
              { label: "Queue Depth (Redis)", val: "2 jobs" },
              { label: "Connected Clients", val: "15" },
              { label: "Worker Pool Status", val: "Healthy" },
              { label: "Events Processed", val: "15,482" },
              { label: "Success Rate", val: "99.98%" },
              { label: "Avg Processing Time", val: "41 ms" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "14px" }}>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>{stat.label}</span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text)", fontFamily: "JetBrains Mono" }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Architecture Diagram */}
      <section style={{ maxWidth: "1000px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>Interactive Event Flow Diagram</h2>
          <p style={{ margin: "10px 0 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            The pathway of a notification from API client request down to WebSockets broadcast.
          </p>
        </div>
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "18px", padding: "32px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <PipelineVisualizer triggered={pipelineActive} variant="hero" />
        </div>
      </section>

      {/* Why This Architecture */}
      <section style={{ maxWidth: "1100px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>Why This Architecture?</h2>
          <p style={{ margin: "10px 0 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Key engineering trade-offs and structural choices evaluated for high-throughput production design.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 12px", color: "var(--color-violet)", fontSize: "18px", fontWeight: 700 }}>Why BullMQ?</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "var(--color-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
              <li style={{ marginBottom: "8px" }}>🚀 <b>State-aware jobs</b>: Tracks waiting, active, completed, failed states.</li>
              <li style={{ marginBottom: "8px" }}>🔄 <b>Automatic retries</b>: Resilient handling of provider errors.</li>
              <li>⏰ <b>Delays & limits</b>: Native support for delayed notifications and rate limits.</li>
            </ul>
          </div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 12px", color: "var(--color-rose)", fontSize: "18px", fontWeight: 700 }}>Why Redis?</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "var(--color-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
              <li style={{ marginBottom: "8px" }}>⚡ <b>Microsecond reads</b>: Fast in-memory atomic storage.</li>
              <li style={{ marginBottom: "8px" }}>📦 <b>Data structure engine</b>: Ideal backend for list structures.</li>
              <li>📡 <b>Pub/Sub capability</b>: Low latency message piping between nodes.</li>
            </ul>
          </div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 12px", color: "var(--color-emerald)", fontSize: "18px", fontWeight: 700 }}>Why Socket.io?</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "var(--color-text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
              <li style={{ marginBottom: "8px" }}>🔌 <b>Persistent links</b>: Continuous client-to-server bi-directional pipe.</li>
              <li style={{ marginBottom: "8px" }}>🔄 <b>Auto-reconnection</b>: Restores state seamlessly if connection drops.</li>
              <li>🛡️ <b>Fallback mechanisms</b>: Switches to HTTP polling if sockets are blocked.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Horizontal Scalability Section */}
      <section style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px", textAlign: "center" }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>Built for Horizontal Scale</h2>
          <p style={{ margin: "10px 0 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            How this system scales to handle millions of clients concurrently.
          </p>
        </div>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "18px",
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--color-violet-light)", border: "1px solid rgba(124,58,237,0.15)", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "var(--color-violet)" }}>
            <Layers size={13} />
            SCALE FLOW
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px", color: "var(--color-text)", fontSize: "12px", fontWeight: 700 }}>
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>Clients</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>Load Balancer</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>3x Express Servers</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>Redis Cluster</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>Worker Pool</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>Socket Gateway</span>
            <ArrowRight size={14} style={{ color: "var(--color-violet)" }} />
            <span style={{ padding: "8px 12px", background: "var(--color-violet)", color: "#fff", borderRadius: "6px" }}>10,000+ Clients</span>
          </div>
        </div>
      </section>

      {/* Backend Capabilities Grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>System Capabilities</h2>
          <p style={{ margin: "10px 0 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Production-grade backend patterns implemented to demonstrate engineering depth.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "20px", display: "flex", gap: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "var(--color-violet-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-violet)", flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>{cap.title}</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "32px", fontWeight: 900 }}>See it live in action</h2>
        <p style={{ margin: "0 auto 32px", fontSize: "15px", color: "var(--color-text-muted)", maxWidth: "450px" }}>
          Deploy to sandbox and simulate real-time metrics, queue failures, and event handling.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "16px 36px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
          }}
        >
          🚀 Open Live Observability Terminal
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "30px 24px", borderTop: "1px solid var(--color-border)", fontSize: "12px", color: "var(--color-text-muted)" }}>
        NotifyHub Portfolio · Node.js System Architecture · v1.2.0
      </footer>
    </div>
  );
}
