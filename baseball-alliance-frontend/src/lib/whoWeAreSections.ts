import type { WhoWeAreSectionPayload } from "./site";

/** Matches previous marketing defaults (lead + supporting body). */
export const DEFAULT_WHO_WE_ARE_SECTIONS: WhoWeAreSectionPayload[] = [
  {
    id: "wwa-lead",
    variant: "lead",
    body:
      "Baseball Alliance exists to unite exemplary high school and youth baseball teams, providing member organizations with the tools, exposure and support to take their athletes to the next level – college or professional.",
  },
  {
    id: "wwa-body",
    variant: "body",
    body:
      "Baseball Alliance is a partnership that exists for the purpose of facilitating productive opportunities for players, coaches, organizations and families. The sport is in a rapidly evolving state of change, and Baseball Alliance was formed to align credible teams and people focused on promising pathways and preparing student-athletes for successful futures.",
  },
];

export function mergeWhoWeAreSections(
  raw: unknown
): WhoWeAreSectionPayload[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_WHO_WE_ARE_SECTIONS.map((s) => ({ ...s }));
  }
  return raw.map((item: unknown, i: number) => {
    const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      id: typeof o.id === "string" && o.id ? o.id : `wwa-${i}`,
      variant: o.variant === "body" ? "body" : "lead",
      body: typeof o.body === "string" ? o.body : "",
    };
  });
}

/** For legacy `whoWeAre` single string: split on blank lines into alternating lead/body. */
export function sectionsFromLegacyWhoWeAre(text: string): WhoWeAreSectionPayload[] {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return DEFAULT_WHO_WE_ARE_SECTIONS.map((s) => ({ ...s }));
  }
  return parts.map((body, i) => ({
    id: `wwa-legacy-${i}`,
    variant: (i === 0 ? "lead" : "body") as WhoWeAreSectionPayload["variant"],
    body,
  }));
}

/** Resolved sections for API payload + editor (stored JSON or legacy whoWeAre). */
export function resolveWhoWeAreSectionsForSite(site: {
  whoWeAre: string;
  whoWeAreSections: WhoWeAreSectionPayload[] | null;
}): WhoWeAreSectionPayload[] {
  if (site.whoWeAreSections != null) {
    return mergeWhoWeAreSections(site.whoWeAreSections);
  }
  return sectionsFromLegacyWhoWeAre(site.whoWeAre ?? "");
}
