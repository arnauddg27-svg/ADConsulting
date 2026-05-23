"use client";

import { ArrowLeft } from "lucide-react";

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
      <div className="sh-bar-left">
        {/* Full navigation back to the marketing site (exits the dashboard). */}
        <a href="/" className="sh-bar-back" aria-label="Back to AD ERP Systems site">
          <ArrowLeft size={14} aria-hidden />
          <span className="sh-bar-back-label">Back to site</span>
        </a>
        <span className="sh-bar-brand">Sunshine Homes</span>
      </div>
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
