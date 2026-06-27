"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Clock,
  Terminal,
  Database,
  Cpu,
  Layers,
  Search,
  Sliders,
  PlayCircle,
  HelpCircle,
  FileText,
  Wifi
} from "lucide-react";

import { NotificationList } from "../../../components/notification-list";
import { PageShell } from "../../../components/page-shell";
import { PipelineVisualizer } from "../../../components/pipeline-visualizer";
import { Card, SectionTitle, StatCard } from "../../../components/ui";
import { demoEvents } from "../../../lib/demo-events";
import { useNotifications } from "../../../context/notification-context";
import { DetailsDrawer } from "../../../components/details-drawer";

// Health badge helper
function HealthIndicator({ label, status }: { label: string; status: "online" | "warning" | "offline" }) {
  const color = status === "online" ? "#059669" : status === "warning" ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}>
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} className={status === "online" ? "animate-pulse-glow" : ""} />
        <span style={{ fontWeight: 700, color, fontSize: "11px", textTransform: "uppercase" }}>{status}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    notifications,
    connectionState,
    lastUpdatedAt,
    pendingTrigger,
    lastEventTick,
    clearNotifications,
    triggerDemo,
    terminalLogs,
    clearTerminalLogs
  } = useNotifications();

  const [selectedChannel, setSelectedChannel] = useState<"all" | "socket" | "email" | "sms">("all");
  const [pipelineKey, setPipelineKey] = useState(0);
  const [pipelineTriggered, setPipelineTriggered] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  
  // Search & Filter state for event timeline
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signup" | "order" | "payment" | "fail">("all");

  const prevEventTickRef = useRef(lastEventTick);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs console to bottom on update
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (lastEventTick !== prevEventTickRef.current) {
      prevEventTickRef.current = lastEventTick;
      setPipelineKey((k) => k + 1);
      setPipelineTriggered(true);
      const t = setTimeout(() => setPipelineTriggered(false), 1500);
      return () => clearTimeout(t);
    }
  }, [lastEventTick]);

  // Derive production statistics
  const totalEvents = notifications.length;
  const failedEventsCount = notifications.filter((n) => n.title.toLowerCase().includes("fail") || n.title.toLowerCase().includes("error")).length;
  const completedEventsCount = totalEvents - failedEventsCount;
  const retryCount = notifications.filter((n) => n.title.toLowerCase().includes("retry") || n.title.toLowerCase().includes("attempt")).length;
  const avgLatency = totalEvents > 0 ? 41 : 0;
  
  // Filtered notifications logic
  const filteredNotifs = notifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase()) || n.eventId.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "signup") return matchesSearch && n.title.toLowerCase().includes("signup");
    if (filterType === "order") return matchesSearch && n.title.toLowerCase().includes("order");
    if (filterType === "payment") return matchesSearch && n.title.toLowerCase().includes("payment");
    if (filterType === "fail") return matchesSearch && (n.title.toLowerCase().includes("fail") || n.title.toLowerCase().includes("error"));
    return matchesSearch;
  });

  return (
    <PageShell
      eyebrow="Observability"
      title="Observability Terminal"
      description="Production dashboard monitoring queues, event pipelines, and worker telemetry."
    >
      {/* ── Grafana Metrics Grid ── */}
      <section style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard
          label="Express API Gateway"
          value={connectionState === "connected" ? "Connected" : "Re-connecting"}
          accent={connectionState === "connected" ? "#059669" : "#d97706"}
          icon={<Server size={12} />}
        />
        <StatCard label="Total Events" value={totalEvents} accent="var(--color-violet)" icon={<Activity size={12} />} />
        <StatCard label="Completed Jobs" value={completedEventsCount} accent="#059669" icon={<CheckCircle2 size={12} />} />
        <StatCard label="Failed Jobs" value={failedEventsCount} accent="#dc2626" icon={<AlertTriangle size={12} />} />
        <StatCard label="Job Retries" value={retryCount} accent="#d97706" icon={<RefreshCcw size={12} />} />
        <StatCard label="Avg Latency" value={totalEvents > 0 ? `${avgLatency} ms` : "—"} accent="#0ea5e9" icon={<Clock size={12} />} />
        <StatCard label="P95 Latency" value={totalEvents > 0 ? "84 ms" : "—"} accent="#06b6d4" icon={<Clock size={12} />} />
        <StatCard label="Connected Clients" value={connectionState === "connected" ? "15" : "0"} accent="#059669" icon={<Wifi size={12} />} />
        <StatCard label="Worker Status" value="3 Active" accent="#059669" icon={<Cpu size={12} />} />
        <StatCard label="Active Queue Depth" value={totalEvents > 0 ? "1" : "0"} accent="#c026d3" icon={<Layers size={12} />} />
        <StatCard label="Mock CPU Usage" value="12.4%" accent="var(--color-text)" icon={<Cpu size={12} />} />
        <StatCard label="Mock Memory" value="154 MB" accent="var(--color-text)" icon={<Database size={12} />} />
      </section>

      {/* ── Main Monitor Layout ── */}
      <section style={{ display: "grid", gap: "16px", gridTemplateColumns: "1.6fr 0.9fr" }}>
        {/* Left Column: Live Event pipeline + Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Live pipeline */}
          <Card>
            <SectionTitle title="Real-Time Event Pipeline" badge="Observability" />
            <p style={{ margin: "6px 0 16px", fontSize: "13px", color: "var(--color-text-muted)" }}>
              Dynamic path rendering displaying transaction transit time. Click simulation triggers on the right to see animation.
            </p>
            <PipelineVisualizer key={pipelineKey} triggered={pipelineTriggered} variant="card" />
          </Card>

          {/* Event log & filters */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <SectionTitle title="Telemetry Event Log" />
              {/* Search bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "4px 8px" }}>
                <Search size={13} style={{ color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Filter by ID/text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: "12px", color: "var(--color-text)", width: "130px" }}
                />
              </div>
            </div>

            {/* Filter segments */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              {(["all", "signup", "order", "payment", "fail"] as const).map((type) => {
                const active = filterType === type;
                const label = type === "all" ? "All Events" : type === "signup" ? "Signups" : type === "order" ? "Orders" : type === "payment" ? "Payments" : "Failed Only";
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: active ? "var(--color-violet-light)" : "transparent",
                      color: active ? "var(--color-violet)" : "var(--color-text-muted)",
                      fontSize: "11px",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Timeline feed list */}
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                No telemetry events match the filters. Try triggering a simulation on the right.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredNotifs.map((n) => {
                  const isError = n.title.toLowerCase().includes("fail") || n.title.toLowerCase().includes("error");
                  return (
                    <div
                      key={n.eventId}
                      onClick={() => setSelectedNotification(n)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "var(--color-surface-2)",
                        border: isError ? "1px solid rgba(220,38,38,0.2)" : "1px solid var(--color-border)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "border 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-violet)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isError ? "rgba(220,38,38,0.2)" : "var(--color-border)"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "JetBrains Mono", color: isError ? "var(--color-rose)" : "var(--color-emerald)", background: isError ? "var(--color-rose-light)" : "var(--color-emerald-light)", padding: "2px 6px", borderRadius: "4px" }}>
                          {isError ? "FAIL" : "COMPLETED"}
                        </span>
                        <div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>{n.title}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>{n.message}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "JetBrains Mono" }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--color-violet)", fontWeight: 700, textTransform: "uppercase" }}>
                          Channel: {n.channel === "socket" ? "Web" : n.channel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Simulators & Health */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Action Simulation Console */}
          <Card>
            <SectionTitle title="Telemetry Simulation Console" />
            <p style={{ margin: "6px 0 16px", fontSize: "12px", color: "var(--color-text-muted)" }}>
              Simulate operational conditions, input validations, retry loops, and high-resource bottlenecks.
            </p>

            {/* Target Channel Selector Segmented Control */}
            <div style={{ display: "flex", gap: "4px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", padding: "4px", borderRadius: "10px", marginBottom: "14px" }}>
              {(["all", "socket", "email", "sms"] as const).map((ch) => {
                const active = selectedChannel === ch;
                const labelText = ch === "all" ? "All Channels" : ch === "socket" ? "Web" : ch === "email" ? "Email" : "SMS";
                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      borderRadius: "8px",
                      border: "none",
                      background: active ? "var(--color-violet)" : "transparent",
                      color: active ? "#ffffff" : "var(--color-text-muted)",
                      fontSize: "11px",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {labelText}
                  </button>
                );
              })}
            </div>

            {/* Standard trigger triggers */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "14px", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Standard Triggers</span>
              {demoEvents.map((demo) => (
                <button
                  key={demo.label}
                  disabled={!!pendingTrigger}
                  onClick={() => triggerDemo(demo.endpoint, { ...demo.payload, channel: selectedChannel !== "all" ? selectedChannel : undefined }, demo.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--color-violet)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: pendingTrigger ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(124,58,237,0.2)",
                  }}
                >
                  <PlayCircle size={13} />
                  {demo.label}
                </button>
              ))}
            </div>

            {/* Production failure triggers */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Failure Simulations</span>
              
              <button
                disabled={!!pendingTrigger}
                onClick={() => triggerDemo("/events/simulate-retry", {}, "Simulate Retry")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "8px", border: "1px solid var(--color-amber)", background: "rgba(217,119,6,0.06)", color: "var(--color-amber)", fontSize: "12px", fontWeight: 700 }}
              >
                <RefreshCcw size={13} />
                Simulate Retry (attempts 1-2 fail, 3 succeeds)
              </button>

              <button
                disabled={!!pendingTrigger}
                onClick={() => triggerDemo("/events/simulate-fail", {}, "Simulate Failure")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "8px", border: "1px solid var(--color-rose)", background: "var(--color-rose-light)", color: "var(--color-rose)", fontSize: "12px", fontWeight: 700 }}
              >
                <AlertTriangle size={13} />
                Simulate Fatal Failure (3 attempts fail)
              </button>

              <button
                disabled={!!pendingTrigger}
                onClick={() => triggerDemo("/events/simulate-delay", {}, "Simulate Delay")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #0ea5e9", background: "rgba(14,165,233,0.06)", color: "#0ea5e9", fontSize: "12px", fontWeight: 700 }}
              >
                <Clock size={13} />
                Simulate Latency Delay (3000ms pause)
              </button>

              <button
                disabled={!!pendingTrigger}
                onClick={() => triggerDemo("/events/signup", { customerName: "A", email: "bad-email", city: "" }, "Simulate Validation Error")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #d946ef", background: "rgba(217,70,239,0.06)", color: "#d946ef", fontSize: "12px", fontWeight: 700 }}
              >
                <Sliders size={13} />
                Simulate Bad Payload (fails Zod schema validation)
              </button>

              <button
                disabled={!!pendingTrigger}
                onClick={() => triggerDemo("/events/simulate-overflow", {}, "Simulate Queue Overflow")}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "8px", border: "1px solid var(--color-violet)", background: "var(--color-violet-light)", color: "var(--color-violet)", fontSize: "12px", fontWeight: 700 }}
              >
                <Layers size={13} />
                Simulate Queue Overflow (spam 15 events)
              </button>
            </div>
          </Card>

          {/* Infrastructure Health checklist */}
          <Card>
            <SectionTitle title="Infrastructure Health" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
              <HealthIndicator label="Express Gateway API" status={connectionState === "connected" ? "online" : "offline"} />
              <HealthIndicator label="Redis Queue Server" status="online" />
              <HealthIndicator label="BullMQ Scheduler" status="online" />
              <HealthIndicator label="Worker Cluster" status="online" />
              <HealthIndicator label="PostgreSQL DB Cache" status="online" />
              <HealthIndicator label="Socket.io Gateway" status={connectionState === "connected" ? "online" : "offline"} />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Logs terminal + Worker Monitoring ── */}
      <section style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
        
        {/* Monospace log terminal */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <SectionTitle title="Live Log Terminal Stream" />
            <button
              onClick={clearTerminalLogs}
              style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", borderRadius: "6px", fontSize: "11px", padding: "3px 10px", cursor: "pointer" }}
            >
              Clear Logs
            </button>
          </div>
          <div
            ref={terminalContainerRef}
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "14px",
              height: "260px",
              overflowY: "auto",
              fontFamily: "JetBrains Mono, Courier New, monospace",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            {terminalLogs.map((log, i) => {
              const color =
                log.type === "success" ? "#059669" :
                log.type === "error"   ? "#dc2626" :
                log.type === "warn"    ? "#d97706" : "#2563eb";
              return (
                <div key={i} style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--color-border)", padding: "4px 0" }}>
                  <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>[{log.timestamp}]</span>
                  <span style={{ color, fontWeight: 500 }}>{log.message}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Background Worker Cluster Telemetry */}
        <Card>
          <SectionTitle title="Distributed Worker Pool Monitor" />
          <p style={{ margin: "6px 0 14px", fontSize: "13px", color: "var(--color-text-muted)" }}>
            Background worker cluster statuses resolving queued tasks.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { id: "Worker 1 (SIG-0081)", status: "Active (Processing)", desc: "Triggering fan-out notify channels", color: "#059669", active: true },
              { id: "Worker 2 (SIG-0082)", status: "Idle", desc: "Waiting for BullMQ events", color: "#2563eb", active: false },
              { id: "Worker 3 (SIG-0083)", status: "Idle", desc: "Waiting for BullMQ events", color: "#2563eb", active: false },
              { id: "Worker 4 (SIG-0084)", status: "Offline", desc: "Disabled by administrator command", color: "var(--color-text-muted)", active: false },
            ].map((wk) => (
              <div key={wk.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px 16px" }}>
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>{wk.id}</h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)" }}>{wk.desc}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: wk.color }} className={wk.active ? "animate-pulse-glow" : ""} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: wk.color, textTransform: "uppercase" }}>{wk.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── Event Details Drawer ── */}
      <DetailsDrawer notification={selectedNotification} onClose={() => setSelectedNotification(null)} />
    </PageShell>
  );
}
