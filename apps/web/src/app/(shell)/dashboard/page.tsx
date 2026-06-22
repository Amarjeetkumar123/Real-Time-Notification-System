"use client";

import { Bell, CheckCircle2, Circle, Mail, RefreshCcw, Server } from "lucide-react";

import { NotificationList } from "../../../components/notification-list";
import { PageShell } from "../../../components/page-shell";
import { Card, SectionTitle, StatCard } from "../../../components/ui";
import { demoEvents } from "../../../lib/demo-events";
import { useNotifications } from "../../../context/notification-context";

export default function DashboardPage() {
  const { notifications, connectionState, lastUpdatedAt, clearNotifications, triggerDemo } = useNotifications();
  const latestNotifications = notifications.slice(0, 4);

  return (
    <PageShell
      eyebrow="Overview"
      title="Dashboard"
      description="A simple live workspace for the customer-facing notification flow. Trigger a demo action and watch the feed update instantly."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live status" value={connectionState} accent="text-violet-700" />
        <StatCard label="Notifications" value={notifications.length} accent="text-slate-900" />
        <StatCard label="Last update" value={lastUpdatedAt ?? "Waiting"} accent="text-slate-900" />
        <StatCard label="Delivery" value="Web + Email" accent="text-slate-900" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <SectionTitle title="Live notifications" badge={connectionState === "connected" ? "Connected" : "Connecting"} />
          <div className="mt-4">
            <NotificationList notifications={latestNotifications} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle title="Quick actions" />
            <p className="mt-2 text-sm text-slate-500">Use these buttons to create real events through the API.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {demoEvents.map((demo) => (
                <button
                  key={demo.label}
                  onClick={() => triggerDemo(demo.endpoint, demo.payload)}
                  className="rounded-full bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  {demo.label}
                </button>
              ))}
              <button
                onClick={clearNotifications}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear feed
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle title="How it works" />
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>1. A user action creates a BullMQ job.</p>
              <p>2. The worker processes the job in the background.</p>
              <p>3. The dashboard updates instantly through Socket.io.</p>
            </div>
            <div className="mt-4 rounded-2xl bg-[#faf8f2] px-4 py-3 text-sm text-slate-700">
              Open a different page and the live feed stays available.
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <SectionTitle title="Queue activity" badge="BullMQ" />
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              ["ORDER_PLACED", "Sent", "Web"],
              ["PAYMENT_SUCCESS", "Sent", "Email"],
              ["USER_SIGNUP", "Queued", "Web"],
              ["PASSWORD_CHANGE", "Failed", "SMS"],
            ].map(([name, status, channel]) => (
              <div key={name} className="flex items-center justify-between rounded-xl bg-[#faf8f2] px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">Channel: {channel}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    status === "Sent"
                      ? "bg-lime-100 text-lime-700"
                      : status === "Queued"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Delivery summary" />
          <div className="mt-4 space-y-4">
            {[
              { label: "Web alerts", value: 64, icon: <Bell className="h-4 w-4" /> },
              { label: "Emails sent", value: 42, icon: <Mail className="h-4 w-4" /> },
              { label: "Texts sent", value: 22, icon: <Server className="h-4 w-4" /> },
              { label: "Retries", value: 4, icon: <RefreshCcw className="h-4 w-4" /> },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#f0ede4]">
                  <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${item.value * 1.2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
