import type { Metadata } from "next";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";

export const metadata: Metadata = {
  title: "kernel",
  alternates: { canonical: "/works/kernel" },
};

export default function KernelPage() {
  return (
    <PageShell route="kernel">
      <section className="page">
        <Hero
          title="kernel."
          lede="i send patches to the linux kernel, and test a few drivers along the way."
        />
        <div className="sec">
          <div className="row">
            <div>
              <h2>what i send</h2>
            </div>
            <div>
              <h3>mostly small fixes in drivers.</h3>
              <p>wifi, media, usb, uvc and staging.</p>
            </div>
          </div>
          <div className="row">
            <div>
              <h2>what i test</h2>
            </div>
            <div>
              <h3>intel backlight, rtw88 and uvc.</h3>
              <p>i test and contribute to all three.</p>
            </div>
          </div>
          <div className="row">
            <div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.5rem)" }}>
                everything is public
              </h2>
            </div>
            <dl className="list">
              <dt>
                <a
                  className="link"
                  href="https://lore.kernel.org/all/?q=reza1234khan1234@gmail.com"
                  rel="noopener"
                >
                  all my patches
                </a>
              </dt>
              <dd>on lore.kernel.org</dd>
              <dt>
                <a
                  className="link"
                  href="https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git"
                  rel="noopener"
                >
                  kernel source tree
                </a>
              </dt>
              <dd>what i’m contributing to</dd>
              <dt>
                <a
                  className="link"
                  href="https://docs.kernel.org/process/submitting-patches.html"
                  rel="noopener"
                >
                  patch docs
                </a>
              </dt>
              <dd>what i learned from</dd>
            </dl>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
