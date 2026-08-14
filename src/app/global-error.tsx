"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06060b",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 48, fontWeight: 700, margin: 0 }}>500</p>
        <h1 style={{ marginTop: 16, fontSize: 24 }}>Something went wrong</h1>
        <p style={{ marginTop: 8, maxWidth: 420, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          This page failed to load. Try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 24,
            border: 0,
            borderRadius: 999,
            padding: "10px 20px",
            background: "#7C5CFF",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
