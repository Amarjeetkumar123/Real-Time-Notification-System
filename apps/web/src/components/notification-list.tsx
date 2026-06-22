import type { NotificationRecord } from "@realtime/shared";

export function NotificationList({ notifications }: { notifications: NotificationRecord[] }) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-[#faf8f2] px-4 py-10 text-center">
        <p className="text-base font-medium text-slate-900">No live notifications yet</p>
        <p className="mt-2 text-sm text-slate-500">Use one of the demo actions to create a real event and watch it appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {notifications.map((notification) => {
        const chip =
          notification.channel === "socket"
            ? "Web"
            : notification.channel === "email"
              ? "Email"
              : "SMS";

        const accent =
          notification.channel === "socket"
            ? "bg-emerald-500"
            : notification.channel === "email"
              ? "bg-violet-500"
              : "bg-rose-500";

        return (
          <article key={`${notification.eventId}-${notification.channel}`} className="flex items-start justify-between gap-4 px-4 py-4 transition hover:bg-slate-50">
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${accent}`} />
              <div>
                <p className="text-[15px] font-medium leading-5 text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-1.5 text-xs text-slate-400">{notification.createdAt}</p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-violet-600">{chip}</span>
          </article>
        );
      })}
    </div>
  );
}
