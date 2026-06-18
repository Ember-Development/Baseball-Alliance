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

  it("maps RF outfielder with IF throw fallback (Betty Crocker)", () => {
    const { request, errors } = buildMatchRequestFromEventRow({
      primary_position: "RF",
      grad_year: "2027",
      "60-time": "6.97",
      "5-10-5-shuttle": "4.28",
      "exit-velocity": "91",
      "infield-velocity": "80",
      "fastball-velocity": "81",
      "offspeed-velocity": "73",
      "changeup-velocity": "69",
    });
    expect(errors).toHaveLength(0);
    expect(request.playerType).toBe("hitter");
    expect(request.primaryPosition).toBe("RF");
    expect(request.verifiedData).toBe(true);
    expect(request.metrics).toEqual({
      maxExitVelocity: 91,
      sixtyTime: 6.97,
      ofThrowingVelocity: 80,
    });
    expect(request.metrics).not.toHaveProperty("infThrowingVelocity");
    expect(request.metrics).not.toHaveProperty("fastballVelocity");
  });

  it("sends infield arm for middle IF with OF throw fallback", () => {
    const { request } = buildMatchRequestFromEventRow({
      primary_position: "SS",
      grad_year: "2028",
      "outfield-velocity": "78",
    });
    expect(request.metrics).toMatchObject({
      infThrowingVelocity: 78,
    });
    expect(request.metrics).not.toHaveProperty("ofThrowingVelocity");
  });

  it("sets secondaryPosition for two-way hitter", () => {
    const { request } = buildMatchRequestFromEventRow({
      primary_position: "1B",
      secondary_position: "RHP",
      grad_year: "2028",
      "exit-velocity": "92",
      "fastball-velocity": "84",
    });
    expect(request.secondaryPosition).toBe("RHP");
    expect(request.metrics).toMatchObject({
      maxExitVelocity: 92,
      fastballVelocity: 84,
      topVelocity: 84,
    });
  });
});
