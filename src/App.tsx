import ERCanvas from "./components/ERCanvas";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ERCanvas />
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
