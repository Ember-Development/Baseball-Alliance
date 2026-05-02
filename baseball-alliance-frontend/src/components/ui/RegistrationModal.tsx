// src/components/RegistrationModal.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  cloneElement,
  isValidElement,
} from "react";
import { generateHeightOptions } from "../../utils/height";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: FormDataShape) => void;
};

type FormDataShape = {
  // player
  playerFullName: string;
  dob: string; // yyyy-mm-dd
  city: string;
  state: string;
  zip: string;
  playerPhone: string;
  playerEmail: string;

  // parent/guardian (required if < 18; consent required if < 13)
  parentFullName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentConsentUnder13?: boolean;

  // emergency
  emergencyName: string;
  emergencyPhone: string;

  // baseball
  primaryPosition: string;
  secondaryPosition?: string;
  bats: "Right" | "Left" | "Switch" | "";
  throws: "Right" | "Left" | "Switch" | "";
  height: string; // e.g. 5'11"
  weight: string; // lb or kg (text to keep it simple)

  // school/team
  gradYear: string; // HS or JUCO year
  schoolName: string;
  schoolLocation: string;
  clubTeam?: string;
  coachName?: string;
  coachContact?: string;

  // gear
  shirtSize: "YS" | "YM" | "YL" | "S" | "M" | "L" | "XL" | "XXL" | "";
  agreeToWaiver?: boolean;
  privacyAck?: boolean;

  // grade
  schoolGrade:
    | ""
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12"
    | "JUCO";
};

const initialData: FormDataShape = {
  playerFullName: "",
  dob: "",
  city: "",
  state: "",
  zip: "",
  playerPhone: "",
  playerEmail: "",

  parentFullName: "",
  parentPhone: "",
  parentEmail: "",
  parentConsentUnder13: false,

  emergencyName: "",
  emergencyPhone: "",

  primaryPosition: "",
  secondaryPosition: "",
  bats: "",
  throws: "",
  height: "",
  weight: "",

  gradYear: "",
  schoolGrade: "",
  schoolName: "",
  schoolLocation: "",
  clubTeam: "",
  coachName: "",
  coachContact: "",

  shirtSize: "",
  agreeToWaiver: false,
  privacyAck: false,
};

function getAge(dobIso: string) {
  if (!dobIso) return null;
  const d = new Date(dobIso);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

const stepTitles = [
  "Player",
  "Contacts",
  "Baseball Info",
  "School / Team",
  "Gear",
  "Review",
];

type SubView = null | "waiver" | "privacy";

export default function RegistrationModal({ open, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormDataShape>(initialData);
  const [subView, setSubView] = useState<SubView>(null);

  const age = useMemo(() => getAge(data.dob), [data.dob]);
  const isMinor = age !== null ? age < 18 : true;
  const isUnder13 = age !== null ? age < 13 : false;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Only reset when transitioning from closed -> open
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setStep(0);
      setData(initialData);
    }
    wasOpenRef.current = open;
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const next = () => setStep((s) => Math.min(s + 1, stepTitles.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Simple required checks per step
  const stepValid = () => {
    switch (step) {
      case 0: {
        // Player
        const base =
          data.playerFullName &&
          data.dob &&
          data.city &&
          data.state &&
          data.zip &&
          data.playerPhone;
        const emailsOk = isMinor
          ? // COPPA: If under 13, parent email required; under 18, player OR parent email allowed (collect both if possible)
            isUnder13
            ? data.parentEmail
            : data.playerEmail || data.parentEmail
          : data.playerEmail;
        const consentOk = isUnder13 ? !!data.parentConsentUnder13 : true;
        return !!(base && emailsOk && consentOk);
      }
      case 1: {
        // Contacts
        const emergencyOk = data.emergencyName && data.emergencyPhone;
        const parentOk = isMinor
          ? data.parentFullName && data.parentPhone
          : true;
        return !!(emergencyOk && parentOk);
      }
      case 2: {
        // Baseball
        return !!(
          data.primaryPosition &&
          data.bats &&
          data.throws &&
          data.height &&
          data.weight
        );
      }
      case 3: {
        // School / Team
        const gradeNum = parseInt(data.schoolGrade || "0", 10);

        return !!(
          data.gradYear &&
          data.schoolGrade &&
          (gradeNum < 9 || (data.schoolName && data.schoolLocation))
        );
      }
      case 4: {
        // Gear
        return !!data.shirtSize;
      }
      case 5: {
        // Review / legal acknowledgements
        return !!(data.agreeToWaiver && data.privacyAck);
      }
      default:
        return true;
    }
  };

  const submit = () => {
    if (!stepValid()) return;
    onSubmit?.(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop (pointer-down closes) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onPointerDown={onClose}
      />

      {/* Dialog (stop propagation so backdrop never sees inner events) */}
      <div
        ref={dialogRef}
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-[61] w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#163968]">
              Combine Registration
            </h2>
            <p className="text-xs text-black/60">
              Step {step + 1} of {stepTitles.length}: {stepTitles[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-full border border-black/10 text-[#163968] bg-white hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        {/* Stepper bar */}
        <div className="mt-3 grid grid-cols-6 gap-1">
          {stepTitles.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${
                i <= step ? "bg-[#163968]" : "bg-black/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* STEP 0: Player (COPPA-aware) */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Player Full Name" required>
                <Input
                  value={data.playerFullName}
                  onChange={(e) =>
                    setData({ ...data, playerFullName: e.target.value })
                  }
                  placeholder="First Last"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Date of Birth" required>
                  <Input
                    type="date"
                    value={data.dob}
                    onChange={(e) => setData({ ...data, dob: e.target.value })}
                  />
                </Field>
                <Field label="Graduation Year" required>
                  <Input
                    value={data.gradYear}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    onChange={(e) =>
                      setData({ ...data, gradYear: e.target.value })
                    }
                    placeholder="2026 (HS) / 2025 (JUCO)"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="City" required>
                  <Input
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                  />
                </Field>
                <Field label="State" required>
                  <Select
                    value={data.state}
                    onChange={(e) =>
                      setData({ ...data, state: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    {[
                      "AL",
                      "AK",
                      "AZ",
                      "AR",
                      "CA",
                      "CO",
                      "CT",
                      "DE",
                      "FL",
                      "GA",
                      "HI",
                      "ID",
                      "IL",
                      "IN",
                      "IA",
                      "KS",
                      "KY",
                      "LA",
                      "ME",
                      "MD",
                      "MA",
                      "MI",
                      "MN",
                      "MS",
                      "MO",
                      "MT",
                      "NE",
                      "NV",
                      "NH",
                      "NJ",
                      "NM",
                      "NY",
                      "NC",
                      "ND",
                      "OH",
                      "OK",
                      "OR",
                      "PA",
                      "RI",
                      "SC",
                      "SD",
                      "TN",
                      "TX",
                      "UT",
                      "VT",
                      "VA",
                      "WA",
                      "WV",
                      "WI",
                      "WY",
                    ].map((abbr) => (
                      <option key={abbr} value={abbr}>
                        {abbr}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="ZIP" required>
                  <Input
                    value={data.zip}
                    onChange={(e) => setData({ ...data, zip: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Player Mobile" required>
                  <Input
                    value={data.playerPhone}
                    onChange={(e) =>
                      setData({ ...data, playerPhone: e.target.value })
                    }
                    placeholder="(555) 555-5555"
                  />
                </Field>
                <Field
                  label={isMinor ? "Player Email (Optional)" : "Player Email"}
                  required={!isMinor}
                >
                  <Input
                    type="email"
                    value={data.playerEmail}
                    onChange={(e) =>
                      setData({ ...data, playerEmail: e.target.value })
                    }
                    placeholder="player@email.com"
                  />
                </Field>
              </div>

              {/* Parental info triggers by age */}
              {isMinor && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Parent/Guardian Full Name" required>
                      <Input
                        value={data.parentFullName || ""}
                        onChange={(e) =>
                          setData({ ...data, parentFullName: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Parent/Guardian Phone" required>
                      <Input
                        value={data.parentPhone || ""}
                        onChange={(e) =>
                          setData({ ...data, parentPhone: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label={
                      isUnder13
                        ? "Parent/Guardian Email (required by COPPA)"
                        : "Parent/Guardian Email"
                    }
                    required={isUnder13}
                    note={
                      isUnder13
                        ? "Under 13 requires verifiable parent contact and consent."
                        : undefined
                    }
                  >
                    <Input
                      type="email"
                      value={data.parentEmail || ""}
                      onChange={(e) =>
                        setData({ ...data, parentEmail: e.target.value })
                      }
                    />
                  </Field>
                  {isUnder13 && (
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!data.parentConsentUnder13}
                        onChange={(e) =>
                          setData({
                            ...data,
                            parentConsentUnder13: e.target.checked,
                          })
                        }
                        className="mt-1"
                      />
                      <span className="text-black/80">
                        I am the parent/guardian and consent to the collection
                        of this information for the purpose of event
                        registration.
                      </span>
                    </label>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 1: Contacts */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Emergency Contact Name" required>
                <Input
                  value={data.emergencyName}
                  onChange={(e) =>
                    setData({ ...data, emergencyName: e.target.value })
                  }
                />
              </Field>
              <Field label="Emergency Contact Phone" required>
                <Input
                  value={data.emergencyPhone}
                  onChange={(e) =>
                    setData({ ...data, emergencyPhone: e.target.value })
                  }
                />
              </Field>
              {!isMinor && (
                <p className="text-xs text-black/60">
                  If the registrant is under 18, parent/guardian details are
                  collected in Step 1.
                </p>
              )}
            </div>
          )}

          {/* STEP 2: Baseball Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Primary Position" required>
                  <Select
                    value={data.primaryPosition}
                    onChange={(e) =>
                      setData({ ...data, primaryPosition: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    {[
                      "P",
                      "C",
                      "1B",
                      "2B",
                      "3B",
                      "SS",
                      "LF",
                      "CF",
                      "RF",
                      "UTL",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Secondary Position">
                  <Select
                    value={data.secondaryPosition}
                    onChange={(e) =>
                      setData({ ...data, secondaryPosition: e.target.value })
                    }
                  >
                    <option value="">None</option>
                    {[
                      "P",
                      "C",
                      "1B",
                      "2B",
                      "3B",
                      "SS",
                      "LF",
                      "CF",
                      "RF",
                      "UTL",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bats" required>
                  <Select
                    value={data.bats}
                    onChange={(e) =>
                      setData({ ...data, bats: e.target.value as any })
                    }
                  >
                    <option value="">Select…</option>
                    <option>Right</option>
                    <option>Left</option>
                    <option>Switch</option>
                  </Select>
                </Field>
                <Field label="Throws" required>
                  <Select
                    value={data.throws}
                    onChange={(e) =>
                      setData({ ...data, throws: e.target.value as any })
                    }
                  >
                    <option value="">Select…</option>
                    <option>Right</option>
                    <option>Left</option>
                    <option>Switch</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Height" required note={`e.g., 5'11" or 180 cm`}>
                  <Select
                    value={data.height}
                    onChange={(e) =>
                      setData({ ...data, height: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    {generateHeightOptions().map(({ feet, inches, cm }) => (
                      <option
                        key={`${feet}-${inches}`}
                        value={`${feet}'${inches}"`}
                      >
                        {feet}'{inches}" ({cm} cm)
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Weight" required note="e.g., 175 lb or 79 kg">
                  <Input
                    value={data.weight}
                    onChange={(e) =>
                      setData({ ...data, weight: e.target.value })
                    }
                    placeholder="175 lb"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3: School / Team */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Grade dropdown */}
              <Field label="Grade" required>
                <Select
                  value={data.schoolGrade}
                  onChange={(e) => {
                    const next = e.target.value;
                    const gradeNum = parseInt(next || "0", 10);
                    setData({
                      ...data,
                      schoolGrade: next as any,
                      ...(gradeNum < 9
                        ? { schoolName: "", schoolLocation: "" }
                        : {}),
                    });
                  }}
                >
                  <option value="">Select…</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
                    (g) => (
                      <option key={g} value={g}>
                        {Number(g) <= 6
                          ? `${g} (Elementary)`
                          : Number(g) <= 8
                          ? `${g} (Middle School)`
                          : `${g} (High School)`}
                      </option>
                    )
                  )}
                  <option value="JUCO">JUCO (Higher)</option>
                </Select>
              </Field>

              {/* Only ask for School / Location if grade is 9th or higher */}
              {((parseInt(data.schoolGrade || "0", 10) >= 9 &&
                parseInt(data.schoolGrade || "0", 10) <= 12) ||
                data.schoolGrade === "JUCO") && (
                <>
                  <Field label="School Name" required>
                    <Input
                      value={data.schoolName}
                      onChange={(e) =>
                        setData({ ...data, schoolName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="School Location (City, State)" required>
                    <Input
                      value={data.schoolLocation}
                      onChange={(e) =>
                        setData({ ...data, schoolLocation: e.target.value })
                      }
                      placeholder="Waco, TX"
                    />
                  </Field>
                </>
              )}
              <Field label="Current Travel/Club Team">
                <Input
                  value={data.clubTeam || ""}
                  onChange={(e) =>
                    setData({ ...data, clubTeam: e.target.value })
                  }
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Coach’s Name (optional)">
                  <Input
                    value={data.coachName || ""}
                    onChange={(e) =>
                      setData({ ...data, coachName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Coach’s Contact (optional)">
                  <Input
                    value={data.coachContact || ""}
                    onChange={(e) =>
                      setData({ ...data, coachContact: e.target.value })
                    }
                    placeholder="email or phone"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 4: Gear */}
          {step === 4 && (
            <div className="space-y-4">
              <Field label="Uniform/Shirt Size" required>
                <Select
                  value={data.shirtSize}
                  onChange={(e) =>
                    setData({ ...data, shirtSize: e.target.value as any })
                  }
                >
                  <option value="">Select…</option>
                  <option value="YS">Youth Small</option>
                  <option value="YM">Youth Medium</option>
                  <option value="YL">Youth Large</option>
                  <option value="S">Adult Small</option>
                  <option value="M">Adult Medium</option>
                  <option value="L">Adult Large</option>
                  <option value="XL">Adult XL</option>
                  <option value="XXL">Adult XXL</option>
                </Select>
              </Field>
            </div>
          )}

          {/* STEP 5: Review & Acknowledge */}
          {step === 5 && subView === null && (
            <div className="space-y-3">
              <p className="text-sm text-black/70">
                Please review your information. You can go back to make changes.
              </p>
              <Review data={data} isMinor={isMinor} isUnder13={isUnder13} />

              <label className="flex items-start gap-2 text-sm mt-3">
                <input
                  type="checkbox"
                  checked={!!data.agreeToWaiver}
                  onChange={(e) =>
                    setData({ ...data, agreeToWaiver: e.target.checked })
                  }
                  className="mt-1"
                />
                <span className="text-black/80">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setSubView("waiver")}
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    event waiver
                  </button>
                  .
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!data.privacyAck}
                  onChange={(e) =>
                    setData({ ...data, privacyAck: e.target.checked })
                  }
                  className="mt-1"
                />
                <span className="text-black/80">
                  I have read the{" "}
                  <button
                    type="button"
                    onClick={() => setSubView("privacy")}
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    privacy policy
                  </button>{" "}
                  and consent to the processing of my information for
                  registration and event operations.
                </span>
              </label>
            </div>
          )}

          {subView === "waiver" && (
            <div className="space-y-3">
              <button
                onClick={() => setSubView(null)}
                className="mb-4 text-sm underline text-blue-600 hover:text-blue-800"
              >
                ← Back to Review
              </button>
              <WaiverContent />
            </div>
          )}

          {subView === "privacy" && (
            <div className="space-y-3">
              <button
                onClick={() => setSubView(null)}
                className="mb-4 text-sm underline text-blue-600 hover:text-blue-800"
              >
                ← Back to Review
              </button>
              <PrivacyContent />
            </div>
          )}
        </div>

        {/* Footer actions */}
        {subView === null && (
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={step === 0 ? onClose : back}
              className="h-10 px-4 rounded-lg border border-black/15 bg-white hover:bg-black/5 text-[#163968] font-semibold"
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < stepTitles.length - 1 ? (
              <button
                onClick={() => stepValid() && next()}
                className={`h-10 px-4 rounded-lg font-semibold text-white transition ${
                  stepValid()
                    ? "bg-[#163968] hover:brightness-110"
                    : "bg-[#163968]/50 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                className={`h-10 px-4 rounded-lg font-semibold text-white transition ${
                  stepValid()
                    ? "bg-[#163968] hover:brightness-110"
                    : "bg-[#163968]/50 cursor-not-allowed"
                }`}
              >
                Continue to Payment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Field: separate <label htmlFor> with stable id, no wrapping of inputs */
function Field({
  label,
  children,
  required,
  note,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  note?: string;
}) {
  const id = useId();
  const childWithId = isValidElement(children)
    ? cloneElement(children as any, { id })
    : children;

  return (
    <div className="block">
      <label htmlFor={id} className="text-sm font-semibold text-[#163968]">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-1">{childWithId}</div>
      {note && <p className="mt-1 text-xs text-black/60">{note}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-black/15 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#163968] focus:border-transparent"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-black/15 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#163968] focus:border-transparent"
    />
  );
}

// Compact review section
function Review({
  data,
  isMinor,
  isUnder13,
}: {
  data: FormDataShape;
  isMinor: boolean;
  isUnder13: boolean;
}) {
  const Row = ({
    label,
    value,
  }: {
    label: string;
    value?: string | boolean;
  }) => (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-black/60">{label}</span>
      <span className="font-medium text-[#163968] text-right">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—"}
      </span>
    </div>
  );
  return (
    <div className="rounded-lg border border-black/10 bg-black/5 p-3 space-y-2">
      <Row label="Player" value={data.playerFullName} />
      <Row label="DOB" value={data.dob} />
      <Row
        label="City/State/ZIP"
        value={`${data.city}, ${data.state} ${data.zip}`}
      />
      <Row label="Player Mobile" value={data.playerPhone} />
      <Row label="Player Email" value={data.playerEmail} />
      {isMinor && (
        <>
          <Row label="Parent/Guardian" value={data.parentFullName} />
          <Row label="Parent Phone" value={data.parentPhone} />
          <Row label="Parent Email" value={data.parentEmail} />
          {isUnder13 && (
            <Row label="Under 13 Consent" value={!!data.parentConsentUnder13} />
          )}
        </>
      )}
      <Row
        label="Emergency Contact"
        value={`${data.emergencyName} • ${data.emergencyPhone}`}
      />
      <Row
        label="Positions"
        value={`${data.primaryPosition}${
          data.secondaryPosition ? " / " + data.secondaryPosition : ""
        }`}
      />
      <Row label="Bats / Throws" value={`${data.bats} / ${data.throws}`} />
      <Row label="Height / Weight" value={`${data.height} / ${data.weight}`} />
      <Row label="Grad Year" value={data.gradYear} />
      <Row
        label="School"
        value={`${data.schoolName} • ${data.schoolLocation}`}
      />
      <Row label="Club Team" value={data.clubTeam} />
      <Row
        label="Coach (opt.)"
        value={`${data.coachName || ""} ${
          data.coachContact ? "• " + data.coachContact : ""
        }`}
      />
      <Row label="Shirt Size" value={data.shirtSize} />
    </div>
  );
}

function WaiverContent() {
  return (
    <article className="prose max-w-none prose-sm sm:prose-base">
      <h3 className="text-[#163968]">Baseball Alliance LLC – Formal Waiver</h3>
      <section>
        <p className="leading-relaxed text-[#1E1E1E] font-semibold">
          Event Release, Waiver of Liability &amp; Indemnity Agreement
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          <span className="font-semibold">Media Consent Agreement</span> —
          Please read carefully.
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          In consideration for, and as a condition of, my participation in all
          tournaments, games, showcases, practices, and related activities
          (“Events”) organized by Baseball Alliance LLC (“BA”), I knowingly and
          voluntarily agree to the following:
        </p>
      </section>

      {/* 1. Release & Indemnification */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          1. Release &amp; Indemnification
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I release and agree to indemnify BA, along with its owners, employees,
          volunteers, sponsors, advertisers, parent companies, subsidiaries,
          affiliates, DBAs, agents, insurers, facility owners, promoters,
          vendors, service providers, and independent contractors (“Releasees”)
          from all responsibility or liability for anything that occurs during
          the Event(s).
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          This release covers my participation in the Event(s), my use of any
          related facilities and services, including pre‑event practices and
          warm‑ups, and post‑event activities.
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          By signing, I acknowledge that I am assuming risk, agreeing not to
          sue, and foregoing legal rights. This agreement applies to all games,
          showcases, practices, and related activities, whether specifically
          listed.
        </p>
      </section>

      {/* 2. Assumption of Risk */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          2. Assumption of Risk
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I understand that baseball and any related Event(s) involve(s)
          inherent risks and dangers, including serious injury or death and
          damage to property. These risks may result from my own actions, the
          actions of others, the rules of play, or facility/equipment conditions
          and may also include unforeseeable risks. I knowingly and voluntarily
          accept all such risks.
        </p>
      </section>

      {/* 3. Medical Consent */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          3. Medical Consent
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          If I require medical care during the Event(s), I consent to treatment
          deemed reasonably necessary by on‑site personnel.
        </p>
      </section>

      {/* 4. Waiver of Claims */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          4. Waiver of Claims
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I waive, release, discharge, hold harmless, and promise not to sue the
          Releasees for any claim arising from my participation, including
          claims based on the Releasees’ own negligence. I also agree to
          indemnify and reimburse the Releasees for any related costs, including
          attorney fees.
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          This waiver covers any claim for injury, death, property damage,
          reputational harm, or business loss, whether caused by negligence or
          otherwise, except for intentional acts specifically directed to harm
          me or my property.
        </p>
      </section>

      {/* 5. Representations */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          5. Representations
        </h2>
        <ul className="mt-2 space-y-2 list-disc list-inside text-[#1E1E1E]">
          <li>
            I am physically fit and competent to participate in the Event(s).
          </li>
          <li>My equipment is safe and suitable.</li>
          <li>I will follow all BA rules.</li>
          <li>
            I accept that BA’s interpretations of rules, penalties, event
            timing, winners, and rankings are final and cannot be challenged
            through litigation.
          </li>
          <li>
            I will comply with any supplemental or amended rules posted in
            Event(s) bulletins or on the BA website.
          </li>
        </ul>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I understand that questioning the integrity of BA’s game, showcase, or
          player metrics results can cause irreparable harm to its reputation
          and may subject me to legal damages.
        </p>
      </section>

      {/* 6. Event Changes */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          6. Event Changes
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I understand that weather or other events outside of BA’s control may
          cause delays, postponements, or cancellations. BA may cancel or
          reschedule at its sole discretion.
        </p>
      </section>

      {/* 7. Media Release */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          7. Media Release
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I understand that the Event(s) may be photographed, videotaped, or
          otherwise recorded. I grant BA full rights to use my name, likeness,
          voice, and/or image in any form, without further payment to me, for
          lawful purposes limited to BA‑specific advertising and promotion.
          Beyond this limited use by BA, I retain ownership of my name,
          likeness, voice, image in any form and data captured by BA at Event(s)
          with respect to any use beyond the limited advertising and promotion
          of BA Event(s).
        </p>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          I waive all claims for invasion of privacy, right of publicity, or
          defamation related to such use.
        </p>
      </section>

      {/* 8. Governing Law */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          8. Governing Law
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          This agreement is governed by the laws of the State of Texas. It is
          the complete and final agreement between me and BA and may be modified
          only in writing signed by all parties.
        </p>
      </section>
    </article>
  );
}

function PrivacyContent() {
  return (
    <article className="prose max-w-none prose-sm sm:prose-base">
      <h3 className="text-[#163968]">Privacy Policy</h3>
      <p className="mt-2 text-sm text-[#1E1E1E]">
        Baseball Alliance (“we,” “our,” “us”) respects your privacy. This
        Privacy Policy explains how we collect, use, and protect your
        information when you visit our website or register for our events.
      </p>
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          1. Information We Collect
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We may collect the following types of information:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
          <li>
            <span className="font-medium">Personal Information:</span> Name,
            email address, phone number, mailing address, date of birth,
            emergency contact information, payment details (processed securely
            via our payment processor).
          </li>
          <li>
            <span className="font-medium">Player Information:</span> Height,
            weight, positions played, graduation year, school/team affiliation,
            athletic stats.
          </li>
          <li>
            <span className="font-medium">Technical Information:</span> IP
            address, browser type, operating system, pages visited, and cookies
            (to improve website functionality).
          </li>
        </ul>
      </section>

      {/* 2. How We Use Your Information */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          2. How We Use Your Information
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We use your information to:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
          <li>Process registrations for events and showcases</li>
          <li>Communicate about event updates, schedules, and changes</li>
          <li>Respond to inquiries and provide customer support</li>
          <li>
            Share player profiles with scouts, recruiters, and coaches (only if
            you consent)
          </li>
          <li>Improve our website and services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      {/* 3. Sharing Your Information */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          3. Sharing Your Information
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We do not sell your personal information. We may share it with:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
          <li>
            Event partners and vendors (only as necessary to run the event)
          </li>
          <li>Scouts, recruiters, or teams (only with your consent)</li>
          <li>
            Service providers who help operate our website, payment processing,
            or communications
          </li>
          <li>Legal authorities if required by law</li>
        </ul>
      </section>

      {/* 4. Cookies & Tracking */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          4. Cookies & Tracking
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We use cookies to improve your browsing experience and analyze site
          traffic. You can disable cookies in your browser settings, but some
          features may not work properly.
        </p>
      </section>

      {/* 5. Data Security */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          5. Data Security
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We take reasonable measures to protect your personal information from
          unauthorized access, use, or disclosure.
        </p>
      </section>

      {/* 6. Your Rights */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          6. Your Rights
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          Depending on your location, you may have the right to:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-[#1E1E1E]">
          <li>Access, update, or delete your personal information</li>
          <li>Opt-out of marketing communications</li>
          <li>Withdraw consent to data sharing at any time</li>
        </ul>
        <p className="mt-3 leading-relaxed text-[#1E1E1E]">
          To exercise these rights, contact us at:{" "}
          <span className="font-medium">[Insert Email Address]</span>.
        </p>
      </section>

      {/* 7. Third-Party Links */}
      <section>
        <h2 className="text-xl text-[#163968] sm:text-2xl font-semibold">
          7. Third-Party Links
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          Our site may contain links to other websites. We are not responsible
          for their privacy practices.
        </p>
      </section>

      {/* 8. Changes to This Policy */}
      <section>
        <h2 className="text-xl sm:text-2xl text-[#163968] font-semibold">
          8. Changes to This Policy
        </h2>
        <p className="mt-2 leading-relaxed text-[#1E1E1E]">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with the updated effective date.
        </p>
      </section>

      {/* 9. Contact Us */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#163968]">
          9. Contact Us
        </h2>
        <address className="mt-3 not-italic rounded-lg text-[#1E1E1E] bg-white/5 ring-1 ring-white/10 p-4 leading-relaxed">
          <div>Baseball Alliance</div>
          <p>Phone: (817) 320-4911</p>
          <p>Customer Service: keith@baseballalliance.co</p>
        </address>
      </section>
    </article>
  );
}
