import { format, parseISO, addDays, subDays, isAfter, isBefore } from 'date-fns';

export const START_DATE = '2026-07-10';
export const END_DATE = '2026-08-31';

export function getDatesRange(): string[] {
  const dates: string[] = [];
  let current = parseISO(START_DATE);
  const end = parseISO(END_DATE);

  while (!isAfter(current, end)) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }
  return dates;
}

export function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'd MMMM yyyy');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'd MMM');
}

export function getPreviousDay(dateStr: string): string | null {
  const current = parseISO(dateStr);
  const prev = subDays(current, 1);
  const prevStr = format(prev, 'yyyy-MM-dd');
  if (isBefore(prev, parseISO(START_DATE))) {
    return null;
  }
  return prevStr;
}

export function getNextDay(dateStr: string): string | null {
  const current = parseISO(dateStr);
  const next = addDays(current, 1);
  const nextStr = format(next, 'yyyy-MM-dd');
  if (isAfter(next, parseISO(END_DATE))) {
    return null;
  }
  return nextStr;
}

export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialSelectedDate(): string {
  const todayStr = getLocalDateString();
  if (todayStr >= START_DATE && todayStr <= END_DATE) {
    return todayStr;
  }
  return START_DATE;
}
