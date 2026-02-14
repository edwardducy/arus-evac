import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import type { Shelter } from "../SimulationProvider";

type ShelterDetailsProps = {
  onBack: () => void;
  onDelete: () => void;
  shelter: Shelter | null;
};

export default function ShelterDetails({
  onBack,
  onDelete,
  shelter,
}: ShelterDetailsProps) {
  if (!shelter) {
    return (
      <div className="border-border/70 bg-background/70 space-y-4 rounded-xl border p-4">
        <button
          className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-1 text-sm transition-colors"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Shelters
        </button>
        <div className="border-border/70 bg-card text-muted-foreground rounded-lg border p-3 text-sm">
          Select a shelter to view location coordinates and travel-time coverage
          details.
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/70 bg-background/70 space-y-4 rounded-xl border p-4">
      <button
        className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-1 text-sm transition-colors"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={18} />
        Back to Shelters
      </button>
      <div className="border-border/70 bg-card space-y-3 rounded-lg border p-3 text-sm">
        <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
          Shelter Details
        </p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              backgroundColor: `rgb(${shelter.color[0]}, ${shelter.color[1]}, ${shelter.color[2]})`,
            }}
          />
          <h3 className="font-semibold">{shelter.name}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="border-border/70 bg-background rounded-md border px-3 py-2">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Travel-Time Area
            </p>
            <p className="font-medium">{shelter.radiusMinutes} minutes</p>
          </div>
          <div className="border-border/70 bg-background rounded-md border px-3 py-2">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Coordinates (Lat, Lon)
            </p>
            <p className="font-medium">
              {shelter.coordinates[1].toFixed(5)},{" "}
              {shelter.coordinates[0].toFixed(5)}
            </p>
          </div>
        </div>
        <Button onClick={onDelete} variant="destructive">
          Delete Shelter
        </Button>
      </div>
    </div>
  );
}
