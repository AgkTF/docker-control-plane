import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeToggle } from "../../contexts/ThemeContext";
import { Button } from "../ui/button";
import { Link } from "react-router";

export function AppHeader() {
  const { theme, toggleTheme } = useThemeToggle();

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header className="flex items-center justify-between px-4 border-b h-14 bg-card border-border">
      <Link to="/">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐳</span>
          <p className="text-xl font-semibold text-card-foreground">
            Docker Control Plane
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Connected</span>
        </div>
      </div>
    </header>
  );
}
