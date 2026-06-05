/** User-selected school/location/priority overlay merged onto CSV-derived match requests. */
export function mergeMatchPreferences(base, preferences) {
    if (!preferences)
        return base;
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
    if (schoolType)
        merged.schoolTypePreference = schoolType;
    if (preferences.schoolSizePreference) {
        merged.schoolSizePreference = preferences.schoolSizePreference;
    }
    const tuition = preferences.tuitionPreference?.trim();
    if (tuition)
        merged.tuitionPreference = tuition;
    if (preferences.priorities && Object.keys(preferences.priorities).length > 0) {
        merged.priorities = preferences.priorities;
    }
    return merged;
}
