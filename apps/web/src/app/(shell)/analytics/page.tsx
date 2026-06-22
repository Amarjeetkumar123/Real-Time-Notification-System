"use client";

import { PageShell } from "../../../components/page-shell";
import { Card, SectionTitle } from "../../../components/ui";
import { useNotifications } from "../../../context/notification-context";

export default function AnalyticsPage() {
  const { notifications } = useNotifications();

  const counts = {
    web: notifications.filter((item) => item.channel === "socket").length,
    email: notifications.filter((item) => item.channel === "email").length,
    sms: notifications.filter((item) => item.channel === "sms").length,
  };

  return (
    <PageShell
      eyebrow="Analytics"
      title="Delivery overview"
      description="A lightweight summary of the current notification mix so the product feels useful to a non-technical viewer."
    >
      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Delivery mix" />
          <div className="mt-4 space-y-4">
            {[
              { label: "Web alerts", value: counts.web, color: "bg-violet-500" },
              { label: "Emails", value: counts.email, color: "bg-blue-500" },
              { label: "Texts", value: counts.sms, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#f0ede4]">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.max(item.value * 20, 8)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Health" />
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>• BullMQ is used for background job handling.</p>
            <p>• Socket.io pushes live updates to the dashboard.</p>
            <p>• Email notifications are sent from the worker.</p>
            <p>• Redis supports both the queue and realtime channel.</p>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
