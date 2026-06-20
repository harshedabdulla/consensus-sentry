import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Display serif — the brand's most recognizable element. Loaded as a variable
// font so the signature whisper weight (300) is guaranteed available; we only
// ever render it at font-weight 300.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Everything functional. We use weights 400 and 600 only.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION =
  "Verifiable infrastructure for AI guardrails. A research project giving every AI moderation decision cryptographic provenance, so it can be measured, audited, and contested.";

export const metadata: Metadata = {
  title: {
    default: "Consensus Sentry: Verifiable infrastructure for AI guardrails",
    template: "%s · Consensus Sentry",
  },
  description: DESCRIPTION,
  applicationName: "Consensus Sentry",
  keywords: [
    "AI governance",
    "responsible AI",
    "India AI",
    "AI accountability",
    "attestation",
    "AI guardrails",
    "research",
  ],
  openGraph: {
    title: "Consensus Sentry: Verifiable infrastructure for AI guardrails",
    description: DESCRIPTION,
    siteName: "Consensus Sentry",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consensus Sentry: Verifiable infrastructure for AI guardrails",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
