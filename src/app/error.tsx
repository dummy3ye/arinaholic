"use client";

import Link from "next/link";

function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main>
      <section className="page">
        <div className="hero">
          <h1 className="sm">something went wrong.</h1>
          <p className="lede">
            that didn’t work.{" "}
            <button type="button" className="link" onClick={() => retry()}>
              try again
            </button>{" "}
            or{" "}
            <Link className="link" href="/">
              go home
            </Link>
            .
          </p>
          {digest ? <p className="muted">error {digest}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default ErrorPage;
