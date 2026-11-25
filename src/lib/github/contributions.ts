import "server-only";

import fallback from "@/content/contributions.fallback.json";

import { Contributions, calendarRange, RawCalendar, toContributions } from "./map";

const ENDPOINT = "https://api.github.com/graphql";
const REVALIDATE_SECONDS = 21600;
const TIMEOUT_MS = 5000;
const STORE_URL = "http://contributions.internal/";
const STORE_TIMEOUT_MS = 1000;

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

function message(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

/** Saves the last live pull. A failed save is logged and changes nothing. */
async function save(live: Contributions): Promise<void> {
  try {
    const { source: _source, ...data } = live;
    const response = await fetch(STORE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Store responded ${response.status}`);
  } catch (error) {
    console.error("[contrib]", message(error));
  }
}

async function load(): Promise<Contributions> {
  const response = await fetch(STORE_URL, { signal: AbortSignal.timeout(STORE_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Store responded ${response.status}`);
  return Contributions.parse({ ...(await response.json()), source: "stored" });
}

/** Never throws: live, else the last saved pull, else the bundled file. Failures log `[contrib]`. */
export async function getContributions(login: string): Promise<Contributions> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");
    const now = new Date();
    const live = toContributions(await fetchCalendar(login, token, now), now);
    await save(live);
    return live;
  } catch (error) {
    console.error("[contrib]", message(error));
  }
  try {
    return await load();
  } catch (error) {
    console.error("[contrib]", message(error));
    return { ...Contributions.parse(fallback), source: "fallback" };
  }
}
