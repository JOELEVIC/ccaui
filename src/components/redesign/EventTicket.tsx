type Status = "open" | "live" | "done";

const BADGE: Record<Status, { dot: string; label: string; cls: string; cta: string }> = {
  open: { dot: "🟢", label: "Open for Registration", cls: "bg-up/10 text-up", cta: "Register" },
  live: { dot: "🔴", label: "Ongoing · Spectate", cls: "bg-down/10 text-down", cta: "Watch live →" },
  done: { dot: "⚪", label: "Completed", cls: "bg-ink/5 text-ink-60", cta: "View results" },
};

export type EventTicketProps = {
  title: string;
  date: string;
  status: Status;
  location: string;
  fee: string;
  prize: string;
};

/** Pure presentational server component — ships no JS. */
export function EventTicket({ title, date, status, location, fee, prize }: EventTicketProps) {
  const b = BADGE[status];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl2 border border-line bg-surface shadow-card transition hover:shadow-gold">
      <div className="p-5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${b.cls}`}>
          <span aria-hidden>{b.dot}</span>
          {b.label}
        </span>
        <h3 className="mt-3 font-display text-xl leading-snug text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-60">{date}</p>
      </div>

      {/* perforation with ticket notches */}
      <div className="relative">
        <div className="mx-5 border-t border-dashed border-line" />
        <span className="absolute -left-2 -top-2 size-4 rounded-full bg-canvas" />
        <span className="absolute -right-2 -top-2 size-4 rounded-full bg-canvas" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-line p-5 text-center">
        <Fact icon="📍" label="Location" value={location} />
        <Fact icon="💰" label="Entry" value={fee} />
        <Fact icon="🎁" label="Prize" value={prize} />
      </div>

      <div className="mt-auto p-5 pt-0">
        <button
          className={`min-h-[44px] w-full rounded-full font-medium transition ${
            status === "open"
              ? "bg-gold text-white shadow-gold hover:brightness-105"
              : status === "live"
                ? "border border-down/40 text-down"
                : "border border-ink/15 text-ink-60"
          }`}
        >
          {b.cta}
        </button>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="px-2">
      <div className="text-base" aria-hidden>{icon}</div>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-60">{label}</p>
      <p className="text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
