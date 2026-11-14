import { Site } from "./schema";

// Facts about Dineth (TECH_SPEC §11).
export const site: Site = Site.parse({
  name: "Dineth De Silva",
  title: "Artistic Designer & Software Engineer",
  email: "dev.dinethde@gmail.com",
  phone: "+94 70 324 2772",
  resume: "/resume.pdf",
  github: { handle: "dinethde", href: "https://github.com/dinethde" },
  twitter: { handle: "@dinethr_de", href: "https://x.com/dinethr_de", label: "Twitter" },
  linkedin: { href: "TODO" },
});
