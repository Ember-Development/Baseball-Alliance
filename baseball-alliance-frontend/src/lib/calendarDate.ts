/** Calendar date helpers — treat YYYY-MM-DD as a date, not a UTC instant. */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDateParts(iso: string): [number, number, number] {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return [y, m, d];
}

/** HTML date input value from an ISO datetime string. */
export function isoToCalendarDateInput(iso: string): string {
  return iso.slice(0, 10);
}

/** ISO datetime at UTC midnight for a calendar date (YYYY-MM-DD). */
export function calendarDateToIso(dateStr: string): string {
  if (!DATE_ONLY.test(dateStr)) {
    throw new Error(`Expected YYYY-MM-DD, got "${dateStr}"`);
  }
  const [y, m, d] = parseIsoDateParts(dateStr);
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

const DISPLAY_OPTS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
};

/** Format an ISO datetime as a calendar date (no timezone day shift). */
export function formatCalendarDate(iso: string): string {
  const [y, m, d] = parseIsoDateParts(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
    undefined,
    DISPLAY_OPTS
  );
}

/** Local Date for countdown timers from calendar date + optional time string. */
export function calendarDateTimeToLocalDate(
  iso: string,
  startTime?: string | null
): Date {
  const [y, m, d] = parseIsoDateParts(iso);
  const base = new Date(y, m - 1, d);
  if (startTime) {
    const m = startTime.trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const mins = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      base.setHours(h, mins, 0, 0);
    }
  }
  return base;
}
