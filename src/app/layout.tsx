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
const defaultTitle = "Debug FTP, SFTP, and FTPS in Seconds";
const siteDescription =
  "Instantly test FTP, FTPS, and SFTP connections, pinpoint failures, and get exact fixes for DNS, TCP, auth, TLS, and directory listing issues.";
const ogTitle = `${siteName} — ${defaultTitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: ogTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,

  applicationName: siteName,
  authors: [{ name: "FTPMonitor" }],
  creator: "FTPMonitor",
  publisher: "FTPMonitor",
  category: "Developer Tools",
  keywords: [
    "ftp monitor",
    "ftp troubleshooting",
    "sftp troubleshooting",
    "ftps troubleshooting",
    "ftp health check",
    "sftp health check",
    "ftps health check",
    "ftp connection test",
    "sftp connection test",
    "ftps connection test",
    "ftp debug tool",
    "sftp debug tool",
    "ftps certificate error",
    "ftp passive mode",
    "sftp permission denied",
    "ftp connection refused",
    "devops tools",
    "network diagnostics",
  ],

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
    title: ogTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FTPMonitor — Debug FTP, SFTP, and FTPS in Seconds",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: siteDescription,
    images: ["/twitter-image"],
    creator: "@ftpmonitor",
  },

  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
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
