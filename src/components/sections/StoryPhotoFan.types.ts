import type { Story } from "@/content/schema";

export interface StoryPhotoFanProps {
  /** Up to five pictures, the first at the back on the right. */
  photos: Story["photos"];
}
