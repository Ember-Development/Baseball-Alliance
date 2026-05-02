/** Shape aligned with college-match-service: formErrors + fieldErrors (path + messages). */
export function zodErrorToDetails(err) {
    const issueMap = new Map();
    for (const issue of err.issues) {
        const pathKey = issue.path.length === 0 ? "" : issue.path.map(String).join(".");
        const key = pathKey === "" ? "__root__" : pathKey;
        const list = issueMap.get(key) ?? [];
        list.push(issue.message);
        issueMap.set(key, list);
    }
    const flat = err.flatten();
    const formErrors = [...flat.formErrors];
    const rootMsgs = issueMap.get("__root__");
    if (rootMsgs)
        formErrors.push(...rootMsgs);
    const fieldErrors = [];
    for (const [key, messages] of issueMap) {
        if (key === "__root__")
            continue;
        fieldErrors.push({
            path: key.split(".").filter(Boolean),
            messages,
        });
    }
    return { formErrors, fieldErrors };
}
export function validationFailed(details) {
    return { error: "Validation failed", details };
}
