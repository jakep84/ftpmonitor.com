// src/lib/docs/resolveDoc.ts
import { DOCS, type Doc, type DocType } from "@/content/docs";

export function getDoc(type: DocType, slug: string): Doc | undefined {
  return DOCS.find((d) => d.type === type && d.slug === slug);
}

export function getAllSlugs(type: DocType) {
  return DOCS.filter((d) => d.type === type).map((d) => d.slug);
}

export function getRelatedDocs(doc: Doc, limit = 6): Doc[] {
  // 1) Explicit relatedSlugs wins
  if (doc.relatedSlugs?.length) {
    const picked = doc.relatedSlugs
      .map((s) => DOCS.find((d) => d.slug === s))
      .filter(Boolean) as Doc[];
    return picked.slice(0, limit);
  }

  // 2) Otherwise: same protocol + step, then protocol, then step
  const others = DOCS.filter((d) => d.slug !== doc.slug);

  const score = (d: Doc) => {
    let s = 0;
    if (d.protocol === doc.protocol) s += 4;
    if (d.step === doc.step) s += 3;
    if (d.protocol === "any") s += 1;
    if (d.step === "any") s += 1;
    return s;
  };

  return others
    .map((d) => ({ d, s: score(d) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.d)
    .slice(0, limit);
}
