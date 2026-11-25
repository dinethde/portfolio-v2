import { Site } from "./schema";

// Facts about Dineth (TECH_SPEC §11).
export const site: Site = Site.parse({
  name: "Dineth De Silva",
  title: "Artistic Designer & Software Engineer",
  description:
    "I'm a creative product designer and product engineer who builds full-stack products from end to end.",
  email: "dev.dinethde@gmail.com",
  phone: "+94 70 324 2772",
  resume: { href: "/resume.pdf", label: "Resume" },
  github: { handle: "dinethde", href: "https://github.com/dinethde", label: "GitHub" },
  twitter: { handle: "@dinethr_de", href: "https://x.com/dinethr_de", label: "Twitter" },
  linkedin: { href: "https://www.linkedin.com/in/dineth-de/", label: "LinkedIn" },
});
