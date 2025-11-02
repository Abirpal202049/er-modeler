import ERCanvas from "./components/ERCanvas";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <ERCanvas />
    </ThemeProvider>
  );
}

export default App;
