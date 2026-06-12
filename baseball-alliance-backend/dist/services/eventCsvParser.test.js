import { describe, expect, it } from "vitest";
import { extractEventDateFromName, parseSyncEventExportCsv, } from "./eventCsvParser.js";
const SYNC_SAMPLE = `Event ID,Event Name,ID,first_name,last_name,60-time,5-10-5-shuttle,exit-velocity,outfield-velocity,infield-velocity,catcher-velocity,pop-time,fastball-velocity,offspeed-velocity,changeup-velocity
8a3c490e-054d-40df-8a71-556f556abd0d,Baseball Alliance x Action Baseball Showcase (6/7/26),212,Heaton,Hughes,6.97,4.28,91,,80,,,81,73,69`;
describe("extractEventDateFromName", () => {
    it("pulls date from parentheses in event name", () => {
        expect(extractEventDateFromName("Baseball Alliance x Action Baseball Showcase (6/7/26)")).toBe("6/7/26");
    });
});
describe("parseSyncEventExportCsv", () => {
    it("parses showcase sync export with Event ID, Event Name, and Playbook ID", () => {
        const { athletes, fileErrors } = parseSyncEventExportCsv(SYNC_SAMPLE);
        expect(fileErrors).toHaveLength(0);
        expect(athletes).toHaveLength(1);
        expect(athletes[0].playerId).toBe("212");
        expect(athletes[0].athleteUuid).toBe("8a3c490e-054d-40df-8a71-556f556abd0d:212");
        expect(athletes[0].eventName).toBe("Baseball Alliance x Action Baseball Showcase (6/7/26)");
        expect(athletes[0].eventStartDate).toBe("6/7/26");
        expect(athletes[0].firstName).toBe("Heaton");
        expect(athletes[0].lastName).toBe("Hughes");
    });
    it("requires Event ID, Event Name, and ID columns", () => {
        const { athletes, fileErrors } = parseSyncEventExportCsv("Name,Email\nBob,bob@test.com");
        expect(athletes).toHaveLength(0);
        expect(fileErrors.length).toBeGreaterThan(0);
    });
});
