/** Shared RFC4180-style CSV line parser */
export function normalizeCsvHeader(h) {
    return h
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}
export function parseCsvLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') {
                    cur += '"';
                    i++;
                }
                else {
                    inQuotes = false;
                }
            }
            else {
                cur += ch;
            }
        }
        else if (ch === '"') {
            inQuotes = true;
        }
        else if (ch === ",") {
            out.push(cur.trim());
            cur = "";
        }
        else {
            cur += ch;
        }
    }
    out.push(cur.trim());
    return out;
}
export function parseCsvGrid(text) {
    const lines = text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    return lines.map(parseCsvLine);
}
/** Dedupe duplicate header names (e.g. two player_id columns) — keep first index per key */
export function dedupeHeaders(rawHeaders) {
    const seen = new Map();
    return rawHeaders.map((h) => {
        const key = normalizeCsvHeader(h);
        const n = seen.get(key) ?? 0;
        seen.set(key, n + 1);
        if (n === 0)
            return key;
        return `${key}__dup${n}`;
    });
}
export function rowToRecord(headers, cells) {
    const out = {};
    for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        if (!key || key.includes("__dup"))
            continue;
        const val = cells[i] ?? "";
        if (!(key in out))
            out[key] = val;
    }
    return out;
}
