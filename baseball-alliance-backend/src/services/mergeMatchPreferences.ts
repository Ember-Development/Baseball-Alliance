/** User-selected school/location/priority overlay merged onto CSV-derived match requests. */

export type MatchPreferencesInput = {
  preferredStates?: string[];
  preferredDivisions?: string[];
  preferredConferences?: string[];
  schoolTypePreference?: string;
  schoolSizePreference?: "small" | "medium" | "large";
  tuitionPreference?: string;
  priorities?: {
    athleticFit?: number;
    locationFit?: number;
    schoolFit?: number;
    affordabilityFit?: number;
  };
};

export function mergeMatchPreferences(
  base: Record<string, unknown>,
  preferences?: MatchPreferencesInput | null
): Record<string, unknown> {
  if (!preferences) return base;

  const merged = { ...base };

  if (preferences.preferredStates?.length) {
    merged.preferredStates = preferences.preferredStates;
  }
  if (preferences.preferredDivisions?.length) {
    merged.preferredDivisions = preferences.preferredDivisions;
  }
  if (preferences.preferredConferences?.length) {
    merged.preferredConferences = preferences.preferredConferences;
  }

  const schoolType = preferences.schoolTypePreference?.trim();
  if (schoolType) merged.schoolTypePreference = schoolType;

  if (preferences.schoolSizePreference) {
    merged.schoolSizePreference = preferences.schoolSizePreference;
  }

  const tuition = preferences.tuitionPreference?.trim();
  if (tuition) merged.tuitionPreference = tuition;

  if (preferences.priorities && Object.keys(preferences.priorities).length > 0) {
    merged.priorities = preferences.priorities;
  }

  return merged;
}
