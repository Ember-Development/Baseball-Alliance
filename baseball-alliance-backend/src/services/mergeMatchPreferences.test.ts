import { describe, expect, it } from "vitest";
import { mergeMatchPreferences } from "./mergeMatchPreferences.js";

describe("mergeMatchPreferences", () => {
  it("overlays location, school, and priority fields onto CSV request", () => {
    const base = {
      playerType: "hitter",
      primaryPosition: "SS",
      preferredStates: [],
      preferredDivisions: [],
      preferredConferences: [],
      metrics: { sixtyTime: 7.1 },
    };

    const merged = mergeMatchPreferences(base, {
      preferredStates: ["TX", "FL"],
      preferredDivisions: ["D1"],
      schoolTypePreference: "Public",
      schoolSizePreference: "large",
      tuitionPreference: "moderate",
      priorities: {
        athleticFit: 0.4,
        locationFit: 0.3,
        schoolFit: 0.2,
        affordabilityFit: 0.1,
      },
    });

    expect(merged.preferredStates).toEqual(["TX", "FL"]);
    expect(merged.preferredDivisions).toEqual(["D1"]);
    expect(merged.schoolTypePreference).toBe("Public");
    expect(merged.schoolSizePreference).toBe("large");
    expect(merged.priorities).toEqual({
      athleticFit: 0.4,
      locationFit: 0.3,
      schoolFit: 0.2,
      affordabilityFit: 0.1,
    });
    expect(merged.metrics).toEqual({ sixtyTime: 7.1 });
  });

  it("skips empty preference fields", () => {
    const base = { preferredStates: [] };
    const merged = mergeMatchPreferences(base, {
      preferredStates: [],
      priorities: { athleticFit: 0.5 },
    });
    expect(merged.preferredStates).toEqual([]);
    expect(merged.priorities).toEqual({ athleticFit: 0.5 });
  });
});
