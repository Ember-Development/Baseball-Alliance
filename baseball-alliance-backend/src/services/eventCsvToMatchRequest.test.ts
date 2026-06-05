import { describe, expect, it } from "vitest";
import { buildMatchRequestFromEventRow } from "./eventCsvToMatchRequest.js";

describe("buildMatchRequestFromEventRow", () => {
  it("maps showcase metrics and verifiedData", () => {
    const { request, errors } = buildMatchRequestFromEventRow({
      primary_position: "2B",
      grad_year: "2029",
      bat: "Right",
      throw: "Right",
      do_you_pitch: "0",
      "60-time": "7.52",
      "exit-velocity": "69",
      "infield-velocity": "66",
      height_feet: "5",
      height_inches: "4",
      weight: "125",
      gpa: "0",
    });
    expect(errors).toHaveLength(0);
    expect(request.playerType).toBe("hitter");
    expect(request.primaryPosition).toBe("2B");
    expect(request.gradYear).toBe(2029);
    expect(request.handedness).toBe("R/R");
    expect(request.verifiedData).toBe(true);
    expect(request.metrics).toMatchObject({
      sixtyTime: 7.52,
      maxExitVelocity: 69,
      infThrowingVelocity: 66,
      heightInches: 64,
      weightLbs: 125,
    });
    expect(request.gpa).toBeUndefined();
  });

  it("classifies pitcher from do_you_pitch", () => {
    const { request } = buildMatchRequestFromEventRow({
      primary_position: "OF",
      grad_year: "2028",
      do_you_pitch: "1",
      "fastball-velocity": "82",
    });
    expect(request.playerType).toBe("pitcher");
    expect(request.metrics).toMatchObject({
      fastballVelocity: 82,
      topVelocity: 82,
    });
  });
});
