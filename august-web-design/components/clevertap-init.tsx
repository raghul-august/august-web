"use client";

import { useEffect } from "react";
import { initCleverTap } from "@/utils/clevertap";

export function CleverTapInit() {
  useEffect(() => {
    initCleverTap();
  }, []);

  return null;
}
