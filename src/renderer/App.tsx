import { ThemeProvider } from "./components/ThemeProvider";
import Product from "./pages/simulation/SimulationLayout";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="arus-evac-theme">
      <Product />
    </ThemeProvider>
  );
}
