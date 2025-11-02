import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        absolute top-4 right-20 z-50
        w-12 h-12 rounded-full
        flex items-center justify-center
        cursor-pointer border-none
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-lg
        shadow-md
        ${
          theme === "light"
            ? "bg-white text-gray-800"
            : "bg-gray-800 text-gray-200"
        }
      `}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
