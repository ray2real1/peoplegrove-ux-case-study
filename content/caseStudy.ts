export const links = {
  pdf: "/docs/peoplegrove-case-study-approved.pdf",
  figma: "https://www.figma.com/design/M8CY4YwAi40Hz8pAWr2oEP",
  linkedin: "https://www.linkedin.com/in/raymond-merrill-ii-122983388",
  contact: "mailto:ray2real1@gmail.com"
} as const;

export type NavItem = { id: string; label: string };

export const nav: NavItem[] = [
  { id: "problem", label: "Problem" },
  { id: "thesis", label: "Thesis" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "prototype", label: "Prototype" },
  { id: "decisions", label: "Decisions" },
  { id: "deliverables", label: "Deliverables" }
];

export type Screen = {
  step: number;
  label: string;
  src: string;
  alt: string;
  /** The decision the student is making at this stage of the journey. */
  decision: string;
};

export const screens: Screen[] = [
  {
    step: 1,
    label: "Dashboard",
    src: "/images/peoplegrove-dashboard.png",
    alt: "PeopleGrove prototype dashboard showing recommended opportunities and next actions.",
    decision: "Where do I start?"
  },
  {
    step: 2,
    label: "Search",
    src: "/images/peoplegrove-search.png",
    alt: "PeopleGrove prototype search feed with filters and opportunity cards.",
    decision: "What is out there?"
  },
  {
    step: 3,
    label: "Filter",
    src: "/images/peoplegrove-filter.png",
    alt: "PeopleGrove prototype filter bottom sheet with applied criteria.",
    decision: "Which of these fit me?"
  },
  {
    step: 4,
    label: "Detail",
    src: "/images/peoplegrove-detail.png",
    alt: "PeopleGrove prototype opportunity detail page with deadline, dates, location, and action paths.",
    decision: "Is this one worth it?"
  },
  {
    step: 5,
    label: "Save",
    src: "/images/peoplegrove-save.png",
    alt: "PeopleGrove prototype save confirmation state pointing toward the tracker.",
    decision: "How do I keep this?"
  },
  {
    step: 6,
    label: "Tracker",
    src: "/images/peoplegrove-tracker.png",
    alt: "PeopleGrove prototype tracker showing saved opportunities and status cues.",
    decision: "What happens next?"
  },
  {
    step: 7,
    label: "Interests",
    src: "/images/peoplegrove-interests.png",
    alt: "PeopleGrove prototype interests configuration screen for personalization preferences.",
    decision: "How do I see better next time?"
  }
];

export type Decision = {
  title: string;
  body: string;
  stage: string;
};

export const decisions: Decision[] = [
  {
    title: "Guided discovery",
    stage: "Dashboard",
    body: "The dashboard is designed to reduce blank-search friction by surfacing a clearer starting point before manual browsing."
  },
  {
    title: "Filterable opportunity overload",
    stage: "Search & Filter",
    body: "Search and filtering are proposed as a way to turn a broad opportunity pool into a more manageable decision set."
  },
  {
    title: "Evaluation before action",
    stage: "Detail",
    body: "Detail pages foreground deadline, dates, location, and action paths so students can assess fit before committing."
  },
  {
    title: "Confirmation with continuity",
    stage: "Save",
    body: "The save state gives feedback and points users toward the tracker instead of treating saving as a passive end state."
  },
  {
    title: "Saved items as a pipeline",
    stage: "Tracker",
    body: "The tracker reframes saved opportunities as items with status and next-step visibility."
  },
  {
    title: "Personalization loop",
    stage: "Interests",
    body: "Interests are positioned as a way to tune recommendations and support more relevant future discovery."
  }
];

export const problems: string[] = [
  "Opportunity overload",
  "Weak relevance signals",
  "Unclear next steps after saving",
  "Search and filter friction",
  "Limited visible status",
  "Mobile-first usability demands"
];

export const accessibilityPoints: string[] = [
  "Readable hierarchy",
  "Strong contrast",
  "Visible focus states",
  "Clear labels",
  "Non-color-only status cues",
  "Reduced cognitive load"
];

export const deliverables: string[] = [
  "7-screen clickable prototype",
  "Case study PDF",
  "Annotated screens",
  "Lifecycle flow",
  "Accessibility review",
  "Final product recommendation"
];

export const snapshot = [
  { title: "Role", body: "UX Design Intern" },
  { title: "Project Type", body: "UX Internship Case Study" },
  { title: "Focus", body: "Opportunity discovery, filtering, saving, and tracking" },
  {
    title: "Tools",
    body: "Figma, FigJam, UX research methods, prototyping, accessibility review"
  }
] as const;
