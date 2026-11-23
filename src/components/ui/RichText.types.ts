// The same shape as `Run` in src/content/schema.ts. Building blocks can't import content
// (ARCHITECTURE §3), so the shape is repeated here and the two match structurally.

export type RunTone = "strong" | "brand" | "secondary" | "error";
export type RunWeight = "regular" | "medium" | "semibold";

export interface RichTextRun {
  text: string;
  weight?: RunWeight;
  tone?: RunTone;
}

export interface RichTextProps {
  runs: RichTextRun[];
}
