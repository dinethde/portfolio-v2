// Sample data for lab entries. Components get everything through props, so these stand in for
// src/content/ and the GitHub data. Shapes follow TECH_SPEC §3 and §11; keep them deterministic so
// screenshots don't change between runs.

export const sampleText = {
  short: "Artistic Designer & Software Engineer",
  sentence: "I design and build quiet, careful interfaces for people who use them every day.",
  long: "I started out drawing type on the back of school books. Now I design systems and write the code that ships them, and I still care most about the small details that nobody notices until they're missing.",
} as const;

export const sampleLinks = {
  internal: "#story",
  external: "https://github.com/dinethde",
} as const;

type Level = 0 | 1 | 2 | 3 | 4;

interface ContributionDay {
  date: string;
  count: number;
  level: Level;
}

const DAY_MS = 86_400_000;
// A Sunday, so every week starts on the same weekday as GitHub's calendar.
const FIRST_DAY = Date.UTC(2025, 10, 16);

function levelFor(count: number): Level {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
}

function buildWeeks(weekCount: number): ContributionDay[][] {
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const index = week * 7 + day;
      // A fixed pattern with quiet weekends and busier stretches.
      const count = day === 0 || day === 6 ? index % 3 : (index * 7) % 13;
      return {
        date: new Date(FIRST_DAY + index * DAY_MS).toISOString().slice(0, 10),
        count,
        level: levelFor(count),
      };
    }),
  );
}

const weeks = buildWeeks(52);

export const sampleContributions = {
  total: weeks.flat().reduce((sum, day) => sum + day.count, 0),
  weeks,
  fetchedAt: "2026-11-14T00:00:00.000Z",
  source: "fallback" as const,
};
