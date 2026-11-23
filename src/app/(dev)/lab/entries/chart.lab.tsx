import { ContributionChart } from "@/components/contribution-chart/ContributionChart";

import { sampleContributions } from "../fixtures";

// Figma 351:8638: the chart. At 390 wide it shows 24 weeks; hover a cell for the tooltip.

export const title = "Contribution chart";

export function Lab() {
  return (
    <div className="flex max-w-600 flex-col gap-24">
      <ContributionChart
        title="My Contribution to the Tech and Designs"
        contributions={sampleContributions}
      />
    </div>
  );
}
