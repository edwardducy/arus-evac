import { ThemeProvider } from "./components/ThemeProvider";
import WorkspacePage from "./workspace/Workspace";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="arus-evac-theme">
      <WorkspacePage />
    </ThemeProvider>
  );
}
