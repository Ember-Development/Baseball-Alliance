type Props = {
  title: string;
  json: string | null;
  className?: string;
};

export function JsonDisclosure({ title, json, className = "" }: Props) {
  if (!json) return null;
  return (
    <details className={`rounded-lg border border-black/10 bg-slate-50 ${className}`}>
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-[#163968]">
        {title}
      </summary>
      <pre className="text-xs p-3 border-t border-black/5 overflow-auto max-h-80">
        {json}
      </pre>
    </details>
  );
}
