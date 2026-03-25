import { useEffect, useRef } from "react";
import { STORAGE_KEY } from "../data";

export function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useStorageSync(watched, skipFiller, mode, seenMilestones, loaded, targetDate, dailyPace, arcRatings) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            watched: [...watched],
            skipFiller,
            mode,
            seenMilestones: [...seenMilestones],
            targetDate: targetDate ? targetDate.toISOString() : null,
            dailyPace,
            arcRatings,
          })
        );
      } catch {}
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [watched, skipFiller, mode, seenMilestones, loaded, targetDate, dailyPace, arcRatings]);
}
