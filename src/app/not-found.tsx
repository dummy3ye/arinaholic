import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="page">
        <div className="hero">
          <h1 className="sm">not found.</h1>
          <p className="lede">
            nothing here.{" "}
            <Link className="link" href="/">
              back home
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
