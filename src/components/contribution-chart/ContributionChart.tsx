import { ChartTooltip } from "./ChartTooltip";
import type { ContributionChartProps } from "./ContributionChart.types";
import { formatMonth, formatTooltip, formatTotal } from "./format";

// Figma 351:8638. The grid is server-rendered: one column per week, cells coloured by the
// chart-level tokens. Tablet and up show the newest 40 weeks; phones show the newest 24.

const TABLET_WEEKS = 40;
const PHONE_WEEKS = 24;

const levelBg = [
  "bg-contribution_chart-level_0-bg",
  "bg-contribution_chart-level_1-bg",
  "bg-contribution_chart-level_2-bg",
  "bg-contribution_chart-level_3-bg",
  "bg-contribution_chart-level_4-bg",
] as const;

// Cells fade in column by column on load: @starting-style (the `starting:` variant) plays once, and
// each column delays its cells by 11ms more than the one before it (DESIGN.md "Motion").
const cell =
  "box-border size-12 rounded-2 border border-contribution_chart-cell-border transition-opacity duration-300 ease-soft starting:opacity-0 motion-reduce:transition-none";
const COLUMN_DELAY_MS = 11;

export function ContributionChart({ contributions, title, className }: ContributionChartProps) {
  const weeks = contributions.weeks.slice(-TABLET_WEEKS);
  const summary = formatTotal(contributions.total);
  let lastMonth = "";

  return (
    <figure className={["flex flex-col gap-16", className].filter(Boolean).join(" ")}>
      <p className="font-rounded text-p2 font-medium text-txt-neutral-p1-active">{title}</p>
      <ChartTooltip>
        <div role="img" aria-label={summary} className="flex gap-3 overflow-clip">
          {weeks.map((week, index) => {
            const firstDay = week[0];
            const month = firstDay ? formatMonth(firstDay.date) : "";
            const showMonth = month !== lastMonth;
            lastMonth = month;
            const hiddenOnPhone = index < weeks.length - PHONE_WEEKS;
            return (
              <div
                key={firstDay?.date ?? index}
                className={`flex flex-col gap-16 ${hiddenOnPhone ? "max-tablet:hidden" : ""}`}
              >
                <span className="relative h-20 w-12 font-rounded text-p2 whitespace-nowrap text-txt-neutral-p3-active">
                  {showMonth && <span className="absolute left-0">{month}</span>}
                </span>
                <div className="flex flex-col gap-2">
                  {week.map((day) => (
                    <span
                      key={day.date}
                      data-tip={formatTooltip(day.count, day.date)}
                      style={{ transitionDelay: `${index * COLUMN_DELAY_MS}ms` }}
                      className={`${cell} ${levelBg[day.level]}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ChartTooltip>
      <figcaption className="flex items-center justify-between font-rounded text-p2 text-txt-neutral-p3-active">
        {summary}
        <span aria-hidden="true" className="flex items-center gap-8">
          Less
          <span className="flex gap-4">
            {levelBg.map((bg) => (
              <span key={bg} className={`${cell} ${bg}`} />
            ))}
          </span>
          More
        </span>
      </figcaption>
    </figure>
  );
}
