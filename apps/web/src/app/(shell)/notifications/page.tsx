"use client";

import { Bell, RefreshCcw } from "lucide-react";

import { NotificationList } from "../../../components/notification-list";
import { PageShell } from "../../../components/page-shell";
import { Card, SectionTitle } from "../../../components/ui";
import { demoEvents } from "../../../lib/demo-events";
import { useNotifications } from "../../../context/notification-context";

export default function NotificationsPage() {
  const { notifications, triggerDemo, clearNotifications } = useNotifications();

  return (
    <PageShell
      eyebrow="Notifications"
      title="Recent notifications"
      description="All live updates from the system are shown here in the order they arrive. Use the actions to generate new events."
    >
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionTitle title="Inbox" badge={`${notifications.length} live`} />
          <button
            onClick={clearNotifications}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear feed
          </button>
        </div>

        <div className="mt-4">
          <NotificationList notifications={notifications} />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Create a new event" />
        <p className="mt-2 text-sm text-slate-500">Tap one action to publish a real event through the API and watch the feed update.</p>
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
        </div>
      </Card>
    </PageShell>
  );
}
