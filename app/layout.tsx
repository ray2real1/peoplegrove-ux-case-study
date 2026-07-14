import type { Metadata } from "next";
import "./globals.css";

const title = "PeopleGrove Opportunity Discovery & Tracking";
const description =
  "A UX design internship project completed through WGU's Applied Learning Capstone, with PeopleGrove as employer partner — reframing opportunity discovery as a continuous decision-support journey for students navigating career pathways.";

export const metadata: Metadata = {
  metadataBase: new URL("https://peoplegrove-ux-case-study.vercel.app"),
  title,
  description,
  applicationName: "PeopleGrove Case Study",
  authors: [{ name: "Raymond Merrill II" }],
  keywords: [
    "UX case study",
    "product design",
    "opportunity discovery",
    "decision support",
    "PeopleGrove",
    "UX design internship",
    "WGU Applied Learning Capstone",
    "accessibility"
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "PeopleGrove Case Study",
    images: [
      {
        url: "/images/peoplegrove-dashboard.png",
        width: 1170,
        height: 2532,
        alt: "PeopleGrove prototype dashboard screen."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/peoplegrove-dashboard.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          Marks JS as available before first paint so the scroll-reveal hidden
          state can apply without a flash. Without JS the class is never added,
          and sections stay visible — content is never stranded at opacity 0.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`
          }}
        />
      </head>
      <body>
        <a href="#top" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
