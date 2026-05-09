"use client";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

interface TrackedCalendlyLinkProps {
  children: React.ReactNode;
  className?: string;
  source: string;
}

const bookingGateUrl = "/book/";

export default function TrackedCalendlyLink({
  children,
  className,
  source,
}: TrackedCalendlyLinkProps) {
  const handleClick = () => {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.dataLayer = trackingWindow.dataLayer || [];
    trackingWindow.dataLayer.push({
      event: "booking_gate_start",
      event_category: "lead",
      event_label: source,
      destination: bookingGateUrl,
    });

    trackingWindow.gtag?.("event", "booking_gate_start", {
      event_category: "booking",
      event_label: source,
    });
  };

  const href = `${bookingGateUrl}?source=${encodeURIComponent(source)}`;

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
