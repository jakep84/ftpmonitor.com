// src/app/errors/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getDoc, getRelatedDocs } from "@/lib/docs/resolveDoc";
import DocLayout from "@/app/(docs)/_components/DocLayout";

export const runtime = "nodejs";

export async function generateStaticParams() {
  return getAllSlugs("error").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc("error", slug);
  if (!doc) return {};

  const url = `https://ftpmonitor.com/errors/${doc.slug}`;

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
    },
  };
}

function jsonLd(doc: any) {
  const url = `https://ftpmonitor.com/errors/${doc.slug}`;

  const faq = doc.body?.faqs?.length
    ? {
        "@type": "FAQPage",
        mainEntity: doc.body.faqs.map((f: any) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const graph: any[] = [
    {
      "@type": "Article",
      headline: doc.title,
      description: doc.description,
      mainEntityOfPage: url,
      url,
      author: { "@type": "Organization", name: "FTPMonitor" },
      publisher: { "@type": "Organization", name: "FTPMonitor" },
    },
  ];

  if (faq) graph.push(faq);

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function ErrorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc("error", slug);
  if (!doc) return notFound();

  const related = getRelatedDocs(doc);

  return (
    <DocLayout doc={doc} related={related}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(doc)) }}
      />

      <div style={{ marginTop: 18, lineHeight: 1.75, opacity: 0.92 }}>
        {doc.body.intro?.map((p: string, i: number) => (
          <p key={i} style={{ margin: "0 0 12px 0" }}>
            {p}
          </p>
        ))}

        {doc.body.causes?.map((c: any, i: number) => (
          <section key={i} style={{ marginTop: 18 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>{c.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {c.bullets.map((b: string, idx: number) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </section>
        ))}

        {doc.body.fixes?.map((f: any, i: number) => (
          <section key={i} style={{ marginTop: 18 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>{f.title}</h2>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {f.steps.map((s: string, idx: number) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        ))}

        {doc.body.commands?.map((c: any, i: number) => (
          <section key={i} style={{ marginTop: 18 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>{c.title}</h2>
            <pre
              style={{
                margin: 0,
                padding: 14,
                borderRadius: 12,
                background: "#0c0c0e",
                border: "1px solid rgba(255,255,255,0.12)",
                overflowX: "auto",
              }}
            >
              <code>{c.lines.join("\n")}</code>
            </pre>
          </section>
        ))}
      </div>
    </DocLayout>
  );
}
