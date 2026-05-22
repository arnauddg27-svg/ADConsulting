"use client";

import { useState } from "react";
import { usePaletteColors } from "./chartPalette";

interface Bucket {
  bucket: string;
  count: number;
  color: string;
}

interface SHHistogramProps {
  buckets: Bucket[];
  onBucketClick?: (bucket: string) => void;
  /** Set when bar colors carry meaning (status / risk) and must NOT be
   *  recolored by the active palette. */
  semantic?: boolean;
}

export default function SHHistogram({ buckets, onBucketClick, semantic }: SHHistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const palCols = usePaletteColors(buckets.length);
  const data = palCols && !semantic ? buckets.map((b, i) => ({ ...b, color: palCols[i] })) : buckets;
  const counts = data.map(b => b.count);
  const max = Math.max(...counts, 1);
  // Amplify visual contrast for non-zero buckets without drawing fake bars for empty slices.
  const nonZero = counts.filter(c => c > 0);
  const min = nonZero.length > 0 ? Math.min(...nonZero) : 0;
  const range = max - min || 1;

  return (
    <div className="sh-histogram">
      {data.map((b, i) => {
        const pct = b.count === 0 ? 0 : 25 + ((b.count - min) / range) * 75;
        const isHovered = hovered === i;
        return (
          <div
            key={b.bucket}
            className={`sh-histogram-bar${onBucketClick ? " clickable" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={onBucketClick ? () => onBucketClick(b.bucket) : undefined}
            role={onBucketClick ? "button" : undefined}
            tabIndex={onBucketClick ? 0 : undefined}
            title={onBucketClick ? `Open drilldown for ${b.bucket}` : undefined}
            aria-label={onBucketClick ? `Open drilldown for ${b.bucket}` : undefined}
            onKeyDown={onBucketClick ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBucketClick(b.bucket);
              }
            } : undefined}
            style={{ cursor: onBucketClick ? "pointer" : undefined }}
          >
            <div className="sh-histogram-count" style={{
              opacity: isHovered ? 1 : 0.7,
              transform: isHovered ? "scale(1.2)" : "scale(1)",
              transition: "all 0.2s",
            }}>
              {b.count}
            </div>
            <div
              className="sh-histogram-fill"
              style={{
                height: `${pct}%`,
                background: `linear-gradient(180deg, ${b.color}, ${b.color}66)`,
                boxShadow: isHovered ? `0 0 16px ${b.color}55` : `0 0 8px ${b.color}22`,
                transform: isHovered ? "scaleX(1.08)" : "scaleX(1)",
                transition: "all 0.2s ease",
                borderRadius: "4px 4px 0 0",
              }}
            />
            <div className="sh-histogram-label" style={{
              color: isHovered ? "var(--sh-text-primary)" : "var(--sh-text-muted)",
              transition: "color 0.15s",
            }}>
              {b.bucket}
            </div>
          </div>
        );
      })}
    </div>
  );
}
