import { Contact } from "./schema";

// ⑤ Contact: the centred sign-off line, with its one italic serif word (copy/desktop.md).
export const contact: Contact = Contact.parse({
  line: {
    before:
      "I design what I build down to the last pixel, and engineer it to the last semicolon. If something here sparked an idea or a question, come say ",
    accent: "hiii",
    after: ".",
  },
  footer: {
    sayHi: "Say hi",
    resume: "Resume",
    twitter: "X (Twitter)",
    github: "GitHub",
    linkedin: "LinkedIn",
    email: "Email",
    mobile: "Mobile",
  },
});
