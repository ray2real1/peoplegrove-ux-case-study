import { links } from "@/content/caseStudy";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="text-sm font-semibold text-white">
            PeopleGrove Opportunity Discovery &amp; Tracking
          </p>
          <p className="mt-1 max-w-xl text-xs leading-5 text-ice/55">
            UX design internship project completed through WGU&rsquo;s Applied
            Learning Capstone, with PeopleGrove as employer partner. A
            self-directed concept prototype — not commissioned, implemented, or
            endorsed by PeopleGrove, and not a shipped PeopleGrove product. No
            launch, adoption, or engagement outcomes are claimed.
          </p>
        </div>
        <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium">
          <a
            className="rounded text-ice/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
            href={links.pdf}
          >
            Case Study PDF
          </a>
          <a
            className="rounded text-ice/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
            href={links.figma}
            target="_blank"
            rel="noreferrer"
          >
            Figma Prototype
          </a>
          <a
            className="rounded text-ice/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="rounded text-ice/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
            href={links.contact}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
