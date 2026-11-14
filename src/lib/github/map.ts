export type Level = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: Level;
}

export interface Contributions {
  total: number;
  weeks: ContributionDay[][];
  fetchedAt: string;
  source: "live" | "fallback";
}

export interface RawCalendar {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            date: string;
            contributionCount: number;
            contributionLevel: string;
          }[];
        }[];
      };
    };
  } | null;
}

export const WEEKS = 52;
const DAY_MS = 86_400_000;

const LEVELS: Record<string, Level> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/** `from` is now minus 52 weeks, moved back to that Sunday (UTC). `to` is now. */
export function calendarRange(now: Date): { from: string; to: string } {
  const back = new Date(now.getTime() - WEEKS * 7 * DAY_MS);
  back.setUTCHours(0, 0, 0, 0);
  back.setUTCDate(back.getUTCDate() - back.getUTCDay());
  return { from: back.toISOString(), to: now.toISOString() };
}

export function toLevel(raw: string): Level {
  const level = LEVELS[raw];
  if (level === undefined) throw new Error(`Unknown contribution level: ${raw}`);
  return level;
}

/** Pure: turns the GraphQL response into the shape the chart takes, newest week last. */
export function toContributions(raw: RawCalendar, now: Date): Contributions {
  const calendar = raw.user?.contributionsCollection.contributionCalendar;
  if (!calendar) throw new Error("GitHub returned no user");

  const weeks = calendar.weeks
    .map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: toLevel(day.contributionLevel),
      })),
    )
    .filter((week) => week.length > 0)
    .slice(-WEEKS);

  const total = weeks.reduce((sum, week) => sum + week.reduce((n, day) => n + day.count, 0), 0);
  return { total, weeks, fetchedAt: now.toISOString(), source: "live" };
}
