import Shelter from "./shelter/Shelter";

export default function Sidebar() {
  return (
    <aside className="min-h-0 p-3 pb-0 lg:h-full lg:p-4 lg:pr-3">
      <div className="border-border/70 bg-card/95 flex h-full flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        <header className="border-border/70 space-y-1 border-b pb-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
            ARUS Evacuation Planner
          </p>
          <h1 className="text-xl font-semibold">Shelter Coverage Design</h1>
          <p className="text-muted-foreground text-sm">
            Plan safer evacuation access using travel-time areas (isochrones)
            and map-based shelter placement.
          </p>
        </header>
        <div className="min-h-0 flex-1 pt-3">
          <Shelter />
        </div>
      </div>
    </aside>
  );
}
