"use client";

import { useState } from "react";

interface Bucket {
  bucket: string;
  count: number;
  color: string;
}

interface SHHistogramProps {
  buckets: Bucket[];
  onBucketClick?: (bucket: string) => void;
}

export default function SHHistogram({ buckets, onBucketClick }: SHHistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="sh-histogram">
      {buckets.map((b, i) => {
        const pct = (b.count / max) * 100;
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
