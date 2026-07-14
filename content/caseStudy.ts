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
  { id: "loop", label: "Loop" },
  { id: "matrix", label: "Matrix" },
  { id: "decisions", label: "Decisions" },
  { id: "judgment", label: "Judgment" },
  { id: "testing", label: "Testing" }
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
  "Moderated usability test (3 proxy participants)",
  "Accessibility review",
  "Final product recommendation"
];

/**
 * Usability testing evidence.
 *
 * CLAIM GOVERNANCE — these findings are conditionally usable only.
 * Every citation of a number below MUST carry all four qualifiers:
 *   n=3 · proxy participants (classmates) · low-fidelity prototype · indicative, not conclusive
 * These are NOT real PeopleGrove production users and NOT field-performance evidence.
 * Do not convert into product performance, business outcomes, production validation,
 * statistical significance, or PeopleGrove implementation outcomes.
 */
export const usabilityTest = {
  method:
    "Moderated, task-based think-aloud usability test on the low-fidelity prototype, mobile frame.",
  participants:
    "Three proxy participants — classmates acting as stand-in WGU students. Not real PeopleGrove platform users.",
  results: [
    { metric: "Tasks completed unaided", value: "8 of 9" },
    { metric: "Average ease (SEQ, 1–7)", value: "6.0" },
    { metric: "Average confidence (1–5)", value: "4.3" }
  ],
  friction:
    "Two label wordings and filter discoverability surfaced as the most common friction points.",
  limitation:
    "Indicative, not conclusive. With three proxy participants on a low-fidelity prototype, these results signal direction — they are not evidence of field performance, product impact, or real-user behavior at scale."
} as const;

export const snapshot = [
  {
    title: "Role",
    body: "UX design internship — sole designer and frontend builder"
  },
  {
    title: "Project Type",
    body: "UX design internship completed through WGU's Applied Learning Capstone (D657); PeopleGrove as employer partner"
  },
  { title: "Focus", body: "Opportunity discovery, filtering, saving, and tracking" },
  {
    title: "Tools",
    body: "Figma, FigJam, UX research methods, prototyping, accessibility review"
  }
] as const;

/**
 * The opportunity loop: the four-stage decision-support framing that ties the
 * seven prototype screens into one continuous journey rather than isolated views.
 */
export type LoopStage = {
  index: number;
  label: string;
  /** The question the student is asking at this point in the journey. */
  question: string;
  /** The design rationale that answers it. */
  decision: string;
  /** Prototype screens that carry this stage (names match the seven screens above). */
  screens: string[];
};

export const opportunityLoop: LoopStage[] = [
  {
    index: 1,
    label: "Discover",
    question: "What is worth my attention?",
    decision: "Prioritize relevant opportunities over raw volume.",
    screens: ["Dashboard", "Search"]
  },
  {
    index: 2,
    label: "Narrow",
    question: "How do I reduce the list without losing good options?",
    decision: "Use interest-matched signals, filters, and saved states.",
    screens: ["Search", "Filter", "Interests"]
  },
  {
    index: 3,
    label: "Evaluate",
    question: "Is this worth applying to?",
    decision:
      "Make requirements, deadlines, format, and fit easier to compare.",
    screens: ["Detail"]
  },
  {
    index: 4,
    label: "Track",
    question: "What did I save, and what needs action?",
    decision:
      "Turn saved opportunities into a return path, not a dead-end bookmark.",
    screens: ["Save", "Tracker"]
  }
];

/**
 * Screen responsibility matrix: a recruiter-scannable mapping of each prototype
 * screen to the job it does, the decision it supports, and the friction it removes.
 */
export type ScreenResponsibility = {
  screen: string;
  job: string;
  decision: string;
  risk: string;
};

export const screenResponsibilities: ScreenResponsibility[] = [
  {
    screen: "Dashboard",
    job: "Resume progress",
    decision: "Where should I focus today?",
    risk: "Reduces restart friction"
  },
  {
    screen: "Search",
    job: "Explore options",
    decision: "Which opportunities match my goals?",
    risk: "Reduces discovery overload"
  },
  {
    screen: "Filter",
    job: "Narrow the set",
    decision: "Which of these actually fit?",
    risk: "Reduces irrelevant noise"
  },
  {
    screen: "Detail",
    job: "Evaluate fit",
    decision: "Should I apply?",
    risk: "Reduces ambiguity"
  },
  {
    screen: "Save",
    job: "Capture with intent",
    decision: "How do I keep this for later?",
    risk: "Reduces loss of good options"
  },
  {
    screen: "Tracker",
    job: "Maintain continuity",
    decision: "What needs follow-up?",
    risk: "Reduces drop-off"
  },
  {
    screen: "Interests",
    job: "Tune relevance",
    decision: "How do I see better next time?",
    risk: "Reduces repeat-search effort"
  }
];

/** Design judgment: a mature read on the trade-offs behind the prototype. */
export type Judgment = {
  label: string;
  body: string;
};

export const designJudgment: Judgment[] = [
  {
    label: "What I prioritized",
    body: "Continuity, decision clarity, and low-friction return paths — so each screen hands the student to the next decision instead of ending the flow."
  },
  {
    label: "What I intentionally avoided",
    body: "A generic job-board pattern that treats every opportunity as equal. The framing leans on relevance and follow-through rather than raw listing volume."
  },
  {
    label: "What I would test next",
    body: "Whether students can resume from saved opportunities and understand their next action without re-searching — a proposed concept-validation test, not a measured result."
  }
];
