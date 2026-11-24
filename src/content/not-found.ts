import { NotFound } from "./schema";

// The 404 page. Figma has no frame for it, so the words follow the page's own voice (STATE D-61).
export const notFound: NotFound = NotFound.parse({
  heading: {
    eyebrow: "404",
    title: "Nothing lives here",
    description: "The page you were looking for doesn't exist, or it moved.",
  },
  homeLabel: "Back to the home page",
});
