import { Button } from "@/components/Button";
import { useSimulationContext } from "../SimulationProvider";
import EmptyListPlaceholder from "./EmptyListPlaceholder";

type ListProps = {
  onView: () => void;
  toggle: () => void;
};

export default function List(props: ListProps) {
  const {
    evacuationRun,
    returnHomeRun,
    resetEvacuationSimulation,
    shelters,
    simulationState,
    startAddShelter,
    startEvacuationSimulation,
    startReturnHomePhase,
    startTyphoonPhase,
    typhoonRun,
    viewShelter,
  } = useSimulationContext();
  const averageMinutes =
    shelters.length > 0
      ? Math.round(
          shelters.reduce((sum, shelter) => sum + shelter.radiusMinutes, 0) /
            shelters.length,
        )
      : 0;

  return (
    <div className="border-border/70 bg-background/70 space-y-4 rounded-xl border p-4">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Evacuation Shelters</h2>
        <p className="text-muted-foreground text-sm">
          Manage shelter locations and inspect each travel-time area
          (isochrone).
        </p>
      </div>

      {shelters.length > 0 && (
        <div className="border-border/70 bg-secondary/35 grid grid-cols-3 gap-2 rounded-lg border p-2 text-center text-xs">
          <div className="bg-background rounded-md px-2 py-2">
            <p className="font-semibold">{shelters.length}</p>
            <p className="text-muted-foreground">Shelters</p>
          </div>
          <div className="bg-background rounded-md px-2 py-2">
            <p className="font-semibold">{averageMinutes} min</p>
            <p className="text-muted-foreground">Avg Drive Time</p>
          </div>
          <div className="bg-background rounded-md px-2 py-2">
            <p className="font-semibold">
              {simulationState.selectedShelterId ? "1" : "0"}
            </p>
            <p className="text-muted-foreground">Selected</p>
          </div>
        </div>
      )}

      {shelters.length === 0 ? (
        <EmptyListPlaceholder toggle={props.toggle} />
      ) : (
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              startAddShelter();
              props.toggle();
            }}
            variant="default"
          >
            Add Shelter
          </Button>
          <Button
            className="w-full"
            disabled={evacuationRun.status === "running"}
            onClick={() => {
              startEvacuationSimulation();
            }}
            variant="outline"
          >
            Start Evacuation Simulation
          </Button>
          <Button
            className="w-full"
            disabled={
              typhoonRun.status === "running" || evacuationRun.status === "idle"
            }
            onClick={startTyphoonPhase}
            variant="outline"
          >
            Start Typhoon Phase
          </Button>
          <Button
            className="w-full"
            disabled={
              returnHomeRun.status === "running" ||
              typhoonRun.status === "running"
            }
            onClick={startReturnHomePhase}
            variant="outline"
          >
            Start Return-Home Phase
          </Button>
          {evacuationRun.status !== "idle" && (
            <Button
              className="w-full"
              onClick={resetEvacuationSimulation}
              variant="ghost"
            >
              Reset Simulation
            </Button>
          )}

          {evacuationRun.status !== "idle" && (
            <div className="border-border/70 bg-secondary/25 space-y-1 rounded-lg border p-3 text-xs">
              <p className="font-semibold tracking-wide uppercase">
                Run Status
              </p>
              <p>Status: {evacuationRun.status}</p>
              <p>
                Timeline: {evacuationRun.elapsedSteps}/
                {evacuationRun.totalSteps}
              </p>
              <p>Regions: {evacuationRun.zones.length}</p>
              <p>
                Low compliance areas:{" "}
                {
                  evacuationRun.zones.filter(
                    (zone) => zone.status === "low-compliance",
                  ).length
                }
              </p>
              <p>
                Average compliance:{" "}
                {evacuationRun.zones.length > 0
                  ? `${Math.round(
                      (evacuationRun.zones.reduce(
                        (total, zone) => total + zone.complianceRate,
                        0,
                      ) /
                        evacuationRun.zones.length) *
                        100,
                    )}%`
                  : "0%"}
              </p>
              {evacuationRun.error && (
                <p className="text-amber-700">
                  Simulation warning: {evacuationRun.error}
                </p>
              )}
            </div>
          )}

          {typhoonRun.status !== "idle" && (
            <div className="border-border/70 bg-secondary/25 space-y-1 rounded-lg border p-3 text-xs">
              <p className="font-semibold tracking-wide uppercase">
                Typhoon Status
              </p>
              <p>Status: {typhoonRun.status}</p>
              <p>
                Timeline: {typhoonRun.elapsedSteps}/{typhoonRun.totalSteps}
              </p>
              <p>Safety level: {typhoonRun.safetyLevel}</p>
              <p>Total hazards: {typhoonRun.totalHazards}</p>
              <p>
                Flood areas:{" "}
                {typhoonRun.floodedAreaGeojson?.features?.length || 0}
              </p>
              <p>
                Fallen debris: {typhoonRun.debrisGeojson?.features?.length || 0}
              </p>
              <p>
                Return-home readiness:{" "}
                {typhoonRun.canReturnHome ? "Ready" : "Not ready yet"}
              </p>
              {typhoonRun.error && (
                <p className="text-amber-700">
                  Typhoon warning: {typhoonRun.error}
                </p>
              )}
            </div>
          )}

          {returnHomeRun.status !== "idle" && (
            <div className="border-border/70 bg-secondary/25 space-y-1 rounded-lg border p-3 text-xs">
              <p className="font-semibold tracking-wide uppercase">
                Return Status
              </p>
              <p>Status: {returnHomeRun.status}</p>
              <p>
                Timeline: {returnHomeRun.elapsedSteps}/
                {returnHomeRun.totalSteps}
              </p>
              <p>Zones: {returnHomeRun.zones.length}</p>
              <p>
                Fully returned:{" "}
                {
                  returnHomeRun.zones.filter((zone) => zone.returnProgress >= 1)
                    .length
                }
              </p>
              <p>
                Flood blocked:{" "}
                {
                  returnHomeRun.zones.filter(
                    (zone) => zone.blockedReason === "flooded-area",
                  ).length
                }
              </p>
              <p>
                Debris blocked:{" "}
                {
                  returnHomeRun.zones.filter(
                    (zone) => zone.blockedReason === "debris-on-route",
                  ).length
                }
              </p>
              {returnHomeRun.error && (
                <p className="text-amber-700">
                  Return warning: {returnHomeRun.error}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {shelters.map((shelter) => (
              <button
                className="border-border/70 bg-card hover:bg-secondary/40 w-full cursor-pointer rounded-lg border p-3 text-left text-sm transition-all hover:-translate-y-0.5"
                key={shelter.id}
                onClick={() => {
                  viewShelter(shelter.id);
                  props.onView();
                }}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: `rgb(${shelter.color[0]}, ${shelter.color[1]}, ${shelter.color[2]})`,
                    }}
                  />
                  <p className="font-medium">{shelter.name}</p>
                </div>
                <p className="text-muted-foreground text-xs">
                  {shelter.radiusMinutes} min travel-time area (isochrone)
                </p>
                {simulationState.selectedShelterId === shelter.id && (
                  <p className="text-primary text-xs font-semibold">
                    Active Shelter
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
