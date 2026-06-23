import { CTAButton } from "@/components/CTAButton";
import { DecisionCard } from "@/components/DecisionCard";
import { LifecycleFlow } from "@/components/LifecycleFlow";
import { OpportunityLoop } from "@/components/OpportunityLoop";
import { Pill } from "@/components/Pill";
import { ProjectCard } from "@/components/ProjectCard";
import { ScreenFrame } from "@/components/ScreenFrame";
import { ScreenResponsibilityMatrix } from "@/components/ScreenResponsibilityMatrix";
import { ScreenShowcase } from "@/components/ScreenShowcase";
import { Section } from "@/components/Section";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-0.5 h-4 w-4 flex-none text-mint"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}
import {
  accessibilityPoints,
  decisions,
  deliverables,
  designJudgment,
  links,
  problems,
  screens,
  snapshot
} from "@/content/caseStudy";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top" className="scroll-mt-24 overflow-hidden">
        <section className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-10 lg:py-28">
          <div
            aria-hidden="true"
            className="absolute left-[18%] top-10 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-sky/12 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute right-0 top-40 -z-10 h-80 w-80 rounded-full bg-mint/[0.07] blur-3xl"
          />
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap gap-2">
              <Pill tone="blue">UX Internship Case Study</Pill>
              <Pill>Opportunity lifecycle prototype</Pill>
            </div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.5rem]">
              Opportunity discovery as a{" "}
              <span className="text-sky">decision-support journey</span>
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-ice/85 sm:text-xl">
              A UX internship case study that reframes opportunity discovery as a
              continuous journey rather than a one-time search event — helping
              students find relevant opportunities, narrow results, save with
              confidence, and return with a clear next step.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ice/70">
              Designed as a 7-screen clickable prototype connecting dashboard
              recommendations, search filtering, opportunity detail review, save
              confirmation, saved-opportunity tracking, and interest-based
              personalization.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href={links.pdf}>View Case Study PDF</CTAButton>
              <CTAButton href={links.figma} variant="secondary" external>
                View Figma Prototype
              </CTAButton>
              <CTAButton href={links.linkedin} variant="ghost" external>
                Connect on LinkedIn
              </CTAButton>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-7">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ice/50">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  UX Design Intern
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ice/50">
                  Scope
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  7-screen prototype &amp; case study
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ice/50">
                  Focus
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  Discover · narrow · evaluate · track
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto grid w-full min-w-0 max-w-[560px] grid-cols-2 items-end gap-5 sm:gap-6">
            <ScreenFrame
              src="/images/peoplegrove-dashboard.png"
              alt="PeopleGrove prototype dashboard screen showing recommended opportunities and next actions."
              label="Dashboard"
              priority
              className="translate-y-6"
            />
            <ScreenFrame
              src="/images/peoplegrove-search.png"
              alt="PeopleGrove prototype search screen with filters and opportunity cards."
              label="Search"
              priority
              className="-translate-y-6"
            />
          </div>
        </section>

        <Section
          eyebrow="Project Snapshot"
          title="A focused prototype for opportunity discovery and follow-through"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {snapshot.map((item) => (
              <ProjectCard key={item.title} title={item.title}>
                {item.body}
              </ProjectCard>
            ))}
          </div>
        </Section>

        <Section
          id="problem"
          eyebrow="Problem"
          title="Students do not just need more opportunities. They need clearer ways to act on the right ones."
          intro="The prototype responds to observed friction around overload, relevance, saving, and status visibility — without claiming shipped outcomes or measured product impact."
        >
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((item, index) => (
              <li
                key={item}
                className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/10 bg-ink/40 text-sm font-semibold text-ice/60 transition group-hover:text-sky">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-semibold leading-snug text-white">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="thesis"
          eyebrow="Core Thesis"
          title="Opportunity discovery works best as a continuous decision-support journey, not a one-time search event."
          intro="A single search returns a list. A journey supports the decisions that come before and after it — what to look at, what fits, what is worth pursuing, and what to do next."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ice/60">
                One-time search
              </p>
              <p className="mt-4 text-lg leading-7 text-ice/75">
                A query returns a flat list. The student is left to judge
                relevance, remember candidates, and track follow-up entirely on
                their own.
              </p>
            </div>
            <div className="rounded-[2rem] border border-sky/25 bg-sky/10 p-7 shadow-glow lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky">
                Decision-support journey
              </p>
              <p className="mt-4 text-lg leading-7 text-ice/85">
                The experience connects relevance signals, filters, saved items,
                and tracking so each step answers the question the student is
                actually asking at that moment — and carries them to the next
                one.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="lifecycle"
          eyebrow="Lifecycle Flow"
          title="Seven stages, each tied to a decision the student is making."
          intro="The prototype connects discovery, narrowing, evaluation, saving, tracking, and personalization into one loop."
        >
          <div className="rounded-[2rem] border border-sky/20 bg-sky/[0.06] p-5 shadow-glow sm:p-6">
            <LifecycleFlow />
          </div>
        </Section>

        <Section
          id="prototype"
          eyebrow="Prototype Screens"
          title="Seven screens, one coherent opportunity-management loop."
          intro="Each screen is framed by the decision it supports: start guided, narrow intentionally, evaluate clearly, save confidently, and return with status."
        >
          <ScreenShowcase screens={screens} />
        </Section>

        <Section
          id="loop"
          eyebrow="Decision System"
          title="From search flow to decision system."
          intro="The seven screens are not isolated views. They form one opportunity loop — discover, narrow, evaluate, and track — where each stage answers the question the student is actually asking and carries them to the next."
        >
          <OpportunityLoop />
        </Section>

        <Section
          id="matrix"
          eyebrow="Screen Responsibility Matrix"
          title="Every screen has one job and one decision to support."
          intro="A recruiter-scannable view of what each prototype screen is responsible for, the decision it supports, and the friction it is designed to remove. Framing reflects design rationale, not measured outcomes."
        >
          <ScreenResponsibilityMatrix />
        </Section>

        <Section
          id="decisions"
          eyebrow="Design Decisions"
          title="The redesign is organized around six product decisions."
          intro="Each decision maps to a stage in the lifecycle — the design rationale and the screen it lives on stay connected."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decisions.map((decision, index) => (
              <DecisionCard
                key={decision.title}
                number={`0${index + 1}`}
                stage={decision.stage}
                title={decision.title}
                body={decision.body}
              />
            ))}
          </div>
        </Section>

        <Section
          id="judgment"
          eyebrow="Design Judgment"
          title="The trade-offs behind the prototype."
          intro="A case study is also about what was left out. These notes describe design rationale and proposed next steps — not validated results or shipped product decisions."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {designJudgment.map((card) => (
              <ProjectCard key={card.label} title={card.label}>
                {card.body}
              </ProjectCard>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Accessibility & UX Quality"
          title="Accessibility was treated as product structure, not a final polish pass."
          intro="The prototype emphasizes readable hierarchy, strong contrast, visible focus states, clear labels, non-color-only status cues, mobile responsiveness, reduced cognitive load, restrained motion, semantic structure, and alt text."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accessibilityPoints.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-sm font-semibold text-ice/85"
              >
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          eyebrow="Final Recommendation"
          title="Treat opportunity discovery as a continuous decision-support journey."
          intro="The proposal: connect relevance signals, filtering, saved opportunities, and tracking into one flow so students can move from discovery to action with less friction."
        >
          <ProjectCard title="Product recommendation" accent>
            The proposed experience reframes opportunity discovery as a
            lifecycle: find relevant options, narrow the set, evaluate fit, save
            with confidence, and return with a visible next step.
          </ProjectCard>
        </Section>

        <Section
          id="deliverables"
          eyebrow="Deliverables"
          title="A complete prototype and case-study package."
        >
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map((deliverable) => (
              <li
                key={deliverable}
                className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-6"
              >
                <CheckIcon />
                <p className="text-lg font-semibold leading-snug text-white">
                  {deliverable}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          className="pb-24"
          eyebrow="Next Step"
          title="Review the full case study or open the prototype."
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-base leading-7 text-ice/75">
                The microsite gives the recruiter-ready summary. The PDF and
                Figma prototype provide the deeper product rationale and screen
                evidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <CTAButton href={links.pdf}>View Case Study PDF</CTAButton>
                <CTAButton href={links.figma} variant="secondary" external>
                  View Figma Prototype
                </CTAButton>
                <CTAButton href={links.linkedin} variant="ghost" external>
                  LinkedIn
                </CTAButton>
                <CTAButton href={links.contact} variant="ghost">
                  Contact Me
                </CTAButton>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
