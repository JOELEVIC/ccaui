import type { ComponentProps, ReactNode } from "react";

export function Card({ className = "", ...p }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-xl2 bg-surface border border-line shadow-card ${className}`}
      {...p}
    />
  );
}

export function GoldButton({ className = "", ...p }: ComponentProps<"button">) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full
        bg-gold px-6 font-medium text-white shadow-gold transition
        hover:brightness-105 active:scale-[.98] focus-visible:outline
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold
        ${className}`}
      {...p}
    />
  );
}

export function GhostButton({ className = "", ...p }: ComponentProps<"button">) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full
        border border-ink/15 px-6 font-medium text-ink transition
        hover:border-ink/30 active:scale-[.98] ${className}`}
      {...p}
    />
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-gold">
        {children}
      </p>
      <span className="mt-2 block h-px w-10 bg-gold/70" />
    </div>
  );
}
