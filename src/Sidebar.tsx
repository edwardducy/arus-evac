import { Box, Button, Flex } from "@radix-ui/themes";
import Hazard from "./panels/Hazard";
import Population from "./panels/Population";
import Scenario from "./panels/Scenario";
import Shelter from "./Shelter";

export type SidebarPanel = "scenario" | "population" | "hazard" | "shelter";

const NAV_ITEMS: Array<{ id: SidebarPanel; label: string }> = [
  { id: "scenario", label: "Scenario" },
  { id: "population", label: "Population" },
  { id: "hazard", label: "Hazard" },
  { id: "shelter", label: "Shelter" },
];

function Sidebar({
  activePanel,
  onChangePanel,
}: {
  activePanel: SidebarPanel;
  onChangePanel: (panel: SidebarPanel) => void;
}) {
  return (
    <Flex className="h-full w-[440px] shrink-0 border-r border-r-[var(--gray-a6)] bg-[var(--gray-2)]">
      <Box className="sidebar-nav w-48 shrink-0 border-r border-r-[var(--gray-a6)] p-3">
        <Flex direction="column" gap="2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              size="2"
              variant={activePanel === item.id ? "solid" : "soft"}
              className="justify-start"
              onClick={() => onChangePanel(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </Flex>
      </Box>

      <Box className="sidebar-panel min-w-0 flex-1 overflow-auto p-4">
        <Box className={activePanel === "scenario" ? "" : "hidden"}>
          <Scenario />
        </Box>
        <Box className={activePanel === "population" ? "" : "hidden"}>
          <Population />
        </Box>
        <Box className={activePanel === "hazard" ? "" : "hidden"}>
          <Hazard />
        </Box>
        <Box className={activePanel === "shelter" ? "" : "hidden"}>
          <Shelter />
        </Box>
      </Box>
    </Flex>
  );
}

export default Sidebar;
