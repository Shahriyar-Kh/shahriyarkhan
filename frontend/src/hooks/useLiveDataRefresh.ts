import { useEffect, useState } from "react";

export function useLiveDataRefresh(intervalMs = 15000) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setRefreshKey((current) => current + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    const handleFocus = () => refresh();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }, intervalMs);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);

  return refreshKey;
}