import {
  SiDiscord,
  SiGithub,
  SiInstagram,
  SiX,
} from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
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
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span>hi@arinaholic.me</span>
          </a>
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
            <span className="contactDiscord">
              <SiDiscord
                className="contactIcon"
                color="currentColor"
                size={16}
                title=""
                aria-hidden="true"
                focusable="false"
              />
              <span className="contactLabel">discord</span>
            </span>
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
          </p>
        </div>
      </section>
    </PageShell>
  );
}
