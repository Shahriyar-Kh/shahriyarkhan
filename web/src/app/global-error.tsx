"use client";

import { useEffect } from "react";

/** Last-resort boundary; must render its own <html>/<body> per Next's
 * own requirement, since it replaces the root layout entirely. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0a0e15", color: "#f4f4f5", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "20vh auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong.</h1>
          <p style={{ marginBottom: 24, opacity: 0.8 }}>The application hit an unrecoverable error.</p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#4ea8de", color: "#0a0e15", border: 0, padding: "10px 20px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
