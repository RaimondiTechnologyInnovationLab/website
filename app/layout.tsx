import type { Metadata } from "next";
import { headers } from "next/headers";
import { assetPath } from "./asset-path";
import "./globals.css";

async function siteOrigin(): Promise<string> {
  // A static export has no request headers; its public origin is known at build time.
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:5173";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = await siteOrigin();
  const title = "Ivan Raimondi | Technology Innovation Lab";
  const description =
    "Ivan Raimondi’s research in genomic and multiomic methods, and his vision for a future Technology Innovation Lab.";

  return {
    title,
    description,
    icons: {
      icon: { url: assetPath("/favicon.svg?v=til-soft-a"), type: "image/svg+xml" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `${origin}${assetPath("/og.png")}`,
          width: 1200,
          height: 630,
          alt: "Technology Innovation Lab @ SCB over a blue-hour New York skyline",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}${assetPath("/og.png")}`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
