"use client";

import { useEffect } from "react";

export default function LocalStorageInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("links");
      if (!hasVisited) {
        localStorage.setItem("links", JSON.stringify([]));
        console.log("First time visitor! Setting localStorage.");
      }
    }
  }, []);

  return null;
}
