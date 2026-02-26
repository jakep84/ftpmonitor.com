// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "FTPMonitor";
const siteUrl = "https://ftpmonitor.com";
const siteDescription =
  "Instant server-side health checks for FTP / FTPS / SFTP. Validate DNS, TCP, auth, and directory access with clear diagnostics in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${siteName} — Instant FTP / SFTP Health Checks`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,

  applicationName: siteName,
  authors: [{ name: "FTPMonitor" }],
  creator: "FTPMonitor",
  publisher: "FTPMonitor",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — Instant FTP / SFTP Health Checks`,
    description: siteDescription,
    images: [
      {
        // If you add src/app/opengraph-image.tsx, Next will serve it at /opengraph-image
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteName} preview`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Instant FTP / SFTP Health Checks`,
    description: siteDescription,
    images: ["/twitter-image"],
  },

  icons: {
    // If you add src/app/icon.png, Next will serve it at /icon
    icon: [{ url: "/icon", type: "image/png" }],
    // If you add src/app/apple-icon.png, Next will serve it at /apple-icon
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },

  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
