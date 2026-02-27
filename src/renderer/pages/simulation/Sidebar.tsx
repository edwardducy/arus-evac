import { Flag, House, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";
import Shelter from "./shelter/Shelter";

type SidebarTab = "scenario" | "shelter" | "population" | "hazards";

const NAV_ITEMS: Array<{
  description: string;
  icon: LucideIcon;
  id: SidebarTab;
  label: string;
}> = [
  {
    description: "Configure evacuation assumptions and operating mode.",
    icon: Flag,
    id: "scenario",
    label: "Scenario",
  },
  {
    description: "Plan safer shelter placement with travel-time coverage.",
    icon: House,
    id: "shelter",
    label: "Shelter",
  },
  {
    description: "Track affected households and movement demand.",
    icon: Users,
    id: "population",
    label: "Population",
  },
  {
    description: "Assess weather and environmental hazard overlays.",
    icon: TriangleAlert,
    id: "hazards",
    label: "Hazards",
  },
];

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("shelter");
  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0];

  return (
    <aside className="min-h-0 p-3 pb-0 lg:h-full lg:p-4 lg:pr-3">
      <div className="border-border/70 bg-card/95 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-[0_16px_42px_-22px_rgba(2,6,23,0.75)] backdrop-blur-sm lg:flex-row">
        <nav className="border-border/70 flex shrink-0 flex-row gap-2 border-b p-3 lg:w-36 lg:flex-col lg:gap-1 lg:border-r lg:border-b-0 lg:p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;

            return (
              <button
                type="button"
                key={item.id}
                className={`group flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors lg:flex-none ${
                  isActive
                    ? "border-primary/60 bg-primary/20 text-foreground"
                    : "border-transparent bg-background/30 text-muted-foreground hover:border-border/80 hover:bg-secondary/55 hover:text-foreground"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <header className="border-border/70 space-y-1 border-b pb-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
              ARUS Evacuation Planner
            </p>
            <h1 className="text-xl font-semibold">{activeItem.label}</h1>
            <p className="text-muted-foreground text-sm">{activeItem.description}</p>
          </header>

          <div className="min-h-0 flex-1 pt-3">
            {activeTab === "shelter" ? (
              <Shelter />
            ) : (
              <div className="border-border/70 bg-secondary/35 flex h-full items-center justify-center rounded-xl border border-dashed p-5 text-center">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {activeItem.label} panel is ready for controls and data widgets.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
