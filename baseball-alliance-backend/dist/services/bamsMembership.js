import { BamsMembershipTier, RoleName } from "@prisma/client";
export const BAMS_MATCH_RUN_LIMITS = {
    [BamsMembershipTier.BAMS]: 1,
    [BamsMembershipTier.BAMS_PREMIUM]: 6,
};
export function matchRunsLimit(tier) {
    return BAMS_MATCH_RUN_LIMITS[tier];
}
export function matchRunsRemaining(tier, used) {
    return Math.max(0, matchRunsLimit(tier) - used);
}
export function membershipTierLabel(tier) {
    return tier === BamsMembershipTier.BAMS_PREMIUM ? "bams-premium" : "bams";
}
/** Parse CSV/import values: bams | bams-premium */
export function parseMembershipTier(raw) {
    if (!raw?.trim())
        return undefined;
    const normalized = raw.trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
    if (normalized === "bams")
        return BamsMembershipTier.BAMS;
    if (normalized === "bams-premium")
        return BamsMembershipTier.BAMS_PREMIUM;
    return undefined;
}
export function resolveMembershipTier(raw, fallback = BamsMembershipTier.BAMS) {
    return parseMembershipTier(raw) ?? fallback;
}
export function canRunBamsMatch(input) {
    if (input.roles.includes(RoleName.ADMIN))
        return true;
    return matchRunsRemaining(input.membership, input.matchRunsUsed) > 0;
}
export function membershipUsageSummary(input) {
    const limit = matchRunsLimit(input.membership);
    const remaining = matchRunsRemaining(input.membership, input.matchRunsUsed);
    return {
        membership: input.membership,
        membershipLabel: membershipTierLabel(input.membership),
        matchRunsUsed: input.matchRunsUsed,
        matchRunsLimit: limit,
        matchRunsRemaining: remaining,
    };
}
