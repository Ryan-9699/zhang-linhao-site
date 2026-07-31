"use client";

import { ArrowUpRight, Mail, MapPin, Phone, Radio, Send, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StoredImage from "@/components/StoredImage";
import type { ContentData, WorkItem } from "@/types/content";
import type { CSSProperties } from "react";

interface AhmedInspiredSiteProps {
  initialContent: ContentData;
}

const navItems = ["home", "about", "works", "experience", "contact"];

function firstSentence(text: string) {
  return text.split(/[。\n]/).filter(Boolean)[0] ?? text;
}

function ProjectCard({ work, index }: { work: WorkItem; index: number }) {
  return (
    <article className="aa-work-card reveal-item">
      <div className="aa-work-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="aa-work-media">
        <StoredImage src={work.image} alt={work.subtitle} sizes="(max-width: 900px) 92vw, 38vw" />
      </div>
      <div className="aa-work-copy">
        <p>{work.title}</p>
        <h3>{work.subtitle}</h3>
        <span>{firstSentence(work.description)}</span>
        <div>
          {work.tags.slice(0, 3).map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function AhmedInspiredSite({ initialContent }: AhmedInspiredSiteProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const content = useMemo(() => initialContent, [initialContent]);
  const profile = content.profile;
  const works = content.works.slice(0, 9);
  const heroImage = profile?.avatar || works[0]?.image || "/images/style-reference.jpg";
  const metrics = profile?.metrics?.slice(0, 6) ?? [];
  const marquee = [
    "LIVE BROADCAST",
    "CINEMATOGRAPHY",
    "SIGNAL SYSTEM",
    "AIGC WORKFLOW",
    "ZERO ACCIDENT",
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>(".reveal-item"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    revealTargets.forEach((target) => observer.observe(target));

    const handleMove = (event: PointerEvent) => {
      if (!reduceMotion) setCursor({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className="aa-site"
      style={{ "--cursor-x": `${cursor.x}px`, "--cursor-y": `${cursor.y}px` } as CSSProperties}
    >
      <div className="aa-cursor" aria-hidden="true" />

      <nav className="aa-nav">
        <a className="aa-brand" href="#home" aria-label="home">
          <span>ZL</span>
        </a>
        <div>
          {navItems.map((item) => (
            <a key={item} href={`#${item}`}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section id="home" className="aa-hero">
        <div className="aa-hero-grid">
          <div className="aa-hero-copy reveal-item">
            <p className="aa-kicker">
              <Sparkles size={16} />
              {profile?.experience} · {profile?.city}
            </p>
            <h1>
              <span>{profile?.name}</span>
              <span>LIVE TECH</span>
              <span>VISUAL</span>
            </h1>
            <div className="aa-hero-actions">
              <a href="#works">
                Selected Works
                <ArrowUpRight size={18} />
              </a>
              <a href={`mailto:${profile?.email}`}>
                <Mail size={18} />
                Contact
              </a>
            </div>
          </div>

          <div className="aa-hero-visual reveal-item">
            <div className="aa-portrait">
              <StoredImage src={heroImage} alt={profile?.name ?? "profile"} sizes="(max-width: 900px) 78vw, 36vw" priority />
            </div>
            <div className="aa-sticker aa-sticker-a">
              <Radio size={20} />
              <span>0事故</span>
            </div>
            <div className="aa-sticker aa-sticker-b">
              <Zap size={18} />
              <span>S++ Live</span>
            </div>
          </div>
        </div>

        <div className="aa-hero-bottom reveal-item">
          <p>{profile?.summary}</p>
          <div>
            <span>{profile?.role}</span>
            <span>{content.education}</span>
          </div>
        </div>
      </section>

      <div className="aa-marquee" aria-hidden="true">
        <div>
          {[...marquee, ...marquee].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section id="about" className="aa-section aa-about">
        <div className="aa-section-head reveal-item">
          <p>ABOUT</p>
          <h2>把现场不确定性压到最低。</h2>
        </div>

        <div className="aa-metrics">
          {metrics.map((metric) => (
            <article className="reveal-item" key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>

        <div className="aa-skill-grid">
          {content.skills?.map((skill) => (
            <article className="aa-skill-card reveal-item" key={skill.title}>
              <h3>{skill.title}</h3>
              <div>
                {skill.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="works" className="aa-section">
        <div className="aa-section-head reveal-item">
          <p>WORKS</p>
          <h2>大型直播、明星项目、户外 IP 与品牌内容。</h2>
        </div>
        <div className="aa-work-grid">
          {works.map((work, index) => (
            <ProjectCard key={work.id} work={work} index={index} />
          ))}
        </div>
      </section>

      <section id="experience" className="aa-section aa-experience">
        <div className="aa-section-head reveal-item">
          <p>EXPERIENCE</p>
          <h2>从链路设计到现场执行。</h2>
        </div>
        <div className="aa-timeline">
          {content.experience?.map((item) => (
            <article className="reveal-item" key={item.company}>
              <div>
                <span>{item.period}</span>
                <h3>{item.company}</h3>
                <p>{item.role}</p>
              </div>
              <ul>
                {item.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="aa-contact">
        <div className="aa-contact-name reveal-item">
          <span>ZHANG</span>
          <span>LINHAO</span>
        </div>
        <div className="aa-contact-panel reveal-item">
          <p>Ready for the next live system.</p>
          <a href={`mailto:${profile?.email}`}>
            <Send size={18} />
            {profile?.email}
          </a>
          <a href={`tel:${profile?.phone}`}>
            <Phone size={18} />
            {profile?.phone}
          </a>
          <span>
            <MapPin size={18} />
            {profile?.city} / {profile?.salary}
          </span>
        </div>
      </section>
    </main>
  );
}
