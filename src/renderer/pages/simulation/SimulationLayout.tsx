import MapLibreMapCanvas from "./map/MapLibreMap";
import Sidebar from "./Sidebar";
import { SimulationProvider } from "./SimulationProvider";

export default function SimulationLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <SimulationProvider>
        <div className="grid h-full grid-rows-[auto_1fr] lg:grid-cols-[minmax(420px,560px)_1fr] lg:grid-rows-1">
          <Sidebar />
          <section className="min-h-0 p-3 pt-0 lg:p-4 lg:pl-0">
            <div className="border-border/70 bg-card/90 relative h-full overflow-hidden rounded-2xl border shadow-[0_16px_42px_-22px_rgba(2,6,23,0.75)] backdrop-blur-sm">
              <MapLibreMapCanvas />
            </div>
          </section>
        </div>
      </SimulationProvider>
    </div>
  );
}
