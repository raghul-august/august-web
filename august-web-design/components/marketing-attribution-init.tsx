"use client";

import { useEffect } from "react";
import { captureSourceMedium } from "@/app/utils/marketing-attribution";

export function MarketingAttributionInit() {
  useEffect(() => {
    captureSourceMedium();
  }, []);

  return null;
}
