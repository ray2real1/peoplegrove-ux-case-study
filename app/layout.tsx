import type { Metadata } from "next";
import "./globals.css";

const title = "PeopleGrove Opportunity Discovery & Tracking";
const description =
  "A UX internship case study reframing opportunity discovery as a continuous decision-support journey for students navigating career pathways.";

export const metadata: Metadata = {
  metadataBase: new URL("https://peoplegrove-case-study.example.com"),
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
    "UX internship"
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
      <body>
        <a href="#top" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
