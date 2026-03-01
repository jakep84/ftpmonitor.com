// src/app/(docs)/_components/RelatedLinks.tsx
import Link from "next/link";
import type { Doc } from "@/content/docs";

export default function RelatedLinks({ related }: { related: Doc[] }) {
  if (!related?.length) return null;

  return (
    <section>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Related</div>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, opacity: 0.9 }}>
        {related.map((d) => (
          <li key={`${d.type}:${d.slug}`}>
            <Link
              href={`/${d.type === "guide" ? "guides" : "errors"}/${d.slug}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {d.title}
            </Link>
            <span style={{ opacity: 0.6 }}> — {d.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
