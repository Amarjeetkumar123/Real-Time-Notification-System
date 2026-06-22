"use client";

import { PageShell } from "../../../components/page-shell";
import { Card, SectionTitle } from "../../../components/ui";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Settings"
      title="Preferences"
      description="A simple settings screen for a non-technical audience. These controls describe how alerts are delivered."
    >
      <section className="grid gap-5 lg:grid-cols-2">
        {[
          { title: "Web alerts", description: "Show notifications instantly in the dashboard." },
          { title: "Email alerts", description: "Send a confirmation email when an event is processed." },
          { title: "SMS alerts", description: "Reserve SMS for high-priority notifications." },
          { title: "Demo data", description: "Trigger sample user actions to see the live system working." },
        ].map((item) => (
          <Card key={item.title}>
            <SectionTitle title={item.title} />
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 inline-flex rounded-full bg-[#faf8f2] px-3 py-1 text-xs font-medium text-slate-700">
              Managed by the worker
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
