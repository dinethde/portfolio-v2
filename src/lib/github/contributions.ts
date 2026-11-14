import "server-only";

import fallback from "@/content/contributions.fallback.json";

import { Contributions, calendarRange, RawCalendar, toContributions } from "./map";

const ENDPOINT = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 21600;
const TIMEOUT_MS = 5000;

const QUERY = `query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

export async function fetchCalendar(login: string, token: string, now: Date): Promise<RawCalendar> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login, ...calendarRange(now) } }),
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  const body = (await response.json()) as { data?: unknown; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) {
    throw new Error(body.errors?.map((e) => e.message).join("; ") ?? "GitHub returned no data");
  }
  return RawCalendar.parse(body.data);
}

/** Never throws: any failure returns the fallback file and logs `[contrib]`. */
export async function getContributions(login: string): Promise<Contributions> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");
    const now = new Date();
    return toContributions(await fetchCalendar(login, token, now), now);
  } catch (error) {
    console.error("[contrib]", error instanceof Error ? error.message : "unknown error");
    return { ...Contributions.parse(fallback), source: "fallback" };
  }
}
