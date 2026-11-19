import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/content/Hero";
import { PageShell } from "@/components/content/PageShell";
import { mainProjects, smallProjects } from "@/lib/works-projects";

export const metadata: Metadata = {
  title: "works",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <PageShell route="works">
      <section className="page">
        <Hero
          title="works."
          lede="stuff i made. open source, mostly cli-tui and few websites and simulations."
        />
        <div className="sec">
          <div className="row">
            <div>
              <h2>kernel</h2>
            </div>
            <div>
              <h3>small fixes in wifi, media and staging drivers.</h3>
              <p>everything is public on the mailing list.</p>
              <Link className="link" href="/works/kernel">
                read about the patches
              </Link>
            </div>
          </div>
          {mainProjects.map((project) => (
            <div className="row" key={project.name}>
              <div>
                <h2>{project.name}</h2>
                <a className="link small" href={project.href} rel="noopener">
                  on github
                </a>
              </div>
              <div>
                <h3>{project.title}</h3>
                {project.summary && <p>{project.summary}</p>}
                <div className="meta">
                  {project.languages.map((language) => (
                    <span key={language.name}>
                      <i
                        className="dot"
                        style={{ background: language.color }}
                        aria-hidden="true"
                      />
                      {language.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="row">
            <div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.5rem)" }}>
                smaller things
              </h2>
            </div>
            <dl className="list">
              {smallProjects.map((project) => (
                <Fragment key={project.name}>
                  <dt>
                    <a className="link" href={project.href} rel="noopener">
                      {project.name}
                    </a>
                  </dt>
                  <dd>{project.summary}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
