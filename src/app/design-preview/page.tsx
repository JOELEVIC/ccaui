import { DailyPuzzleCard } from "@/components/redesign/DailyPuzzleCard";
import { MiniLesson } from "@/components/redesign/MiniLesson";
import { Leaderboard } from "@/components/redesign/Leaderboard";
import { EventTicket } from "@/components/redesign/EventTicket";
import { Eyebrow } from "@/components/redesign/Primitives";

export const metadata = { title: "Design Preview · Cameroon Chess Academy" };

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Eyebrow>Cameroon Chess Academy</Eyebrow>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Train. Compete. <span className="text-gold">Climb.</span>
        </h1>
        <p className="mt-2 max-w-lg text-ink-60">
          Light-mode redesign preview — explore freely, no account needed.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <DailyPuzzleCard />
          <MiniLesson />
        </div>

        <div className="mt-5">
          <Leaderboard />
        </div>

        <div className="mt-10">
          <Eyebrow>Upcoming Events</Eyebrow>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EventTicket
              title="Douala Open 2026"
              date="Sat 12 Jul · 9:00"
              status="open"
              location="Douala"
              fee="2,000 CFA"
              prize="500,000 CFA"
            />
            <EventTicket
              title="Blitz Arena"
              date="Live now"
              status="live"
              location="Online"
              fee="Free"
              prize="Glory"
            />
            <EventTicket
              title="Yaoundé Junior Cup"
              date="22 Jun · Completed"
              status="done"
              location="Yaoundé"
              fee="Free"
              prize="Trophies"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
