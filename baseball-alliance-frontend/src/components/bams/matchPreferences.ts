export const US_STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
] as const;

/** Fallback when `/api/programs/filters` has no seeded program data. */
export const SCHOOL_TYPE_OPTIONS = ["Public", "Private"] as const;

export type MatchPreferences = {
  preferredStates: string[];
  schoolTypePreference: string;
  schoolSizePreference: "" | "small" | "medium" | "large";
  tuitionPreference: string;
  athleticFitW: number;
  locationFitW: number;
  schoolFitW: number;
  affordabilityFitW: number;
};

export const DEFAULT_MATCH_PREFERENCES: MatchPreferences = {
  preferredStates: [],
  schoolTypePreference: "",
  schoolSizePreference: "",
  tuitionPreference: "",
  athleticFitW: 0.35,
  locationFitW: 0.25,
  schoolFitW: 0.25,
  affordabilityFitW: 0.15,
};

export const WEIGHT_DESCRIPTIONS: Record<
  "athleticFitW" | "locationFitW" | "schoolFitW" | "affordabilityFitW",
  string
> = {
  athleticFitW: "How closely your metrics match the program's recruiting range",
  locationFitW: "How well the school's location matches your geographic preferences",
  schoolFitW: "How well the school type, size, and culture align with what you want",
  affordabilityFitW: "How much tuition and financial accessibility matter to you",
};

export function weightLabel(v: number): {
  text: string;
  color: string;
  badge: string;
} {
  if (v === 0)
    return {
      text: "Not a factor",
      color: "text-slate-600",
      badge: "bg-slate-200/90 border-slate-300/80",
    };
  if (v <= 0.2)
    return {
      text: "Slightly important",
      color: "text-slate-700",
      badge: "bg-slate-100 border-slate-200",
    };
  if (v <= 0.4)
    return {
      text: "Somewhat important",
      color: "text-blue-700",
      badge: "bg-blue-50 border-blue-200/90",
    };
  if (v <= 0.6)
    return {
      text: "Important",
      color: "text-blue-800",
      badge: "bg-blue-100/90 border-blue-300/80",
    };
  if (v <= 0.8)
    return {
      text: "Very important",
      color: "text-[#0f2d52]",
      badge: "bg-[#163968]/12 border-[#163968]/35",
    };
  return {
    text: "Top priority",
    color: "text-emerald-800",
    badge: "bg-emerald-100/90 border-emerald-300/80",
  };
}

export function matchPreferencesToApi(
  prefs: MatchPreferences
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    priorities: {
      athleticFit: prefs.athleticFitW,
      locationFit: prefs.locationFitW,
      schoolFit: prefs.schoolFitW,
      affordabilityFit: prefs.affordabilityFitW,
    },
  };

  if (prefs.preferredStates.length) {
    body.preferredStates = prefs.preferredStates;
  }
  if (prefs.schoolTypePreference.trim()) {
    body.schoolTypePreference = prefs.schoolTypePreference.trim();
  }
  if (prefs.schoolSizePreference) {
    body.schoolSizePreference = prefs.schoolSizePreference;
  }
  if (prefs.tuitionPreference.trim()) {
    body.tuitionPreference = prefs.tuitionPreference.trim();
  }

  return body;
}
