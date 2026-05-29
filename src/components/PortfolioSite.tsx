"use client";

import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoredImage from "@/components/StoredImage";
import { getWorkGroup, workGroupOptions } from "@/lib/projectGroups";
import type { ContentData, WorkItem } from "@/types/content";

interface PortfolioSiteProps {
  initialContent: ContentData;
}

function cloneContent(content: ContentData): ContentData {
  return JSON.parse(JSON.stringify(content)) as ContentData;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function syncText(target?: string) {
  if (!target) return {};
  return {
    "data-sync-field": target,
    contentEditable: "plaintext-only" as const,
    suppressContentEditableWarning: true,
    spellCheck: false,
  };
}

export default function PortfolioSite({ initialContent }: PortfolioSiteProps) {
  const siteRef = useRef<HTMLElement | null>(null);
  const content = useMemo(() => cloneContent(initialContent), [initialContent]);

  const profile = content.profile;
  const [activeProjectGroup, setActiveProjectGroup] = useState(0);
  const [showProjectNav, setShowProjectNav] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const metrics = profile?.metrics ?? [];

  const expertiseCards = useMemo(
    () => [
      {
        eyebrow: "Skill Stack",
        title: "直播/视音频系统",
        text: "BMD ATEM 系列 / Yamaha TF/QL 数字调音台 / Riedel / Clear-Com / NDI / SRT / Dante",
      },
      {
        eyebrow: "Skill Stack",
        title: "摄影采集设备",
        text: "ARRI / RED / SONY FX/Venice / LiveU / TVU 回传终端 / 多机位色彩校准",
      },
      {
        eyebrow: "Skill Stack",
        title: "后期与创作",
        text: "Premiere Pro / After Effects / DaVinci Resolve / Cinema 4D / Stable Diffusion / AIGC 工作流",
      },
      {
        eyebrow: "Expertise",
        title: "直播系统架构",
        text: "S级直播技术方案、推流策略、主备冗余与现场执行闭环。",
      },
      {
        eyebrow: "Expertise",
        title: "TVC广告内容拍摄",
        text: "电影级TVC广告制作，短视频内容拍摄。",
      },
      {
        eyebrow: "Expertise",
        title: "低延迟信号传输",
        text: "LiveU / TVU / NDI / SRT / Dante，复杂环境下的高可靠回传。",
      },
    ],
    [],
  );

  const projectGroups = useMemo(() => {
    const toProjectItem = (work: WorkItem) => ({
      id: work.id,
      name: work.subtitle,
      description: work.description,
      tags: work.tags,
      image: work.image,
      videoImage: work.videoImage ?? work.image,
      showcaseTitle: work.showcaseTitle,
      showcaseDescription: work.showcaseDescription,
      resultText: work.resultText,
      galleryImages: work.galleryImages,
      galleryText: work.galleryText,
    });

    return workGroupOptions.map((group) => {
      const works = content.works
        .filter((work) => getWorkGroup(work) === group.id)
        .sort((a, b) => {
          if (group.id !== "s-live") return 0;
          const priority = ["01", "06"];
          const aPriority = priority.indexOf(a.id);
          const bPriority = priority.indexOf(b.id);
          if (aPriority >= 0 || bPriority >= 0) {
            return (aPriority >= 0 ? aPriority : priority.length) - (bPriority >= 0 ? bPriority : priority.length);
          }
          return 0;
        });
      const fallbackItems =
        group.id === "brand"
          ? [
          {
            id: "fallback-brand",
            name: "有道精品课宣传 TVC 与品牌内容",
            description: "独立把控灯光、布景、构图及镜头语言，参与前期选题、分镜脚本到后期混剪，并协同 AE/C4D 与 AIGC 优化合成流程。",
            tags: ["TVC", "品牌内容", "AIGC"],
            image: "/uploads/recovered/recovered-8-3871777.png",
            videoImage: "/uploads/recovered/recovered-9-3871777.png",
            showcaseTitle: "有道精品课宣传 TVC 与品牌内容展示",
            showcaseDescription: "展示品牌宣传、课程内容与视觉包装成果，可用于呈现 TVC 画面、短视频内容、海报拼图或 AIGC 辅助产出。",
            resultText: "补充品牌内容的播放数据、客户反馈、转化效果或代表成果。",
            galleryImages: {
              onsite: "/uploads/recovered/recovered-a-2939383.png",
              signal: "/uploads/recovered/recovered-b-257421.png",
              output: "/uploads/recovered/recovered-c-2356172.png",
            },
            galleryText: undefined,
          },
        ]
          : [];
      const items = works.length > 0 ? works.map(toProjectItem) : fallbackItems;
      const coverWork = works[0];

      return {
        title: group.title,
        directoryTitle: group.directoryTitle,
        directorySubtitle: group.directorySubtitle,
        coverTitle: works.length > 0
          ? works.slice(0, 2).map((work) => work.subtitle).join(" / ")
          : group.defaultCoverTitle,
        coverImage: coverWork?.image ?? items[0]?.image ?? "/images/style-reference.jpg",
        items,
      };
    });
  }, [content.works]);
  const selectedProjectGroup = projectGroups[activeProjectGroup] ?? projectGroups[0];

  const renderDirectoryTitle = (title: string) => {
    const parts = title.split(/\s+\/\s+/).filter(Boolean);
    if (parts.length <= 1) return title;

    return parts.map((part, index) => (
      <span key={`${part}-${index}`}>
        {index > 0 ? "/ " : ""}
        {part}
      </span>
    ));
  };

  const handleProjectGroupChange = (groupIndex: number) => {
    setActiveProjectGroup(groupIndex);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        siteRef.current
          ?.querySelector<HTMLElement>("#projects")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const handleBackTop = () => {
    siteRef.current
      ?.querySelector<HTMLElement>("#cover")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const root = siteRef.current;
    if (!root) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const context = gsap.context(() => {
      gsap.from(".sleek-nav", {
        autoAlpha: 0,
        y: -22,
        duration: 0.85,
        ease: "power3.out",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".sleek-cover-ribbon", { scaleX: 0, transformOrigin: "left center", duration: 1.1 }, 0.05)
        .from(".sleek-cover-copy span", { autoAlpha: 0, y: 18, duration: 0.6 }, 0.2)
        .from(".sleek-cover-copy h1 strong, .sleek-cover-copy h1 em", { autoAlpha: 0, y: 54, stagger: 0.11, duration: 0.9 }, 0.3)
        .from(".sleek-cover-copy p, .sleek-cover-note", { autoAlpha: 0, y: 26, stagger: 0.12, duration: 0.72 }, 0.65);

      gsap.to(".sleek-orb", {
        x: (index) => (index === 0 ? 34 : -28),
        y: (index) => (index === 0 ? -22 : 26),
        rotate: (index) => (index === 0 ? 6 : -8),
        duration: 7.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.8,
      });

      gsap.to(".sleek-cover-visual", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: ".sleek-cover",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".sleek-section-head").forEach((head) => {
        gsap.from(head.children, {
          autoAlpha: 0,
          y: 34,
          duration: 0.78,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: head,
            start: "top 82%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(
        ".sleek-combo-grid article, .sleek-timeline article, .sleek-project-directory button, .sleek-footer",
      ).forEach((element, index) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 46,
          scale: 0.985,
          duration: 0.82,
          delay: (index % 4) * 0.025,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".sleek-video-frame, .sleek-project-gallery figure, .sleek-directory-thumb").forEach((media) => {
        gsap.fromTo(
          media.querySelector("img"),
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: media,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".sleek-project-facts article, .sleek-tags em").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 18,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => context.revert();
  }, [content]);

  useEffect(() => {
    const root = siteRef.current;
    if (!root) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const activeTab = root.querySelector<HTMLElement>("[data-project-tab].active");
    const projectGroup = root.querySelector<HTMLElement>(".sleek-project-group");
    const activeItems = projectGroup
      ? Array.from(projectGroup.querySelectorAll<HTMLElement>(".sleek-project-group-title, .sleek-project-group-items > section"))
      : [];

    const context = gsap.context(() => {
      if (activeTab) {
        gsap.fromTo(
          activeTab,
          { y: -2 },
          { y: -8, duration: 0.42, ease: "back.out(1.7)" },
        );
        gsap.fromTo(
          activeTab.querySelector(".sleek-directory-thumb img"),
          { scale: 1.02 },
          { scale: 1.075, duration: 0.55, ease: "power3.out" },
        );
        gsap.fromTo(
          activeTab.querySelector("small"),
          { scale: 0.92, color: "#1169ff" },
          { scale: 1, color: "#58f4e2", duration: 0.5, ease: "back.out(2)" },
        );
      }

      if (activeItems.length > 0) {
        gsap.killTweensOf(activeItems);
        gsap.fromTo(
          activeItems,
          { autoAlpha: 0, y: 26, scale: 0.995 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.54,
            stagger: 0.06,
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "visibility,opacity,transform",
          },
        );
      }
    }, root);

    return () => context.revert();
  }, [activeProjectGroup]);

  useEffect(() => {
    const root = siteRef.current;
    const projects = root?.querySelector<HTMLElement>("#projects");
    if (!projects || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setShowProjectNav(entry.isIntersecting),
      { rootMargin: "-18% 0px -18% 0px" },
    );

    observer.observe(projects);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateBackTop = () => setShowBackTop(window.scrollY > window.innerHeight * 0.65);

    updateBackTop();
    window.addEventListener("scroll", updateBackTop, { passive: true });
    window.addEventListener("resize", updateBackTop);

    return () => {
      window.removeEventListener("scroll", updateBackTop);
      window.removeEventListener("resize", updateBackTop);
    };
  }, []);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-edit-path]"));
    let frame = 0;

    const updateActiveTarget = () => {
      frame = 0;
      let activeTarget: HTMLElement | null = null;
      let activeScore = 0;

      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        const score = visibleHeight - centerDistance * 0.12;

        if (visibleHeight > 24 && score > activeScore) {
          activeScore = score;
          activeTarget = target;
        }
      }

      targets.forEach((target) => {
        target.classList.toggle("is-edit-map-active", target === activeTarget);
      });
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveTarget);
    };

    updateActiveTarget();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [content]);

  useEffect(() => {
    const lastText = new WeakMap<HTMLElement, string>();
    const timers = new Map<HTMLElement, number>();

    document.querySelectorAll<HTMLElement>("[data-sync-field]").forEach((target) => {
      lastText.set(target, target.textContent?.trim() ?? "");
    });

    const persistTarget = (target: HTMLElement) => {
      const syncField = target.dataset.syncField;
      const value = target.textContent?.trim() ?? "";
      if (!syncField || value === lastText.get(target)) return;

      lastText.set(target, value);
      void fetch("/api/content-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: syncField, value }),
      }).then((response) => {
        if (!response.ok) {
          target.dataset.syncError = "true";
          return;
        }
        delete target.dataset.syncError;
      }).catch(() => {
        target.dataset.syncError = "true";
      });
    };

    const schedulePersist = (target: HTMLElement, delay = 450) => {
      const timer = timers.get(target);
      if (timer) window.clearTimeout(timer);
      timers.set(target, window.setTimeout(() => persistTarget(target), delay));
    };

    const getSyncTarget = (eventTarget: EventTarget | null) => {
      return eventTarget instanceof HTMLElement
        ? eventTarget.closest<HTMLElement>("[data-sync-field]")
        : null;
    };

    const handleFocusIn = (event: Event) => {
      const target = getSyncTarget(event.target);
      if (target) lastText.set(target, target.textContent?.trim() ?? "");
    };

    const handleEdit = (event: Event) => {
      const target = getSyncTarget(event.target);
      if (target) schedulePersist(target, 0);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const target =
          mutation.target instanceof HTMLElement
            ? mutation.target.closest<HTMLElement>("[data-sync-field]")
            : mutation.target.parentElement?.closest<HTMLElement>("[data-sync-field]");
        if (!target) continue;
        schedulePersist(target);
      }
    });

    observer.observe(document.body, { characterData: true, childList: true, subtree: true });
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("input", handleEdit, true);
    document.addEventListener("blur", handleEdit, true);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("input", handleEdit, true);
      document.removeEventListener("blur", handleEdit, true);
    };
  }, [content]);

  return (
    <main className="sleek-site" ref={siteRef}>
      <nav className="sleek-nav" aria-label="主导航">
        <a href="#cover" className="sleek-brand" {...syncText("site:title")}>{content.site.title}</a>
        <div>
          <a href="#intro">Intro</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
        </div>
      </nav>

      <section
        className="sleek-cover edit-map-target"
        id="cover"
        aria-label="视觉首图"
        data-edit-path="src/components/PortfolioSite.tsx: 首屏固定文案"
      >
        <div className="sleek-cover-visual">
          <div className="sleek-orb orb-one" />
          <div className="sleek-orb orb-two" />
          <div className="sleek-cover-ribbon" aria-hidden="true" />
          <div className="sleek-cover-prisms" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="sleek-cover-copy">
            <span>LIVE BROADCAST TECHNOLOGY</span>
            <h1>
              <strong>直播技术作品集</strong>
              <em>Visual System Portfolio</em>
            </h1>
            <p>直播技术 / 影像摄影 / 信号链路工作流</p>
          </div>
          <div className="sleek-cover-note">
            <span>ZERO INCIDENT</span>
            <strong>408h</strong>
          </div>
        </div>
      </section>

      <motion.section
        className="sleek-intro edit-map-target"
        id="intro"
        data-edit-path="public/content.json: profile + hero"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="sleek-hero-copy">
          <h1 className="sleek-intro-name">
            <span {...syncText(profile ? "profile:name" : undefined)}>{profile?.name ?? content.hero.titleLines[0]}</span>
            <em>
              <i>Zhang</i>
              <i>Linhao</i>
            </em>
          </h1>
          <div className="sleek-intro-tags">
            <span className="sleek-kicker"><Sparkles size={16} /> <span {...syncText("hero:subtitle")}>{content.hero.subtitle}</span></span>
            {profile?.role && <strong className="sleek-role" {...syncText("profile:role")}>{profile.role}</strong>}
          </div>
          <p {...syncText("hero:mainText")}>{content.hero.mainText}</p>

          {profile && (
            <div className="sleek-contact">
              <a href={`tel:${profile.phone.replace(/-/g, "")}`}><Phone size={13} /><span {...syncText("profile:phone")}>{profile.phone}</span></a>
              <a href={`mailto:${profile.email}`}><Mail size={13} /><span {...syncText("profile:email")}>{profile.email}</span></a>
              <span><MapPin size={13} /><span {...syncText("profile:city")}>{profile.city}</span> · <span {...syncText("profile:salary")}>{profile.salary}</span></span>
            </div>
          )}
        </div>

        <motion.div
          className="sleek-avatar-card"
          aria-label="个人头像"
          variants={scaleIn}
        >
          <div className="sleek-avatar-frame">
            {profile?.avatar ? (
              <StoredImage src={profile.avatar} alt={`${profile.name}头像`} sizes="340px" quality={76} />
            ) : (
              <div className="sleek-avatar-placeholder">
                <span>ZL</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      <section
        className="sleek-section sleek-compact edit-map-target"
        id="skills"
        data-edit-path="src/components/PortfolioSite.tsx: expertiseCards 技能卡片"
      >
        <div className="sleek-section-head">
          <div>
            <span>Stack & Expertise</span>
            <h2>技能栈清单</h2>
          </div>
          <p>摄制 / 直播技术 / 影像执行</p>
        </div>
        <div className="sleek-combo-grid">
          {expertiseCards.map((card) => (
              <article
                className="edit-map-target"
                data-edit-path={`src/components/PortfolioSite.tsx: expertiseCards[${card.title}]`}
                key={`${card.eyebrow}-${card.title}`}
              >
              <span>{card.eyebrow}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {content.experience && (
        <section className="sleek-section edit-map-target" id="experience" data-edit-path="public/content.json: experience">
          <div className="sleek-section-head">
            <div>
              <span>Factory Experience</span>
              <h2>大厂项目与现场执行</h2>
            </div>
            <p>直播项目 / 现场统筹 / 技术闭环</p>
          </div>
          <div className="sleek-timeline">
            {content.experience.map((job, jobIndex) => (
              <article
                className="edit-map-target"
                data-edit-path={`public/content.json: experience[${job.company}]`}
                key={job.company}
              >
                <div>
                  <span {...syncText(`experience:${jobIndex}:period`)}>{job.period}</span>
                  <h3 {...syncText(`experience:${jobIndex}:company`)}>{job.company}</h3>
                  <p {...syncText(`experience:${jobIndex}:role`)}>{job.role}</p>
                </div>
                <ul>
                  <li {...syncText(`experience:${jobIndex}:position`)}>{job.position}</li>
                  {job.highlights.slice(0, 4).map((item, highlightIndex) => (
                    <li key={item} {...syncText(`experience:${jobIndex}:highlight:${highlightIndex}`)}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <section
        className="sleek-section sleek-projects edit-map-target"
        id="projects"
        data-edit-path="public/content.json: works；src/lib/projectGroups.ts: 项目分类标题"
      >
        <aside
          className={`sleek-project-floating-nav ${showProjectNav ? "is-visible" : ""}`}
          aria-label="项目快速切换"
        >
          {projectGroups.map((group, groupIndex) => (
            <button
              key={`floating-${group.title}`}
              type="button"
              className={groupIndex === activeProjectGroup ? "active" : ""}
              aria-pressed={groupIndex === activeProjectGroup}
              onClick={() => handleProjectGroupChange(groupIndex)}
            >
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <strong>{group.directoryTitle}</strong>
            </button>
          ))}
        </aside>

        <div className="sleek-section-head">
          <div>
            <span>Selected Projects</span>
            <h2>核心项目复盘</h2>
          </div>
          <p>S级直播 / 明星影像 / 品牌内容</p>
        </div>

        <div className="sleek-project-directory" aria-label="核心项目目录">
          {projectGroups.map((group, groupIndex) => (
            <button
              key={group.title}
              type="button"
              className={`edit-map-target ${groupIndex === activeProjectGroup ? "active" : ""}`}
              data-project-tab
              data-edit-path={`src/lib/projectGroups.ts: ${group.directoryTitle}；content.json works group`}
              aria-pressed={groupIndex === activeProjectGroup}
              onClick={() => handleProjectGroupChange(groupIndex)}
            >
              <small>{String(groupIndex + 1).padStart(2, "0")}</small>
              <h3>
                <span>{group.directoryTitle}</span>
                <em>/ {group.directorySubtitle}</em>
              </h3>
              <div className="sleek-directory-thumb">
                <StoredImage src={group.coverImage} alt={group.coverTitle} sizes="280px" quality={68} />
              </div>
              <strong>{renderDirectoryTitle(group.coverTitle)}</strong>
            </button>
          ))}
        </div>

        {selectedProjectGroup && (
          <article className="sleek-project-group">
            <div className="sleek-project-group-title">
              <h3>{selectedProjectGroup.title}</h3>
              <p>{selectedProjectGroup.directorySubtitle}</p>
            </div>
            <div className="sleek-project-group-items">
              {selectedProjectGroup.items.map((item) => (
                <section
                  className="edit-map-target"
                  data-edit-path={`public/content.json: works[id=${item.id}]`}
                  key={item.name}
                >
                  <div className="sleek-project-case-head">
                    <span>CASE STUDY</span>
                    <h4 {...syncText(`work:${item.id}:subtitle`)}>{item.name}</h4>
                    <p {...syncText(`work:${item.id}:description`)}>{item.description}</p>
                  </div>
                  <div className="sleek-tags">
                    {item.tags.map((tag) => (
                      <em key={tag}>{tag}</em>
                    ))}
                  </div>
                  <div className="sleek-project-video">
                    <div className="sleek-video-frame">
                      <StoredImage src={item.videoImage} alt={`${item.name}展示图`} sizes="690px" quality={72} />
                    </div>
                    <div className="sleek-video-copy">
                      <span>IMAGE SHOWCASE</span>
                      <strong {...syncText(`work:${item.id}:showcaseTitle`)}>
                        {item.showcaseTitle ?? `${item.name} 展示图`}
                      </strong>
                      <p {...syncText(`work:${item.id}:showcaseDescription`)}>
                        {item.showcaseDescription ?? "项目重点展示图位，可用于呈现主视觉、现场截图、信号链路、海报拼图或最终成果画面。"}
                      </p>
                    </div>
                  </div>
                  <div className="sleek-project-facts" aria-label={`${item.name}项目信息`}>
                    {[
                      { title: "项目背景", text: item.description, syncField: `work:${item.id}:description` },
                      { title: "我的职责", text: item.tags.join(" / "), syncField: `work:${item.id}:tags` },
                      {
                        title: "关键成果",
                        text: item.resultText ?? "预留数据、播出结果、传播效果与业务转化说明。",
                        syncField: `work:${item.id}:resultText`,
                      },
                    ].map(({ title, text, syncField }) => (
                      <article key={title}>
                        <span>{title}</span>
                        <p {...syncText(syncField)}>{text}</p>
                      </article>
                    ))}
                  </div>
                  <div className="sleek-project-gallery-groups" aria-label={`${item.name}工作展示图`}>
                    {[
                      {
                        key: "onsite",
                        title: item.galleryText?.onsiteTitle ?? "现场执行",
                        description: item.galleryText?.onsiteDescription ?? "导播台 / 机位 / 灯光 / 调音台",
                        image: item.galleryImages?.onsite ?? item.image,
                      },
                      {
                        key: "signal",
                        title: item.galleryText?.signalTitle ?? "信号链路",
                        description: item.galleryText?.signalDescription ?? "回传设备 / 推流监看 / 主备链路",
                        image: item.galleryImages?.signal ?? item.image,
                      },
                      {
                        key: "output",
                        title: item.galleryText?.outputTitle ?? "成片画面",
                        description: item.galleryText?.outputDescription ?? "直播截图 / TVC画面 / 品牌内容",
                        image: item.galleryImages?.output ?? item.image,
                      },
                    ].map(({ key, title, description, image }) => (
                      <div className="sleek-project-gallery-set" key={key}>
                        <div>
                          <span {...syncText(`work:${item.id}:galleryText:${key}Title`)}>{title}</span>
                          <p {...syncText(`work:${item.id}:galleryText:${key}Description`)}>{description}</p>
                        </div>
                        <div className="sleek-project-gallery">
                          <figure>
                            <StoredImage src={image} alt={`${item.name}${title}展示图`} sizes="1120px" quality={72} />
                          </figure>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        )}
      </section>

      {metrics.length > 0 && (
        <section
          className="sleek-section sleek-data-page edit-map-target"
          aria-label="亮点数据达成"
          data-edit-path="public/content.json: profile.metrics"
        >
          <div className="sleek-section-head">
            <div>
              <span>Data Result</span>
              <h2>亮点数据达成</h2>
            </div>
            <p>曝光数据 / 播放量 / 零事故播出</p>
          </div>
          <div className="sleek-data-stage">
            {[
              metrics.filter((_, index) => index % 2 === 0),
              metrics.filter((_, index) => index % 2 === 1),
            ].map((rowMetrics, rowIndex) => (
              <div className={`sleek-data-row ${rowIndex === 1 ? "offset" : ""}`} aria-label="关键成果数据" key={`metric-row-${rowIndex}`}>
                {[...rowMetrics, ...rowMetrics].map((metric, index) => {
                  const metricIndex = metrics.indexOf(metric);
                  const isClone = index >= rowMetrics.length;

                  return (
                    <article key={`${rowIndex}-${metric.label}-${index}`} aria-hidden={isClone}>
                      <strong {...syncText(isClone ? undefined : `metric:${metricIndex}:value`)}>{metric.value}</strong>
                      <span {...syncText(isClone ? undefined : `metric:${metricIndex}:label`)}>{metric.label}</span>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="sleek-footer edit-map-target" data-edit-path="public/content.json: education + site.author + footer.contact">
        <div>
          <span {...syncText("education")}>{content.education}</span>
          <h2 {...syncText("site:author")}>{content.site.author}</h2>
        </div>
        <a href={`mailto:${content.footer.contact}`}>
          Contact <ArrowUpRight size={18} />
        </a>
      </footer>

      <button
        type="button"
        className={`sleek-scroll-top ${showBackTop ? "is-visible" : ""}`}
        aria-label="返回顶部"
        onClick={handleBackTop}
      >
        <ArrowUp size={20} />
      </button>
    </main>
  );
}
