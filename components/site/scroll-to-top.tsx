"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Next.js only scrolls a new page into view when it isn't visible, and then aligns it below the
 * sticky header, so page changes landed slightly scrolled. Every page change starts at the very top
 * instead; links with a hash (/#kontakt) are left to the browser so they still jump to their section.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
