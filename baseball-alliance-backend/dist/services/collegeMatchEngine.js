import { prisma } from "../db.js";
const WEIGHT_KEYS = [
    "athleticFit",
    "locationFit",
    "schoolFit",
    "affordabilityFit",
];
function normalizeWeights(p) {
    const raw = WEIGHT_KEYS.map((k) => p?.[k] === undefined ? 1 : Math.max(0, Math.min(1, p[k])));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    return {
        athleticFit: raw[0] / sum,
        locationFit: raw[1] / sum,
        schoolFit: raw[2] / sum,
        affordabilityFit: raw[3] / sum,
    };
}
function fitLabel(overall) {
    if (overall >= 0.75)
        return "Strong match";
    if (overall >= 0.55)
        return "Good match";
    return "Fair match";
}
function scoreProgram(req, p) {
    const reasons = [];
    const divisionHit = req.preferredDivisions.length === 0 ||
        req.preferredDivisions.some((d) => d.toLowerCase() === p.division.toLowerCase());
    const confHit = req.preferredConferences.length === 0 ||
        req.preferredConferences.some((c) => c.toLowerCase() === p.conference.toLowerCase());
    const stateHit = req.preferredStates.length === 0 ||
        req.preferredStates.some((s) => s.toLowerCase() === p.state.toLowerCase());
    let athleticFit = 0.45;
    if (divisionHit) {
        athleticFit += 0.28;
        reasons.push(`Division aligns with preferences (${p.division})`);
    }
    else if (req.preferredDivisions.length > 0) {
        reasons.push("Division outside preferred list");
    }
    else {
        athleticFit += 0.15;
        reasons.push("No division filter — baseline athletic fit");
    }
    if (confHit && req.preferredConferences.length > 0) {
        athleticFit += 0.12;
        reasons.push(`Conference match (${p.conference})`);
    }
    if (req.playerType === "pitcher" && req.metrics?.fastballVelocity != null) {
        athleticFit += 0.05;
        reasons.push("Pitcher velocity metric supplied for athletic scoring");
    }
    if (req.playerType === "hitter" && req.metrics?.avgExitVelocity != null) {
        athleticFit += 0.05;
        reasons.push("Hitter exit velo supplied for athletic scoring");
    }
    athleticFit = Math.min(1, athleticFit);
    let locationFit = 0.35;
    if (stateHit) {
        locationFit += 0.45;
        reasons.push(`Preferred state includes program state (${p.state})`);
    }
    else if (req.preferredStates.length > 0) {
        reasons.push(`State ${p.state} not in preferred list`);
        locationFit += 0.1;
    }
    else {
        locationFit += 0.35;
        reasons.push("No state preference — location treated as neutral");
    }
    locationFit = Math.min(1, locationFit);
    let schoolFit = 0.5;
    if (req.schoolTypePreference &&
        req.schoolTypePreference.toLowerCase() === p.schoolType.toLowerCase()) {
        schoolFit += 0.35;
        reasons.push(`School type matches preference (${p.schoolType})`);
    }
    else if (req.schoolTypePreference) {
        schoolFit += 0.1;
        reasons.push("School type differs from preference");
    }
    else {
        schoolFit += 0.2;
    }
    if (req.schoolSizePreference && req.schoolSizePreference === p.schoolSize) {
        schoolFit += 0.1;
        reasons.push(`Institution size (${p.schoolSize}) matches preference`);
    }
    schoolFit = Math.min(1, schoolFit);
    let affordabilityFit = 0.5;
    if (req.tuitionPreference &&
        p.tuitionBand &&
        req.tuitionPreference.toLowerCase() === p.tuitionBand.toLowerCase()) {
        affordabilityFit += 0.4;
        reasons.push("Tuition band aligns with preference");
    }
    else if (req.tuitionPreference) {
        affordabilityFit += 0.15;
        reasons.push("Tuition band differs from preference");
    }
    else {
        affordabilityFit += 0.25;
    }
    affordabilityFit = Math.min(1, affordabilityFit);
    return {
        breakdown: { athleticFit, locationFit, schoolFit, affordabilityFit },
        reasons,
    };
}
export async function runCollegeMatch(req, query) {
    const programs = await prisma.collegeProgram.findMany({
        orderBy: { schoolName: "asc" },
    });
    if (programs.length === 0) {
        return {
            matches: [],
            totalEvaluated: 0,
            totalReturned: 0,
            total: 0,
        };
    }
    const weights = normalizeWeights(req.priorities);
    const scored = programs.map((p) => {
        const { breakdown, reasons } = scoreProgram(req, p);
        const overallScore = weights.athleticFit * breakdown.athleticFit +
            weights.locationFit * breakdown.locationFit +
            weights.schoolFit * breakdown.schoolFit +
            weights.affordabilityFit * breakdown.affordabilityFit;
        const row = {
            id: p.id,
            schoolName: p.schoolName,
            division: p.division,
            conference: p.conference,
            state: p.state,
            overallScore: Math.round(overallScore * 1000) / 1000,
            scoreBreakdown: {
                athleticFit: Math.round(breakdown.athleticFit * 1000) / 1000,
                locationFit: Math.round(breakdown.locationFit * 1000) / 1000,
                schoolFit: Math.round(breakdown.schoolFit * 1000) / 1000,
                affordabilityFit: Math.round(breakdown.affordabilityFit * 1000) / 1000,
            },
            fitLabel: fitLabel(overallScore),
            reasons,
        };
        return row;
    });
    const sorted = scored.sort((a, b) => b.overallScore - a.overallScore);
    const total = sorted.length;
    const page = sorted.slice(query.offset, query.offset + query.limit);
    return {
        matches: page,
        totalEvaluated: programs.length,
        totalReturned: page.length,
        total,
    };
}
