// The chart's strings (TECH_SPEC §3 "Display rules"). Figma 351:8638 words the total as
// "… in the last year", which wins over the spec's "in <year>".

const dayMonth = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const shortMonth = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** "1,284 contributions in the last year". */
export function formatTotal(total: number): string {
  const noun = total === 1 ? "contribution" : "contributions";
  return `${total.toLocaleString("en-US")} ${noun} in the last year`;
}

/** "4 contributions on 12 March", "1 contribution on 3 May", "No contributions on 9 June". */
export function formatTooltip(count: number, date: string): string {
  const day = dayMonth.format(parseDate(date));
  if (count === 0) return `No contributions on ${day}`;
  const noun = count === 1 ? "contribution" : "contributions";
  return `${count.toLocaleString("en-US")} ${noun} on ${day}`;
}

/** The short month name for a column label, such as "Nov". */
export function formatMonth(date: string): string {
  return shortMonth.format(parseDate(date));
}
