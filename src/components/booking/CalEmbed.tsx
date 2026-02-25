"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  calLink: string;
  onBookingSuccessful?: () => void;
}

export default function CalEmbed({ calLink, onBookingSuccessful }: CalEmbedProps) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: true,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#4361EE" },
          dark: { "cal-brand": "#4361EE" },
        },
      });
      if (onBookingSuccessful) {
        cal("on", {
          action: "bookingSuccessful",
          callback: onBookingSuccessful,
        });
      }
    })();
  }, [onBookingSuccessful]);

  return (
    <Cal
      calLink={calLink}
      style={{ width: "100%", height: "100%", overflow: "auto" }}
      config={{ layout: "month_view" }}
    />
  );
}
