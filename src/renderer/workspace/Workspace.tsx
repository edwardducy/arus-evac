import MapCanvas from "./MapCanvas";
import Sidebar from "./Sidebar";

export default function Workspace() {
  return (
    <div className="grid h-screen w-screen grid-cols-[2fr_5fr]">
      <Sidebar />
      <MapCanvas />
    </div>
  );
}
