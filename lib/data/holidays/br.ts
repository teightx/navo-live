/**
 * Brazilian Holidays Dataset
 *
 * Provides upcoming holidays with suggested travel windows.
 * Focuses on major holidays that drive travel demand.
 */

// ============================================================================
// Types
// ============================================================================

export interface Holiday {
  /** Unique key for the holiday (e.g., "carnaval-2025") */
  key: string;
  /** Display name in Portuguese */
  name: string;
  /** The actual holiday date (YYYY-MM-DD) */
  date: string;
  /** Day of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek: number;
  /** Whether this holiday typically creates a long weekend (ponte) */
  hasBridge: boolean;
  /** Suggested trip duration in days */
  suggestedDays: number;
  /** Tags for destination matching */
  tags: ("praia" | "frio" | "cidade" | "curto" | "medio" | "longo" | "internacional")[];
}

export interface HolidayWindow {
  /** Unique key for the holiday */
  key: string;
  /** Display name */
  name: string;
  /** Suggested departure date (YYYY-MM-DD) */
  startDate: string;
  /** Suggested return date (YYYY-MM-DD) */
  endDate: string;
  /** Number of days for the trip */
  days: number;
  /** Tags for destination matching */
  tags: Holiday["tags"];
}

// ============================================================================
// Holiday Data (2025-2026)
// ============================================================================

/**
 * Major Brazilian holidays that drive travel demand.
 * Updated annually - add new years as needed.
 */
const HOLIDAYS_2025: Holiday[] = [
  // Férias de Verão - janela flexível
  {
    key: "verao-2026",
    name: "Férias de Verão",
    date: "2026-01-15", // Meio de janeiro
    dayOfWeek: 4,
    hasBridge: false,
    suggestedDays: 7,
    tags: ["praia", "cidade", "medio", "internacional"],
  },
  {
    key: "carnaval-2025",
    name: "Carnaval",
    date: "2025-03-04", // Terça-feira de Carnaval
    dayOfWeek: 2,
    hasBridge: true,
    suggestedDays: 5,
    tags: ["praia", "cidade", "curto"],
  },
  {
    key: "pascoa-2025",
    name: "Páscoa",
    date: "2025-04-20", // Domingo de Páscoa
    dayOfWeek: 0,
    hasBridge: true,
    suggestedDays: 4,
    tags: ["praia", "curto"],
  },
  {
    key: "tiradentes-2025",
    name: "Tiradentes",
    date: "2025-04-21", // Segunda
    dayOfWeek: 1,
    hasBridge: true,
    suggestedDays: 4,
    tags: ["frio", "cidade", "curto"],
  },
  {
    key: "trabalho-2025",
    name: "Dia do Trabalho",
    date: "2025-05-01", // Quinta
    dayOfWeek: 4,
    hasBridge: true,
    suggestedDays: 4,
    tags: ["praia", "cidade", "curto"],
  },
  {
    key: "corpus-christi-2025",
    name: "Corpus Christi",
    date: "2025-06-19", // Quinta
    dayOfWeek: 4,
    hasBridge: true,
    suggestedDays: 4,
    tags: ["frio", "cidade", "curto"],
  },
  {
    key: "independencia-2025",
    name: "Independência",
    date: "2025-09-07", // Domingo
    dayOfWeek: 0,
    hasBridge: false,
    suggestedDays: 3,
    tags: ["praia", "curto"],
  },
  {
    key: "nossa-senhora-2025",
    name: "Nossa Senhora Aparecida",
    date: "2025-10-12", // Domingo
    dayOfWeek: 0,
    hasBridge: false,
    suggestedDays: 3,
    tags: ["praia", "cidade", "curto"],
  },
  {
    key: "finados-2025",
    name: "Finados",
    date: "2025-11-02", // Domingo
    dayOfWeek: 0,
    hasBridge: false,
    suggestedDays: 3,
    tags: ["cidade", "curto"],
  },
  {
    key: "proclamacao-2025",
    name: "Proclamação da República",
    date: "2025-11-15", // Sábado
    dayOfWeek: 6,
    hasBridge: false,
    suggestedDays: 3,
    tags: ["praia", "curto"],
  },
  {
    key: "natal-2025",
    name: "Natal",
    date: "2025-12-25", // Quinta
    dayOfWeek: 4,
    hasBridge: true,
    suggestedDays: 7,
    tags: ["praia", "frio", "cidade", "medio", "internacional"],
  },
  {
    key: "reveillon-2026",
    name: "Réveillon",
    date: "2026-01-01", // Quinta
    dayOfWeek: 4,
    hasBridge: true,
    suggestedDays: 7,
    tags: ["praia", "cidade", "medio", "internacional"],
  },
  {
    key: "carnaval-2026",
    name: "Carnaval",
    date: "2026-02-17", // Terça-feira de Carnaval
    dayOfWeek: 2,
    hasBridge: true,
    suggestedDays: 5,
    tags: ["praia", "cidade", "curto"],
  },
];

// ============================================================================
// Functions
// ============================================================================

/**
 * Get all holidays sorted by date
 */
function getAllHolidays(): Holiday[] {
  return [...HOLIDAYS_2025].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Calculate suggested travel window for a holiday
 */
function calculateWindow(holiday: Holiday): HolidayWindow {
  const holidayDate = new Date(holiday.date + "T12:00:00");
  const dayOfWeek = holidayDate.getDay();

  let startDate: Date;
  let endDate: Date;

  // Calculate start date based on day of week and bridge potential
  if (holiday.hasBridge) {
    // For holidays with bridge potential
    if (dayOfWeek === 4) {
      // Thursday: leave Wednesday or Thursday, return Monday
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 1); // Wednesday
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 4); // Monday
    } else if (dayOfWeek === 2) {
      // Tuesday: leave Friday before, return Wednesday
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 4); // Friday before
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 1); // Wednesday
    } else if (dayOfWeek === 1) {
      // Monday: leave Friday, return Tuesday
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 3); // Friday
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 1); // Tuesday
    } else {
      // Default: leave Friday before, return based on duration
      startDate = new Date(holidayDate);
      const daysToFriday = (dayOfWeek + 2) % 7;
      startDate.setDate(startDate.getDate() - daysToFriday);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + holiday.suggestedDays);
    }
  } else {
    // No bridge: simple weekend extension
    startDate = new Date(holidayDate);
    const daysToFriday = dayOfWeek === 0 ? 2 : (dayOfWeek + 2) % 7;
    startDate.setDate(startDate.getDate() - daysToFriday);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + holiday.suggestedDays);
  }

  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    key: holiday.key,
    name: holiday.name,
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    days,
    tags: holiday.tags,
  };
}

/**
 * Get next upcoming holiday windows
 *
 * @param now - Current date (defaults to now)
 * @param limit - Maximum number of windows to return (default: 3)
 * @returns Array of upcoming holiday windows
 */
export function getNextHolidayWindows(
  now: Date = new Date(),
  limit: number = 3
): HolidayWindow[] {
  const holidays = getAllHolidays();
  const nowTime = now.getTime();

  // Filter to future holidays (at least 3 days from now for booking time)
  const minBookingDays = 3;
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() + minBookingDays);

  const futureHolidays = holidays.filter(
    (h) => new Date(h.date).getTime() >= minDate.getTime()
  );

  // Calculate windows and return limited results
  return futureHolidays.slice(0, limit).map(calculateWindow);
}

/**
 * Get a specific holiday window by key
 */
export function getHolidayWindowByKey(key: string): HolidayWindow | null {
  const holidays = getAllHolidays();
  const holiday = holidays.find((h) => h.key === key);

  if (!holiday) return null;

  return calculateWindow(holiday);
}

