import { Info } from "lucide-react";
import { MATCH_COPY } from "./matchResultsCopy";

type Props = {
  onScrollToPreferences?: () => void;
};

export default function PreferenceNudge({ onScrollToPreferences }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex items-start gap-2 text-sm text-amber-950">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        {MATCH_COPY.nudge.body}
      </p>
      {onScrollToPreferences && (
        <button
          type="button"
          onClick={onScrollToPreferences}
          className="text-sm font-semibold text-[#163968] hover:underline shrink-0 text-left sm:text-right"
        >
          {MATCH_COPY.nudge.action}
        </button>
      )}
    </div>
  );
}
