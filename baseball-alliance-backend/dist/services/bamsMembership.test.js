import { describe, expect, it } from "vitest";
import { BamsMembershipTier } from "@prisma/client";
import { canRunBamsMatch, matchRunsLimit, matchRunsRemaining, parseMembershipTier, } from "./bamsMembership.js";
describe("parseMembershipTier", () => {
    it("accepts bams and bams-premium", () => {
        expect(parseMembershipTier("bams")).toBe(BamsMembershipTier.BAMS);
        expect(parseMembershipTier("BAMS-PREMIUM")).toBe(BamsMembershipTier.BAMS_PREMIUM);
        expect(parseMembershipTier("bams premium")).toBe(BamsMembershipTier.BAMS_PREMIUM);
    });
    it("rejects unknown values", () => {
        expect(parseMembershipTier("gold")).toBeUndefined();
    });
});
describe("match run limits", () => {
    it("allows one run for bams and six for premium", () => {
        expect(matchRunsLimit(BamsMembershipTier.BAMS)).toBe(1);
        expect(matchRunsLimit(BamsMembershipTier.BAMS_PREMIUM)).toBe(6);
        expect(matchRunsRemaining(BamsMembershipTier.BAMS, 0)).toBe(1);
        expect(matchRunsRemaining(BamsMembershipTier.BAMS, 1)).toBe(0);
        expect(matchRunsRemaining(BamsMembershipTier.BAMS_PREMIUM, 5)).toBe(1);
    });
    it("blocks members at limit but not admins", () => {
        expect(canRunBamsMatch({
            roles: ["MEMBER"],
            membership: BamsMembershipTier.BAMS,
            matchRunsUsed: 1,
        })).toBe(false);
        expect(canRunBamsMatch({
            roles: ["ADMIN"],
            membership: BamsMembershipTier.BAMS,
            matchRunsUsed: 99,
        })).toBe(true);
    });
});
