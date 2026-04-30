import type { ZodError } from "zod";

export type FieldErrorItem = {
  path: string[];
  messages: string[];
};

export type ValidationDetails = {
  formErrors: string[];
  fieldErrors: FieldErrorItem[];
};

/** Shape aligned with college-match-service: formErrors + fieldErrors (path + messages). */
export function zodErrorToDetails(err: ZodError): ValidationDetails {
  const issueMap = new Map<string, string[]>();
  for (const issue of err.issues) {
    const pathKey =
      issue.path.length === 0 ? "" : issue.path.map(String).join(".");
    const key = pathKey === "" ? "__root__" : pathKey;
    const list = issueMap.get(key) ?? [];
    list.push(issue.message);
    issueMap.set(key, list);
  }

  const flat = err.flatten();
  const formErrors = [...flat.formErrors];
  const rootMsgs = issueMap.get("__root__");
  if (rootMsgs) formErrors.push(...rootMsgs);

  const fieldErrors: FieldErrorItem[] = [];
  for (const [key, messages] of issueMap) {
    if (key === "__root__") continue;
    fieldErrors.push({
      path: key.split(".").filter(Boolean),
      messages,
    });
  }

  return { formErrors, fieldErrors };
}

export function validationFailed(details: ValidationDetails) {
  return { error: "Validation failed", details };
}
