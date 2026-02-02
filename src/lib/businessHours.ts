// Business hours configuration - single source of truth
export const BUSINESS_HOURS = {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  0: { open: "06:00", close: "14:00", label: "Sun" }, // Sunday
  1: { open: "05:30", close: "15:00", label: "Mon" }, // Monday
  2: { open: "05:30", close: "15:00", label: "Tue" }, // Tuesday
  3: { open: "05:30", close: "15:00", label: "Wed" }, // Wednesday
  4: { open: "05:30", close: "15:00", label: "Thu" }, // Thursday
  5: { open: "05:30", close: "15:00", label: "Fri" }, // Friday
  6: { open: "06:00", close: "14:00", label: "Sat" }, // Saturday
} as const;

export type DayOfWeek = keyof typeof BUSINESS_HOURS;

/**
 * Formats 24h time string to 12h format (e.g., "05:30" -> "5:30am")
 */
export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hours12 = hours % 12 || 12;
  
  if (minutes === 0) {
    return `${hours12}${period}`;
  }
  return `${hours12}:${minutes.toString().padStart(2, "0")}${period}`;
}

/**
 * Gets the hours for a specific day
 */
export function getDayHours(day: DayOfWeek) {
  return BUSINESS_HOURS[day];
}

/**
 * Gets today's business hours
 */
export function getTodayHours() {
  const today = new Date().getDay() as DayOfWeek;
  return BUSINESS_HOURS[today];
}

/**
 * Converts time string to minutes since midnight for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Gets current time as minutes since midnight
 */
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Checks if currently open and returns status info
 */
export function getBusinessStatus(): {
  isOpen: boolean;
  currentDayHours: { open: string; close: string; label: string };
  message: string;
} {
  const now = new Date();
  const today = now.getDay() as DayOfWeek;
  const currentDayHours = BUSINESS_HOURS[today];
  const currentMinutes = getCurrentMinutes();
  
  const openMinutes = timeToMinutes(currentDayHours.open);
  const closeMinutes = timeToMinutes(currentDayHours.close);
  
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  
  let message: string;
  
  if (isOpen) {
    message = `Open now until ${formatTime(currentDayHours.close)}`;
  } else if (currentMinutes < openMinutes) {
    // Before opening today
    message = `Opens today at ${formatTime(currentDayHours.open)}`;
  } else {
    // After closing, show next day's opening
    const tomorrow = ((today + 1) % 7) as DayOfWeek;
    const tomorrowHours = BUSINESS_HOURS[tomorrow];
    message = `Opens tomorrow at ${formatTime(tomorrowHours.open)}`;
  }
  
  return { isOpen, currentDayHours, message };
}

/**
 * Gets formatted hours for display in Location section
 */
export function getFormattedSchedule(): { label: string; hours: string }[] {
  return [
    {
      label: "Mon–Fri",
      hours: `${formatTime(BUSINESS_HOURS[1].open)} – ${formatTime(BUSINESS_HOURS[1].close)}`,
    },
    {
      label: "Sat–Sun",
      hours: `${formatTime(BUSINESS_HOURS[6].open)} – ${formatTime(BUSINESS_HOURS[6].close)}`,
    },
  ];
}
