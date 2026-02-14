import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useSimulationContext } from "../SimulationProvider";

type FormProps = {
  toggle: () => void;
};

export default function Form({ toggle }: FormProps) {
  const {
    confirmDraftShelter,
    setSimulationState,
    simulationState,
    updateDraftShelter,
  } = useSimulationContext();
  const shelterDraft = simulationState.draftShelter;
  const hasCoordinates = Boolean(shelterDraft?.coordinates);
  const hasIsochrone = Boolean(shelterDraft?.isochroneGeojson);
  const canConfirm = Boolean(
    shelterDraft && shelterDraft.name.trim() && hasCoordinates && hasIsochrone,
  );

  const handleConfirm = () => {
    const shelter = confirmDraftShelter();
    if (shelter) {
      toggle();
    }
  };

  const handleBack = () => {
    setSimulationState((previousState) => ({
      ...previousState,
      draftShelter: null,
      mode: "idle",
      selectedShelterId: previousState.selectedShelterId,
    }));
    toggle();
  };

  return (
    <div className="border-border/70 bg-background/70 space-y-5 rounded-xl border p-4">
      <button
        className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-1 text-sm transition-colors"
        onClick={handleBack}
        type="button"
      >
        <ArrowLeft size={18} />
        Back to Shelters
      </button>

      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Add Shelter Coverage Area</h2>
        <p className="text-muted-foreground text-sm">
          Step 1: Enter shelter details. Step 2: Click the map to set
          coordinates. Step 3: Save once the travel-time area (isochrone) is
          ready.
        </p>
      </div>

      <div className="border-border/70 bg-card space-y-2 rounded-lg border p-3">
        <label className="text-sm font-medium" htmlFor="shelter-name">
          Shelter Name (Public Label)
        </label>
        <Input
          id="shelter-name"
          onChange={(event) =>
            updateDraftShelter({ name: event.currentTarget.value })
          }
          placeholder="e.g. Riverside Civic Center"
          type="text"
          value={shelterDraft?.name || ""}
        />
      </div>

      <div className="border-border/70 bg-card space-y-2 rounded-lg border p-3">
        <label className="text-sm font-medium" htmlFor="shelter-radius">
          Coverage Travel Time (minutes)
        </label>
        <Input
          id="shelter-radius"
          min={1}
          onChange={(event) =>
            updateDraftShelter({
              radiusMinutes: Math.max(
                1,
                Number(event.currentTarget.value || 1),
              ),
            })
          }
          step={1}
          type="number"
          value={shelterDraft?.radiusMinutes || 10}
        />
      </div>

      <div className="border-border/70 bg-secondary/25 space-y-2 rounded-lg border p-3 text-sm">
        <p
          className={
            hasCoordinates
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          }
        >
          {hasCoordinates
            ? "Coordinates selected on map."
            : "Pending: click the map to place the shelter point."}
        </p>
        <p
          className={
            hasIsochrone
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          }
        >
          {hasIsochrone
            ? "Isochrone generated and ready to save."
            : "Pending: generating travel-time area (isochrone)."}
        </p>
      </div>

      <Button className="w-full" disabled={!canConfirm} onClick={handleConfirm}>
        Save Shelter
      </Button>
    </div>
  );
}
