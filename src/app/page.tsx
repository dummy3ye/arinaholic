import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";

export const metadata: Metadata = {
  title: { absolute: "sagittarius" },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <PageShell route="home">
      <section className="page">
        <Hero
          title="coffee, terminals n debugging."
          lede="embedded systems and simulations; writing tools for the terminal. and on weekends i being on the lkms."
        />
        <div className="sec">
          <div className="cols">
            <div>
              <h2>works</h2>
              <p>
                blackhole sim in opengl, lib for scientific publishing, a
                desktop shell n more things.
              </p>
              <Link className="link" href="/works">
                see what i made
              </Link>
            </div>
            <div>
              <h2>research</h2>
              <p>
                notes on math, systems and other things i keep coming back to.
                the long versions live here.
              </p>
              <Link className="link" href="/research">
                read the research
              </Link>
            </div>
            <div>
              <h2>setup</h2>
              <p>
                arch with hyprland, kitty, fish and neovim. mostly c, typescript
                and python.
              </p>
              <Link className="link" href="/setup">
                see the setup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
