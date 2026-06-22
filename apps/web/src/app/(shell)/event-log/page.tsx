"use client";

import { PageShell } from "../../../components/page-shell";
import { Card, SectionTitle } from "../../../components/ui";
import { useNotifications } from "../../../context/notification-context";

export default function EventLogPage() {
  const { notifications } = useNotifications();

  const rows = notifications.map((notification) => ({
    id: `${notification.eventId}-${notification.channel}`,
    event: notification.title,
    channel: notification.channel === "socket" ? "Web" : notification.channel === "email" ? "Email" : "SMS",
    status: "Sent",
    time: notification.createdAt,
  }));

  return (
    <PageShell
      eyebrow="Event log"
      title="Processing timeline"
      description="A simple queue-style log of events that have entered the system, with the most recent items at the top."
    >
      <Card>
        <SectionTitle title="BullMQ jobs" badge={`${rows.length} items`} />
        <div className="mt-4 space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#faf8f2] px-4 py-8 text-center text-sm text-slate-500">
              No events yet. Use the dashboard buttons to add jobs to BullMQ.
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="grid gap-3 rounded-2xl bg-[#faf8f2] px-4 py-3 md:grid-cols-[1.3fr_0.5fr_0.5fr_0.4fr] md:items-center">
                <div>
                  <p className="font-medium text-slate-900">{row.event}</p>
                  <p className="text-xs text-slate-500">ID: {row.id}</p>
                </div>
                <p className="text-sm text-slate-600">{row.channel}</p>
                <p className="text-sm text-slate-600">{row.status}</p>
                <p className="text-sm text-slate-600 md:text-right">{row.time}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </PageShell>
  );
}
