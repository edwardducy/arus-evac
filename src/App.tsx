import { Box, Flex, Theme } from "@radix-ui/themes";
import { useState } from "react";
import Map from "./Map";
import Sidebar, { type SidebarPanel } from "./Sidebar";

function App() {
  const [activePanel, setActivePanel] = useState<SidebarPanel>("scenario");

  return (
    <Theme
      appearance="dark"
      accentColor="cyan"
      grayColor="slate"
      radius="large"
    >
      <Flex className="h-screen w-screen bg-[var(--gray-1)] text-[var(--gray-12)]">
        <Sidebar activePanel={activePanel} onChangePanel={setActivePanel} />

        <Box className="h-full min-w-0 flex-1 p-4">
          <Box className="relative h-full overflow-hidden rounded-2xl border border-[var(--gray-a6)] bg-[var(--gray-1)] shadow-sm">
            <Map />
          </Box>
        </Box>
      </Flex>
    </Theme>
  );
}

export default App;
