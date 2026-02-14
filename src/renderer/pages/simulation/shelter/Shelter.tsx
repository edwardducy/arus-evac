import { useState } from "react";
import Form from "./Form";
import List from "./List";
import ShelterDetails from "./ShelterDetails";
import { useSimulationContext } from "../SimulationProvider";

export default function Shelter() {
  const { deleteShelter, shelters, simulationState } = useSimulationContext();
  const [panel, setPanel] = useState<"list" | "form" | "details">("list");
  const selectedShelter = shelters.find(
    (shelter) => shelter.id === simulationState.selectedShelterId,
  );
  const toggleList = () => setPanel("list");
  const toggleForm = () => setPanel("form");
  const toggleDetails = () => setPanel("details");
  const handleDeleteShelter = () => {
    if (!selectedShelter) {
      return;
    }

    deleteShelter(selectedShelter.id);
    toggleList();
  };
  const modeLabel =
    simulationState.mode === "add-shelters"
      ? "Adding Shelter"
      : simulationState.mode === "returning-home"
        ? "Returning Home"
        : simulationState.mode === "typhoon"
          ? "Typhoon Phase"
          : simulationState.mode === "simulating"
            ? "Simulation Running"
            : simulationState.mode === "view-shelter"
              ? "Viewing Shelter"
              : "Ready";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="border-border/70 bg-secondary/45 flex items-center justify-between rounded-xl border px-3 py-2">
        <p className="text-sm font-medium">
          {shelters.length} shelters planned
        </p>
        <span className="bg-background text-muted-foreground rounded-full px-2 py-1 text-xs font-medium">
          {modeLabel}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {panel === "list" && (
          <List onView={toggleDetails} toggle={toggleForm} />
        )}
        {panel === "form" && <Form toggle={toggleList} />}
        {panel === "details" && (
          <ShelterDetails
            onBack={toggleList}
            onDelete={handleDeleteShelter}
            shelter={selectedShelter || null}
          />
        )}
      </div>
    </div>
  );
}
