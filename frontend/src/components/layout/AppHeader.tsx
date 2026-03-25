export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 border-b h-14 bg-card border-border">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐳</span>
        <p className="text-xl font-semibold text-card-foreground">
          Docker Control Plane
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Connected</span>
      </div>
    </header>
  );
}
