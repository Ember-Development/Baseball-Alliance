import { dedupeHeaders, normalizeCsvHeader, parseCsvGrid, rowToRecord, } from "../utils/csvParse.js";
import { buildMatchRequestFromEventRow, displayNameFromRow, metricColumnsPresent, REQUIRED_EVENT_HEADERS, } from "./eventCsvToMatchRequest.js";
const MAX_CSV_BYTES = 5 * 1024 * 1024;
function cell(row, key) {
    const v = row[key]?.trim();
    return v && v.length > 0 ? v : undefined;
}
export function parseEventExportCsv(csvText) {
    if (Buffer.byteLength(csvText, "utf8") > MAX_CSV_BYTES) {
        return {
            athletes: [],
            fileErrors: [{ row: 0, message: "File exceeds 5MB limit" }],
            warnings: [],
            headers: [],
        };
    }
    const grid = parseCsvGrid(csvText);
    if (grid.length < 2) {
        return {
            athletes: [],
            fileErrors: [
                {
                    row: 0,
                    message: "CSV must include a header row and at least one data row",
                },
            ],
            warnings: [],
            headers: [],
        };
    }
    const headers = dedupeHeaders(grid[0].map(normalizeCsvHeader));
    const missingRequired = REQUIRED_EVENT_HEADERS.filter((h) => !headers.includes(h));
    if (missingRequired.length > 0) {
        return {
            athletes: [],
            fileErrors: [
                {
                    row: 1,
                    message: `Missing required columns: ${missingRequired.join(", ")}`,
                },
            ],
            warnings: [],
            headers,
        };
    }
    const warnings = [];
    if (!metricColumnsPresent(headers)) {
        warnings.push("No showcase metric columns detected (e.g. 60-time, exit-velocity). Rows may fail matching.");
    }
    const athletes = [];
    const fileErrors = [];
    const seenUuid = new Set();
    for (let i = 1; i < grid.length; i++) {
        const rowNum = i + 1;
        const record = rowToRecord(headers, grid[i]);
        const athleteUuid = cell(record, "athlete_uuid");
        if (!athleteUuid) {
            fileErrors.push({ row: rowNum, message: "Missing athlete_uuid" });
            continue;
        }
        if (seenUuid.has(athleteUuid)) {
            fileErrors.push({
                row: rowNum,
                message: `Duplicate athlete_uuid in file: ${athleteUuid}`,
            });
            continue;
        }
        seenUuid.add(athleteUuid);
        const eventName = cell(record, "event_name") ?? "";
        const eventStartDate = cell(record, "event_start_date") ?? "";
        const primaryPosition = cell(record, "primary_position") ?? "";
        const parseErrors = [];
        if (!eventName)
            parseErrors.push("event_name is empty");
        if (!eventStartDate)
            parseErrors.push("event_start_date is empty");
        if (!primaryPosition)
            parseErrors.push("primary_position is empty");
        const gradNum = Number(record.grad_year?.trim());
        const gradYear = Number.isFinite(gradNum) && gradNum >= 2000 && gradNum <= 2040
            ? Math.trunc(gradNum)
            : undefined;
        if (gradYear === undefined)
            parseErrors.push("Invalid grad_year");
        const { request, errors: mapErrors } = buildMatchRequestFromEventRow(record);
        parseErrors.push(...mapErrors);
        athletes.push({
            rowIndex: i,
            athleteUuid,
            eventName,
            eventStartDate,
            eventDivision: cell(record, "event_division"),
            eventLevel: cell(record, "event_level"),
            orderDate: cell(record, "order_date"),
            firstName: cell(record, "first_name"),
            lastName: cell(record, "last_name"),
            playerId: cell(record, "player_id")?.trim() || undefined,
            athleteUrl: cell(record, "athlete_url"),
            primaryPosition,
            gradYear,
            rawRow: record,
            parseErrors,
            matchRequest: parseErrors.length === 0 ? request : undefined,
        });
    }
    if (athletes.length === 0 && fileErrors.length === 0) {
        fileErrors.push({ row: 0, message: "No valid athlete rows found" });
    }
    return { athletes, fileErrors, warnings, headers };
}
/** Showcase sync export: Event ID, Event Name, ID (Playbook player id), metrics, etc. */
export const SYNC_EVENT_REQUIRED_HEADERS = [
    "event_id",
    "event_name",
    "id",
];
export function isSyncEventExportFormat(headers) {
    return (headers.includes("event_id") &&
        headers.includes("event_name") &&
        headers.includes("id") &&
        !headers.includes("athlete_uuid"));
}
/** Pull a date like 6/7/26 from "Showcase Name (6/7/26)" */
export function extractEventDateFromName(eventName) {
    const match = eventName.match(/\((\d{1,2}\/\d{1,2}\/\d{2,4})\)/);
    return match?.[1];
}
export function parseSyncEventExportCsv(csvText) {
    if (Buffer.byteLength(csvText, "utf8") > MAX_CSV_BYTES) {
        return {
            athletes: [],
            fileErrors: [{ row: 0, message: "File exceeds 5MB limit" }],
            warnings: [],
            headers: [],
        };
    }
    const grid = parseCsvGrid(csvText);
    if (grid.length < 2) {
        return {
            athletes: [],
            fileErrors: [
                {
                    row: 0,
                    message: "CSV must include a header row and at least one data row",
                },
            ],
            warnings: [],
            headers: [],
        };
    }
    const headers = dedupeHeaders(grid[0].map(normalizeCsvHeader));
    const missingRequired = SYNC_EVENT_REQUIRED_HEADERS.filter((h) => !headers.includes(h));
    if (missingRequired.length > 0) {
        return {
            athletes: [],
            fileErrors: [
                {
                    row: 1,
                    message: `Missing required columns: ${missingRequired.join(", ")} (expected Event ID, Event Name, ID)`,
                },
            ],
            warnings: [],
            headers,
        };
    }
    const warnings = [];
    if (!metricColumnsPresent(headers)) {
        warnings.push("No showcase metric columns detected (e.g. 60-time, exit-velocity). Rows may fail matching.");
    }
    const athletes = [];
    const fileErrors = [];
    const seenUuid = new Set();
    for (let i = 1; i < grid.length; i++) {
        const rowNum = i + 1;
        const record = rowToRecord(headers, grid[i]);
        const eventId = cell(record, "event_id");
        if (!eventId) {
            fileErrors.push({ row: rowNum, message: "Missing Event ID" });
            continue;
        }
        const playerId = cell(record, "id");
        if (!playerId) {
            fileErrors.push({ row: rowNum, message: "Missing player ID" });
            continue;
        }
        const athleteUuid = `${eventId}:${playerId}`;
        if (seenUuid.has(athleteUuid)) {
            fileErrors.push({
                row: rowNum,
                message: `Duplicate event/player in file: ${eventId} / ${playerId}`,
            });
            continue;
        }
        seenUuid.add(athleteUuid);
        const eventName = cell(record, "event_name") ?? "";
        const eventStartDate = extractEventDateFromName(eventName) ?? "";
        const primaryPosition = cell(record, "primary_position") ?? "";
        const gradNum = Number(record.grad_year?.trim());
        const gradYear = Number.isFinite(gradNum) && gradNum >= 2000 && gradNum <= 2040
            ? Math.trunc(gradNum)
            : undefined;
        const normalizedRow = {
            ...record,
            event_name: eventName,
            event_start_date: eventStartDate,
            athlete_uuid: athleteUuid,
            player_id: playerId,
            primary_position: primaryPosition,
            grad_year: gradYear !== undefined ? String(gradYear) : record.grad_year ?? "",
        };
        const parseErrors = [];
        if (!eventName)
            parseErrors.push("event_name is empty");
        if (!eventStartDate) {
            parseErrors.push("event_start_date is empty (add a date in parentheses in Event Name, e.g. Showcase (6/7/26))");
        }
        if (!primaryPosition) {
            parseErrors.push("primary_position is empty (will use Playbook profile when linked)");
        }
        if (gradYear === undefined) {
            parseErrors.push("grad_year is missing (will use Playbook profile when linked)");
        }
        const { request, errors: mapErrors } = buildMatchRequestFromEventRow(normalizedRow);
        const metricErrors = mapErrors.filter((e) => e !== "primary_position is required" && !e.startsWith("grad_year"));
        parseErrors.push(...metricErrors);
        athletes.push({
            rowIndex: i,
            athleteUuid,
            eventName,
            eventStartDate,
            eventDivision: cell(record, "event_division"),
            eventLevel: cell(record, "event_level"),
            orderDate: cell(record, "order_date"),
            firstName: cell(record, "first_name"),
            lastName: cell(record, "last_name"),
            playerId,
            athleteUrl: cell(record, "athlete_url"),
            primaryPosition: primaryPosition || "UNKNOWN",
            gradYear,
            rawRow: normalizedRow,
            parseErrors,
            matchRequest: parseErrors.filter((e) => !e.includes("will use Playbook")).length === 0
                ? request
                : undefined,
        });
    }
    if (athletes.length === 0 && fileErrors.length === 0) {
        fileErrors.push({ row: 0, message: "No valid event rows found" });
    }
    return { athletes, fileErrors, warnings, headers };
}
export { displayNameFromRow };
