"use client";

type ShellBarProps = {
  mode: "night" | "day";
  isFullPage: boolean;
  onToggleMode: () => void;
  onToggleFullPage: () => void;
};

export default function ShellBar({
  mode,
  isFullPage,
  onToggleMode,
  onToggleFullPage,
}: ShellBarProps) {
  return (
    <div className="sh-bar">
      <span className="sh-bar-brand">Sunshine Homes</span>
      <div className="sh-bar-controls">
        <button
          type="button"
          className={`sh-bar-btn ${isFullPage ? "active" : ""}`}
          onClick={onToggleFullPage}
        >
          {isFullPage ? "Exit Full Page" : "Full Page"}
        </button>
        <button
          type="button"
          className="sh-bar-btn"
          onClick={onToggleMode}
        >
          {mode === "night" ? "Day Mode" : "Night Mode"}
        </button>
        <span className="sh-bar-badge">Sample Data</span>
      </div>
    </div>
  );
}
