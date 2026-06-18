// Compute helpers for Injection Site Tracker tool.

import type {
  WizardFormData,
  ScheduleResult,
  ScheduleEntry,
  InjectionSite,
  Side,
  GridSize,
} from "@/app/data/tools/injection-site-tracker-config";
import { ZONE_INITIALS } from "@/app/data/tools/injection-site-tracker-config";

const TOTAL_INJECTIONS = 12;

function getGridSpots(gridSize: GridSize | null): number {
  switch (gridSize) {
    case "2x2": return 4;
    case "3x3": return 9;
    case "4x4": return 16;
    default: return 1;
  }
}

export function generateSchedule(formData: WizardFormData): ScheduleResult {
  const { selectedSites, frequencyDays, lastDoseDate, trackingMode, gridSize } = formData;

  if (!lastDoseDate || !frequencyDays || selectedSites.length === 0) {
    return { entries: [], totalInjections: 0, siteCounts: {} };
  }

  const startDate = new Date(lastDoseDate);
  startDate.setDate(startDate.getDate() + frequencyDays);

  const sides: Side[] = ["L", "R"];
  const spots = getGridSpots(gridSize);
  const isAdvanced = trackingMode === "advanced";

  const entries: ScheduleEntry[] = [];
  const siteCounts: Record<string, number> = {};
  let siteIndex = 0;
  let sideIndex = 0;
  let spotIndex = 0;

  for (let i = 0; i < TOTAL_INJECTIONS; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * frequencyDays);

    const site = selectedSites[siteIndex % selectedSites.length];
    const side = sides[sideIndex % sides.length];
    const weekNumber = Math.floor(i * frequencyDays / 7) + 1;

    let spotCode: string | null = null;
    if (isAdvanced) {
      const zoneInitial = ZONE_INITIALS[site] || site[0].toUpperCase();
      spotCode = `${zoneInitial}${side}${spotIndex + 1}`;
    }

    entries.push({
      injectionNumber: i + 1,
      date,
      site,
      side,
      spotCode,
      weekNumber,
    });

    siteCounts[site] = (siteCounts[site] || 0) + 1;

    sideIndex++;
    if (sideIndex % 2 === 0) {
      siteIndex++;
      if (isAdvanced) {
        spotIndex++;
        if (spotIndex >= spots) spotIndex = 0;
      }
    }
  }

  return { entries, totalInjections: TOTAL_INJECTIONS, siteCounts };
}

export function formatScheduleDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function getTodayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getQuickDates(): { value: string; label: string }[] {
  const today = new Date();
  const results: { value: string; label: string }[] = [];

  const todayISO = getTodayISO();
  results.push({ value: todayISO, label: "Today" });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  results.push({
    value: formatISO(yesterday),
    label: "Yesterday",
  });

  for (let i = 2; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    results.push({
      value: formatISO(d),
      label: `${i} days ago`,
    });
  }

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  results.push({
    value: formatISO(lastWeek),
    label: "1 week ago",
  });

  return results;
}

function formatISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
