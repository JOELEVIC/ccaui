"use client";

import Link from "next/link";
import { Card, Eyebrow, GoldButton, GhostButton } from "@/components/redesign/Primitives";

const PLANS = [
  { name: "Monthly", price: "2,500 XAF", period: "per month", featured: false },
  { name: "Season", price: "6,000 XAF", period: "3 months", featured: true },
  { name: "Lifetime", price: "49,000 XAF", period: "one-time", featured: false },
];

const BENEFITS = [
  "Unlimited game reviews",
  "Full lesson library",
  "Unlimited Chess.com game imports",
  "Detailed progress reports",
];

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Membership</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Go further, faster</h1>
        <p className="mt-2 max-w-lg text-ink-60">
          The free plan keeps every core lesson. Membership unlocks unlimited reviews and the full
          library.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <Card
              key={p.name}
              className={`flex flex-col p-5 ${p.featured ? "ring-2 ring-gold" : ""}`}
            >
              {p.featured && (
                <span className="mb-2 inline-block w-fit rounded-full bg-gold-10 px-3 py-1 text-xs font-semibold text-[#8a6d2f]">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-xl text-ink">{p.name}</h2>
              <p className="mt-2 font-display text-2xl text-ink">{p.price}</p>
              <p className="text-sm text-ink-60">{p.period}</p>
              {p.featured ? (
                <GoldButton className="mt-4 w-full text-sm">Choose {p.name}</GoldButton>
              ) : (
                <GhostButton className="mt-4 w-full text-sm">Choose {p.name}</GhostButton>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          <Eyebrow>What&apos;s included</Eyebrow>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-ink">
                <span className="text-gold">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-60">
            Secure checkout via Stripe or Flutterwave. Your card details never touch our servers.
          </p>
        </Card>
      </div>
    </main>
  );
}
