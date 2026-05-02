import React, { useEffect, useRef, useState } from "react";
import { useLiveSiteConfig } from "../../context/SiteEditModeContext";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Tag to render. Defaults to span. */
  as?: React.ElementType;
  className?: string;
  /** Allow line breaks. Renders with whiteSpace: pre-line. Enter inserts \n. */
  multiline?: boolean;
  /** Placeholder shown when empty in edit mode. */
  placeholder?: string;
  /** Optional fallback to render in view mode when value is empty. */
  fallback?: React.ReactNode;
  /** Inline style passthrough. */
  style?: React.CSSProperties;
};

/**
 * Click-to-edit text. In view mode renders a normal element with the value.
 * In admin "content edit" mode it becomes contentEditable with a dashed
 * outline; on blur it commits the change to the draft.
 */
const EditableText: React.FC<Props> = ({
  value,
  onChange,
  as = "span",
  className,
  multiline,
  placeholder,
  fallback,
  style,
}) => {
  const { isContentEditUI } = useLiveSiteConfig();
  const ref = useRef<HTMLElement | null>(null);
  // Snapshot the value once for the initial mount so React never re-renders
  // children of the contentEditable element (which would clobber the caret).
  const [initialValue] = useState(() => value ?? "");

  useEffect(() => {
    if (!isContentEditUI) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const next = value ?? "";
    if (el.innerText !== next) {
      el.innerText = next;
      el.setAttribute("data-empty", next.length === 0 ? "true" : "false");
    }
  }, [value, isContentEditUI]);

  const Tag = as as React.ElementType;
  const wsStyle: React.CSSProperties | undefined = multiline
    ? { whiteSpace: "pre-line", ...style }
    : style;

  if (!isContentEditUI) {
    if (!value && fallback != null) {
      return (
        <Tag className={className} style={wsStyle}>
          {fallback}
        </Tag>
      );
    }
    return (
      <Tag className={className} style={wsStyle}>
        {value || ""}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      key={isContentEditUI ? "edit" : "view"}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      data-cms-editable="true"
      data-empty={value ? "false" : "true"}
      data-placeholder={placeholder ?? ""}
      spellCheck
      className={className}
      style={wsStyle}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        const el = e.currentTarget;
        el.setAttribute(
          "data-empty",
          el.innerText.length === 0 ? "true" : "false"
        );
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const el = e.currentTarget;
        // Normalize: contentEditable can produce \u00A0 (NBSP); convert to space.
        let next = (el.innerText ?? "").replace(/\u00A0/g, " ");
        if (!multiline) next = next.replace(/\s+/g, " ").trim();
        else next = next.replace(/[\t ]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
        if (next !== value) onChange(next);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          const el = e.currentTarget;
          el.innerText = value ?? "";
          el.blur();
        }
      }}
    >
      {initialValue}
    </Tag>
  );
};

export default EditableText;
