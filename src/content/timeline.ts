import snapshot1 from "@/assets/story/snapshot-1.jpg";
import snapshot2 from "@/assets/story/snapshot-2.jpg";
import snapshot3 from "@/assets/story/snapshot-3.jpg";
import appsStore1 from "@/assets/timeline/apps-store-1.png";
import appsStore2 from "@/assets/timeline/apps-store-2.png";
import appsStore3 from "@/assets/timeline/apps-store-3.png";
import kenhold1 from "@/assets/timeline/kenhold-1.png";
import kenhold2 from "@/assets/timeline/kenhold-2.png";
import kenhold3 from "@/assets/timeline/kenhold-3.png";
import kithulgoda1 from "@/assets/timeline/kithulgoda-1.png";
import kithulgoda2 from "@/assets/timeline/kithulgoda-2.png";
import kithulgoda3 from "@/assets/timeline/kithulgoda-3.png";
import freelancingLogo from "@/assets/timeline/logo-freelancing.png";
import iitLogo from "@/assets/timeline/logo-iit.png";
import ijseLogo from "@/assets/timeline/logo-ijse.png";
import openSourceLogo from "@/assets/timeline/logo-open-source.jpg";
import wso2Logo from "@/assets/timeline/logo-wso2.png";
import pos1 from "@/assets/timeline/pos-1.png";
import pos2 from "@/assets/timeline/pos-2.png";
import pos3 from "@/assets/timeline/pos-3.png";
import pos4 from "@/assets/timeline/pos-4.png";
import vows1 from "@/assets/timeline/vows-1.png";
import wso2Apps1 from "@/assets/timeline/wso2-apps-1.png";
import wso2Apps2 from "@/assets/timeline/wso2-apps-2.png";
import wso2Apps3 from "@/assets/timeline/wso2-apps-3.png";

import { Story } from "./schema";

// ② Story so far (copy/desktop.md). Decorative pictures have an empty alt.
export const story: Story = Story.parse({
  header: { eyebrow: "Timeline", title: "My Journey in Design & Engineering" },
  intro: {
    title: "Computer Science Student & Design Engineer",
    subtitle:
      "Building thoughtful software with an engineering mindset, obsessing over the details and the why behind great products.",
  },
  entries: [
    {
      org: "IIT",
      logo: { image: iitLogo, alt: "" },
      current: true,
      role: "BSc (Hons) Computer Science · Final Year",
      description: "Started BSc Computer Science from foundation",
      place: "COLOMBO",
      period: "2026",
      projects: [
        {
          title: "Kenhold",
          description:
            "An MCP server that gives AI coding agents the right company knowledge for each team and role. Still in the research phase.",
          thumbs: [
            { image: kenhold1, alt: "" },
            { image: kenhold2, alt: "" },
            { image: kenhold3, alt: "" },
          ],
        },
      ],
    },
    {
      org: "WSO2",
      logo: { image: wso2Logo, alt: "" },
      current: false,
      role: "Software Engineer Intern · Internal Engineering",
      description:
        "Worked with the Internal Engineering team, building and shipping tools used across the company.",
      place: "COLOMBO",
      period: "2025 - 2026",
      projects: [
        {
          title: "Company-wide internal apps",
          description: "Built a few technically heavy apps used across the whole company.",
          thumbs: [
            { image: wso2Apps1, alt: "" },
            { image: wso2Apps2, alt: "" },
            { image: wso2Apps3, alt: "" },
          ],
        },
      ],
    },
    {
      org: "Open Source",
      logo: { image: openSourceLogo, alt: "" },
      current: false,
      role: "Open-Source Contributor",
      description:
        "Contributed to open-source projects and ranked among the top 10 open-source contributors in Sri Lanka.",
      projects: [
        {
          title: "apps-store",
          description: "Open-source enterprise app catalog",
          thumbs: [
            { image: appsStore1, alt: "" },
            { image: appsStore2, alt: "" },
            { image: appsStore3, alt: "" },
          ],
        },
      ],
    },
    {
      org: "Freelancing",
      logo: { image: freelancingLogo, alt: "" },
      current: false,
      role: "Designer & Developer · Enthusiastic Studio",
      description:
        "Designed and built websites and web apps for small businesses, taking each one from the first sketch to launch.",
      place: "REMOTE",
      period: "2022 - 2024",
      projects: [
        {
          title: "Kithulgoda Travels",
          description: "Website for a travel and tour company",
          thumbs: [
            { image: kithulgoda1, alt: "" },
            { image: kithulgoda2, alt: "" },
            { image: kithulgoda3, alt: "" },
          ],
        },
        {
          title: "Vows",
          description: "Website and CMS for a wedding photography studio in Colombo",
          thumbs: [
            { image: vows1, alt: "" },
            { image: vows1, alt: "" },
            { image: vows1, alt: "" },
          ],
        },
      ],
    },
    {
      org: "IIT",
      logo: { image: iitLogo, alt: "" },
      current: false,
      role: "Started BSc Computer Science from foundation",
      description: "Started computer science foundation in IIT.",
      place: "COLOMBO",
      period: "2022",
      projects: [
        {
          title: "POS SYSTEM",
          description: "An early project worth showing",
          thumbs: [
            { image: pos1, alt: "" },
            { image: pos2, alt: "" },
            { image: pos3, alt: "" },
          ],
        },
      ],
    },
    {
      org: "IJSE",
      logo: { image: ijseLogo, alt: "" },
      current: false,
      role: "CMJD program",
      description: "Completed comprehensive master java developer program in IJSE",
      place: "COLOMBO",
      period: "2022",
      projects: [
        {
          title: "POS SYSTEM",
          description: "An early project worth showing",
          thumbs: [
            { image: pos3, alt: "" },
            { image: pos4, alt: "" },
            { image: pos1, alt: "" },
          ],
        },
      ],
    },
  ],
  signOff: {
    title: "That's the story so far. Thanks for reading.",
    subtitle: "A few snapshots from the journey.",
  },
  photos: [
    { image: snapshot1, alt: "" },
    { image: snapshot2, alt: "" },
    { image: snapshot3, alt: "" },
    { image: snapshot3, alt: "" },
    { image: snapshot3, alt: "" },
  ],
});
