import { SiGithub, SiInstagram, SiX } from "@icons-pack/react-simple-icons";
import { Globe, Mail } from "lucide-react";
import type { Metadata } from "next";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";

export const metadata: Metadata = {
  title: "contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell route="contact">
      <section className="page">
        <Hero
          title="say hi."
          small
          lede="email is best for kernel and project questions. discord is good for chatting."
        />
        <div className="sec">
          <a className="big contactMail" href="mailto:hi@arinaholic.me">
            <Mail
              className="contactIcon"
              size={44}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span>hi@arinaholic.me</span>
          </a>
          <p className="muted">discord: 3yeonly_</p>
          <p className="contactLinks">
            <a
              className="link contactLink"
              href="https://github.com/dummy3ye"
              rel="noopener"
            >
              <SiGithub
                className="contactIcon"
                color="currentColor"
                size={16}
                title=""
                aria-hidden="true"
                focusable="false"
              />
              <span className="contactLabel">github</span>
            </a>
            <a
              className="link contactLink"
              href="https://x.com/3yeonly_"
              rel="noopener"
            >
              <SiX
                className="contactIcon"
                color="currentColor"
                size={16}
                title=""
                aria-hidden="true"
                focusable="false"
              />
              <span className="contactLabel">twitter</span>
            </a>
            <a
              className="link contactLink"
              href="https://instagram.com/unyerner"
              rel="noopener"
            >
              <SiInstagram
                className="contactIcon"
                color="currentColor"
                size={16}
                title=""
                aria-hidden="true"
                focusable="false"
              />
              <span className="contactLabel">instagram</span>
            </a>
            <a
              className="link contactLink"
              href="https://home.osky.dpdns.org"
              rel="noopener"
            >
              <Globe
                className="contactIcon"
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="contactLabel">my other site</span>
            </a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
