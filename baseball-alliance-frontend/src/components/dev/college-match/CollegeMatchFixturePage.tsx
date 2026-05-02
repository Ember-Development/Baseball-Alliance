import { useState } from "react";
import { MatchFixturePanel } from "./MatchFixturePanel";
import { ProgramsExplorer } from "./ProgramsExplorer";
import { Search, Target } from "lucide-react";

type View = "match" | "explore";

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-[#163968] text-[#163968]"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function CollegeMatchFixturePage() {
  const [view, setView] = useState<View>("match");

  return (
    <div className="min-h-screen bg-slate-50 pt-[80px]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-[#163968] tracking-tight">
              BAMS
            </h1>
            <span className="text-sm text-slate-400 font-medium">
              Baseball Alliance Matching System
            </span>
          </div>
          <nav className="flex gap-1 -mb-px">
            <TabButton
              active={view === "match"}
              onClick={() => setView("match")}
              icon={<Target className="w-4 h-4" />}
              label="Find Your Match"
            />
            <TabButton
              active={view === "explore"}
              onClick={() => setView("explore")}
              icon={<Search className="w-4 h-4" />}
              label="Explore Programs"
            />
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "match" ? <MatchFixturePanel /> : <ProgramsExplorer />}
      </main>
    </div>
  );
}
