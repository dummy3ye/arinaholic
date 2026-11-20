"use client";

import "@/styles/globals.css";
import "@/styles/styles.scss";

const fontVariable = {
  "--font-jost": "system-ui, -apple-system, 'Segoe UI', sans-serif",
} as React.CSSProperties;

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en" style={fontVariable}>
      <body>
        <main>
          <section className="page">
            <div className="hero">
              <h1 className="sm">this page couldn’t load.</h1>
              <p className="lede">
                <button type="button" className="link" onClick={() => retry()}>
                  try again
                </button>{" "}
                or reload the page.
              </p>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
