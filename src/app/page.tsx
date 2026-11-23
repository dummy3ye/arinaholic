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
          lede="i’m sage, i also go by @arinaholic n @dummy3ye. i build embedded systems and simulations, and write fast tools for the terminal. other than that on weekends i contiibute and test patches to the linux kernel."
        />
        <div className="sec">
          <div className="cols">
            <div>
              <h2>works</h2>
              <p>
                a black hole in opengl, a notebook for scientific publishing, a
                desktop shell and some smaller things.
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
