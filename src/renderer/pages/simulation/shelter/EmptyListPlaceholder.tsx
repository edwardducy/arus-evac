import { MapPinned } from "lucide-react";
import { Button } from "@/components/Button";
import { useSimulationContext } from "../SimulationProvider";

type EmptyListPlaceholderProps = {
  toggle: () => void;
};

export default function EmptyListPlaceholder(props: EmptyListPlaceholderProps) {
  const { startAddShelter } = useSimulationContext();

  return (
    <div className="border-border bg-secondary/20 rounded-xl border border-dashed p-6 text-center">
      <MapPinned className="text-primary mx-auto mb-3" size={28} />
      <h3 className="text-lg font-semibold">No Shelters Added Yet</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        Create your first shelter, place it on the map, and generate its
        travel-time area (isochrone).
      </p>
      <Button
        className="mt-4 w-full"
        onClick={() => {
          startAddShelter();
          props.toggle();
        }}
      >
        Add Shelter
      </Button>
    </div>
  );
}
