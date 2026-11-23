import type { ChartData } from "@/components/contribution-chart/ContributionChart.types";
import type { Intro, Site } from "@/content/schema";

export interface IntroSectionProps {
  /** The calendar data; the page passes it from `getContributions`. */
  contributions: ChartData;
  /** Defaults to the Intro copy in src/content/intro.ts; the lab passes its own. */
  content?: Intro;
  /** Defaults to the facts in src/content/site.ts. */
  site?: Site;
}
