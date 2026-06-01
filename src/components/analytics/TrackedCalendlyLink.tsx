"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import { buildCalendlyUrl } from "@/lib/attribution";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  lintrk?: (event: "track", options: { conversion_id?: string }) => void;
};

interface TrackedCalendlyLinkProps {
  children: React.ReactNode;
  className?: string;
  source: string;
}

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
const googleAdsBookCallLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOK_CALL_LABEL;
const linkedInBookCallConversionId =
  process.env.NEXT_PUBLIC_LINKEDIN_BOOK_CALL_CONVERSION_ID;

export default function TrackedCalendlyLink({
  children,
  className,
  source,
}: TrackedCalendlyLinkProps) {
  // First render (SSR + hydration) uses the deterministic default so server and
  // client markup match. After mount we upgrade the href to carry any stored ad
  // attribution (gclid + real UTMs) into the Calendly handoff. See lib/attribution.
  const defaultHref = `${SITE_CONFIG.calendlyUrl}?utm_source=website&utm_medium=referral&utm_content=${encodeURIComponent(source)}`;
  const [href, setHref] = useState(defaultHref);

  useEffect(() => {
    setHref(buildCalendlyUrl(SITE_CONFIG.calendlyUrl, source));
  }, [source]);

  const handleClick = () => {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.dataLayer = trackingWindow.dataLayer || [];
    trackingWindow.dataLayer.push({
      event: "book_call_click",
      event_category: "lead",
      event_label: source,
      destination: href,
    });

    trackingWindow.gtag?.("event", "generate_lead", {
      event_category: "booking",
      event_label: source,
    });

    if (googleAdsId && googleAdsBookCallLabel) {
      trackingWindow.gtag?.("event", "conversion", {
        send_to: `${googleAdsId}/${googleAdsBookCallLabel}`,
      });
    }

    trackingWindow.fbq?.("track", "Lead", {
      content_name: "Book a discovery call",
      content_category: "booking",
    });

    if (linkedInBookCallConversionId) {
      trackingWindow.lintrk?.("track", {
        conversion_id: linkedInBookCallConversionId,
      });
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
