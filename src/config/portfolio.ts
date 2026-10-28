/**
 * Single source of truth for everything the site says.
 *
 * Edit this file to update the portfolio. Components only read from here.
 * Anything marked PLACEHOLDER is missing real information: fill it in, or
 * leave it empty and the UI falls back gracefully.
 *
 * Every employer, date, metric and achievement below is taken from the
 * résumé. Do not add numbers here that you cannot back up in an interview.
 */

export type ProjectKind = "professional" | "client" | "personal";
export type ProjectVisual = "escalation" | "telemetry" | "workspace" | "elevation" | "tank";

export interface Outcome {
  value: string;
  label: string;
}

export interface SignalStage {
  code: string;
  title: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  kind: ProjectKind;
  /** Shown verbatim next to the title, e.g. "Regere Consulting · own SaaS product". */
  context: string;
  role: string;
  period?: string;
  problem: string;
  contribution: string[];
  architecture: string;
  stack: string[];
  outcomes: Outcome[];
  links: { live?: string; repo?: string };
  visual: ProjectVisual;
  /** Optional left-to-right walk through the system, used by featured case studies. */
  signalPath?: SignalStage[];
}

export interface SkillGroup {
  id: string;
  title: string;
  summary: string;
  items: { name: string; usedIn?: string[] }[];
}

export interface JourneyEntry {
  period: string;
  title: string;
  org: string;
  place?: string;
  note?: string;
  points: string[];
}

export const portfolio = {
  name: "Gokulkumar K",
  monogram: "GK",
  role: "Full-Stack & Backend Engineer",
  location: "Pondicherry, India",
  coordinates: "11.94° N  79.81° E",
  /** IANA zone for the local clock in the mobile menu. */
  timeZone: "Asia/Kolkata",

  /** PLACEHOLDER: the résumé says "3+ years", the brief says ~2.6. Set the figure you will stand behind. */
  experience: "2.6 years",

  availability: {
    /** Set `open` to false to switch the indicator to a neutral state. */
    open: true,
    label: "Open to backend & full-stack roles",
    closedLabel: "Not currently looking",
  },

  hero: {
    statement: "Backend engineering, product thinking, and digital experiences built with purpose.",
  },

  story: {
    statement:
      "I don't just write code. I think about the systems, workflows, and products that code makes possible.",
    intro: [
      "I'm a full-stack engineer who is most at home on the server side. At Regere Consulting I work on the company's own SaaS product, building the workflow automation and escalation logic behind an enterprise ticketing platform.",
      "Alongside that I've built cloud infrastructure for industrial monitoring: MQTT ingestion, alarm orchestration and the AWS plumbing that keeps remote sites visible. The common thread is operational software, where the work is judged by whether it holds up at three in the morning.",
    ],
    facts: [
      { label: "Now", value: "FullStack Developer, Regere Consulting" },
      { label: "Since", value: "June 2024" },
      { label: "Based in", value: "Pondicherry, India" },
      { label: "Studied", value: "Integrated M.Sc. Computer Science, Pondicherry University" },
    ],
    mindset: [
      {
        title: "Understand the problem first",
        body: "The stack comes second. I want to know who is waiting on this, what fails today, and what a good outcome looks like before I pick a tool.",
      },
      {
        title: "Design for the next person",
        body: "Backend code is read far more than it is written. Clear boundaries, boring names, and data models that survive a change in requirements.",
      },
      {
        title: "Connect the whole path",
        body: "APIs, data, interfaces and infrastructure are one system. I work across all four so the seams between them are deliberate.",
      },
      {
        title: "Solve operational problems",
        body: "Tickets that escalate on time. Alarms that reach a person. I like software that removes a manual step from somebody's day.",
      },
      {
        title: "Ship it, then watch it",
        body: "Performance, reliability and deployment are part of the feature. If I can't observe it in production, it isn't finished.",
      },
    ],
  },

  /** Featured, in order. The first two render as full case studies; the rest as an index. */
  projects: [
    {
      id: "escalation",
      name: "Escalation Engine",
      tagline: "Workflow automation for an enterprise ticketing platform.",
      kind: "professional",
      context: "Regere Consulting · own SaaS product",
      role: "FullStack Developer",
      period: "2024 — Present",
      problem:
        "Tickets were chased by hand. When an owner missed a deadline, someone had to notice, work out who was next in line and follow up, which is exactly the kind of work that slips.",
      contribution: [
        "Architected a dynamic multi-level escalation engine that drives automated notification workflows.",
        "Designed and built the workflow automation layer with React, Node.js and backend-driven business logic.",
        "Built a drag-and-drop ticketing board with optimised state management and linked-list-based workflow ordering.",
        "Improved frontend and backend performance through optimised rendering, lazy loading and leaner APIs.",
      ],
      architecture:
        "Escalation rules live on the backend, so the board is a view of the workflow and never its source of truth. Ordering is held as a linked list, which makes a drag a pointer update instead of a re-index of the whole column.",
      stack: ["React", "Node.js"],
      outcomes: [
        { value: "80%", label: "fewer manual follow-ups" },
        { value: "40%", label: "better SLA adherence" },
        { value: "60%", label: "gain in workflow efficiency" },
      ],
      links: {},
      visual: "escalation",
    },
    {
      id: "rfam",
      name: "RFAM",
      tagline: "Remote fire alarm monitoring for mining operations in Africa.",
      kind: "client",
      context: "Client project · cloud-based IIoT",
      role: "Cloud & Backend Engineer, founding and core member",
      problem:
        "Fire alarm panels across remote mining sites were monitored through on-premise SCADA. Adding a site meant adding infrastructure, and an alarm was only useful if somebody was already watching the right screen.",
      contribution: [
        "Architected and developed a cloud-native IIoT monitoring platform on AWS, replacing the on-premise SCADA setup.",
        "Implemented secure real-time event ingestion using MQTT over TLS and Modbus.",
        "Developed backend-driven alarm orchestration and escalation workflows integrated with Twilio.",
        "Optimised AWS infrastructure and backend processing pipelines.",
        "Implemented historian-backed reporting and audit-ready logging for long-term traceability.",
      ],
      architecture:
        "Field signals are read over Modbus, published over MQTT with TLS, and ingested on AWS. The backend decides what counts as an alarm and who hears about it; a historian keeps the record for reporting and audit.",
      stack: ["AWS", "MQTT over TLS", "Modbus", "Twilio"],
      outcomes: [
        { value: "20+", label: "remote industrial sites" },
        { value: "120+", label: "operational signals, sub-second latency" },
        { value: "50%", label: "faster incident response" },
        { value: "35%", label: "lower operating cost" },
        { value: "99.5%+", label: "availability maintained" },
        { value: "3×", label: "scalability over on-premise SCADA" },
      ],
      links: {},
      visual: "telemetry",
      signalPath: [
        { code: "01", title: "Field", detail: "Fire alarm panels at remote sites expose their state as Modbus registers." },
        { code: "02", title: "Ingest", detail: "Signals are published over MQTT with TLS, so nothing travels in the clear." },
        { code: "03", title: "Cloud", detail: "AWS replaces the on-premise SCADA servers. A new site is configuration, not hardware." },
        { code: "04", title: "Decide", detail: "Backend rules turn raw signals into alarms and choose the escalation path." },
        { code: "05", title: "Notify", detail: "Twilio carries the alarm to a person, then to the next person if nobody responds." },
        { code: "06", title: "Record", detail: "A historian keeps every event for reporting, analytics and audit." },
      ],
    },
    {
      id: "orchestrator",
      name: "I&R Orchestrator",
      tagline: "A workspace management system that keeps several departments under one roof.",
      kind: "personal",
      context: "Personal project",
      role: "Design and build",
      period: "Feb — Aug 2026",
      problem:
        "Workspace operators run the floor plan, incidents, billing and sales in separate tools that don't know about each other.",
      contribution: [
        "Combined spatial layout, operations, finance and CRM into a single multi-department workflow system.",
      ],
      architecture:
        "Four modules over one data model: Workspace Map, Incidents & Automations, Finance (invoices, ledger, credits) and CRM (deals and pipeline).",
      stack: [], // PLACEHOLDER: the résumé does not list the stack for this project.
      outcomes: [],
      links: { live: "https://cove.thakali.garden/" },
      visual: "workspace",
    },
    {
      id: "sd-builders",
      name: "SD Builders",
      tagline: "A web portal for a construction manager's housing portfolio.",
      kind: "personal",
      context: "Personal project · commercial real estate",
      role: "Design and build",
      period: "Apr — Jun 2025",
      problem:
        "A construction manager needed one place to present multi-family, affordable and commercial housing projects to prospective clients.",
      contribution: ["Developed a responsive web portal showcasing the full project portfolio."],
      architecture: "A responsive, content-led site for browsing the portfolio by housing type.",
      stack: ["Responsive UI"], // PLACEHOLDER: add the framework and hosting you used.
      outcomes: [],
      links: { live: "https://sd-builders.web.app/" },
      visual: "elevation",
    },
    {
      id: "tank",
      name: "Tank Telemetry",
      tagline: "Real-time fertiliser tank monitoring and automation.",
      kind: "personal",
      context: "Personal project",
      role: "Design and build",
      period: "Jun — Jul 2024",
      problem:
        "Fertiliser tanks need continuous level monitoring, with alarms that fire before a level becomes a problem instead of after.",
      contribution: [
        "Built an automated telemetry system using Python and MQTT for data ingestion.",
        "Implemented a four-stage alarm system driven by live sensor data.",
        "Designed SQL-based logging for continuous operational reporting.",
      ],
      architecture: "Sensors publish over MQTT, a Python service ingests and evaluates four alarm stages, MySQL keeps the history.",
      stack: ["Python", "MQTT", "MySQL"],
      outcomes: [],
      links: {},
      visual: "tank",
    },
  ] as Project[],

  /**
   * Smaller builds, shown as a plain list under the featured work.
   * PLACEHOLDER: "Visit Pondy" was mentioned in the brief but is not on the
   * résumé. Add it here once you have a description and a link, e.g.
   * { name: "Visit Pondy", note: "Tourism web application for Pondicherry.", stack: ["Next.js"], link: "https://…" }
   */
  experiments: [
    {
      name: "Automated patient scheduler",
      note: "Smart India Hackathon. Schedules patients against doctor availability; cut waiting time to 10 minutes.",
      stack: ["Backend logic"],
      link: "",
    },
    {
      name: "SQL injection prevention",
      note: "A secure PostgreSQL data layer in Python built on parameterised queries and input validation.",
      stack: ["Python", "PostgreSQL"],
      link: "",
    },
  ],

  /** Only list what you can discuss and demonstrate. `usedIn` takes project ids. */
  skills: [
    {
      id: "backend",
      title: "Backend",
      summary: "Where most of my time goes: services, business rules and the APIs in front of them.",
      items: [
        { name: "Node.js", usedIn: ["escalation"] },
        { name: "JavaScript", usedIn: ["escalation"] },
        { name: "REST APIs", usedIn: ["escalation"] },
        { name: "Python", usedIn: ["tank"] },
        { name: "Flask" },
        { name: "Java" },
        { name: "Spring Boot" },
      ],
    },
    {
      id: "frontend",
      title: "Frontend",
      summary: "Interfaces that stay fast when the data behind them gets heavy.",
      items: [
        { name: "React", usedIn: ["escalation"] },
        { name: "Next.js" },
        { name: "TypeScript" },
        { name: "Tailwind CSS" },
        { name: "Responsive UI", usedIn: ["sd-builders"] },
      ],
    },
    {
      id: "data",
      title: "Data",
      summary: "Schemas first. Then the queries, and the indexes those queries need.",
      items: [
        { name: "PostgreSQL" },
        { name: "MySQL", usedIn: ["tank"] },
        { name: "MongoDB" },
        { name: "Database design" },
        { name: "Query optimisation & indexing" },
      ],
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      summary: "Getting it running, keeping it running, and knowing when it isn't.",
      items: [
        { name: "AWS", usedIn: ["rfam"] },
        { name: "MQTT", usedIn: ["rfam", "tank"] },
        { name: "Docker" },
        { name: "Terraform" },
        { name: "Linux & shell" },
        { name: "GitHub Actions CI/CD" },
      ],
    },
    {
      id: "engineering",
      title: "Engineering",
      summary: "The habits underneath the tools.",
      items: [
        { name: "API integration", usedIn: ["rfam"] },
        { name: "System design fundamentals" },
        { name: "Performance optimisation", usedIn: ["escalation", "rfam"] },
        { name: "Debugging" },
        { name: "Testing" },
      ],
    },
  ] as SkillGroup[],

  buildLog: [
    { title: "Understand the problem", body: "Talk to whoever lives with it. Write down what done means before writing anything else." },
    { title: "Design the architecture", body: "Sketch the data model and the boundaries. Decide what is allowed to know about what." },
    { title: "Build the smallest reliable thing", body: "One path, end to end, that works every time. Breadth comes after." },
    { title: "Measure", body: "Find the slow query and the heavy render with numbers, then fix those two." },
    { title: "Test the failures", body: "Timeouts, retries, duplicates, bad input. The unhappy path is most of the path." },
    { title: "Deploy and improve", body: "Ship behind something observable. Read the logs. Go round again." },
  ],

  journey: [
    {
      period: "Jun 2024 — Present",
      title: "FullStack Developer",
      org: "Regere Consulting Pvt. Ltd.",
      place: "Chennai, India",
      note: "Own SaaS product",
      points: [
        "Workflow automation and a multi-level escalation engine for an enterprise ticketing platform.",
        "Drag-and-drop ticketing built on linked-list workflow ordering.",
        "Agile delivery with cross-functional teams: system design, testing, deployment and production support.",
      ],
    },
    {
      period: "Client engagement",
      title: "Cloud & Backend Engineer",
      org: "RFAM, remote fire alarm monitoring",
      place: "Mining operations, Africa",
      note: "Founding and core member",
      points: [
        "Cloud-native IIoT monitoring on AWS for 20+ remote industrial sites.",
        "MQTT over TLS and Modbus ingestion, alarm orchestration with Twilio.",
        "Historian-backed reporting and audit-ready logging.",
      ],
    },
    {
      period: "2019 — 2024",
      title: "Integrated M.Sc. Computer Science",
      org: "Pondicherry University",
      place: "Puducherry, India",
      points: [
        "Head of the design committee for Recursion '24 and coordinator for several technical events.",
        "Placement coordinator.",
      ],
    },
  ] as JourneyEntry[],

  recognition: [
    { title: "Winner, Clash of Code", where: "Puducherry Technological University" },
    { title: "Runner-up, Robo Soccer", where: "Gyanith '23, NIT Karaikal" },
  ],

  contact: {
    statement:
      "I'm always interested in building useful products, solving engineering challenges, and working with people who care about quality.",
    email: "gokulkumarpy@gmail.com",
    linkedin: "https://www.linkedin.com/in/kgokulkumar/",
    github: "https://github.com/GokulDG",
    leetcode: "https://leetcode.com/u/gokulkumarpy/",
    /**
     * PLACEHOLDER: drop the PDF into /public and set this to "/resume.pdf".
     * While empty, the Resume link opens a pre-filled email asking for it.
     */
    resumeUrl: "",
  },

  siteUrl: "https://example.com", // PLACEHOLDER: production URL, used for metadata.
};

export type Portfolio = typeof portfolio;

export const projectById = (id: string) => portfolio.projects.find((p) => p.id === id);
