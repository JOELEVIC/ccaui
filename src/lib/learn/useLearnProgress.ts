"use client";

import { useCallback, useEffect, useState } from "react";
import { flattenLessons, type World } from "./types";

const LS_DONE = "dchess-learn-progress-v1";

function readDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_DONE);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * Linear unlock across the flattened world: the first lesson is always open,
 * and each next lesson opens once the previous is complete. Progress lives in
 * localStorage so guests keep it without an account.
 */
export function useLearnProgress(world: World) {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDone(readDone());
    setHydrated(true);
  }, []);

  const complete = useCallback((lessonId: string) => {
    setDone((prev) => {
      if (prev.has(lessonId)) return prev;
      const next = new Set(prev);
      next.add(lessonId);
      try {
        localStorage.setItem(LS_DONE, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const order = flattenLessons(world).map((x) => x.lesson.id);

  const isComplete = useCallback((id: string) => done.has(id), [done]);

  const isUnlocked = useCallback(
    (id: string) => {
      const idx = order.indexOf(id);
      if (idx <= 0) return true;
      return done.has(order[idx - 1]);
    },
    [done, order],
  );

  /** A stage is reachable once its first lesson is unlocked; otherwise it's clouded. */
  const isStageUnlocked = useCallback(
    (firstLessonId: string) => isUnlocked(firstLessonId),
    [isUnlocked],
  );

  const completedCount = order.filter((id) => done.has(id)).length;

  return { hydrated, isComplete, isUnlocked, isStageUnlocked, complete, completedCount, total: order.length };
}
