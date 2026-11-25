import type { ReactNode } from "react";

/** One day of the calendar. `level` is 0 (none) to 4 (most) and picks the cell colour. */
export interface ChartDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/** The final data shape (TECH_SPEC §3), without the fetch details the chart never needs. */
export interface ChartData {
  total: number;
  weeks: ChartDay[][];
}

export interface ChartTooltipProps {
  /** The server-rendered grid. Cells expose their text in a `data-tip` attribute. */
  children: ReactNode;
}

export interface ContributionChartProps {
  /** The final data shape from `getContributions`; the chart never knows where it came from. */
  contributions: ChartData;
  /** The line above the chart. */
  title: string;
  className?: string;
}
