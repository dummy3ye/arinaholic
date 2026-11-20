export default function Loading() {
  return (
    <main aria-busy="true">
      <section className="page">
        <div className="hero">
          <h1 className="sm">loading…</h1>
          <p className="lede muted" role="status">
            getting things ready.
          </p>
        </div>
      </section>
    </main>
  );
}
