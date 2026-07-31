"use client";

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, CSSProperties, useMemo, useState } from "react";
import {
  Download,
  ImagePlus,
  Mail,
  Menu,
  MapPin,
  Palette,
  PenLine,
  Phone,
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import type { ContentData, WorkItem } from "@/types/content";

interface PortfolioSiteProps {
  initialContent: ContentData;
}

const storageKey = "pop-portfolio-content-zlh-v2";

function cloneContent(content: ContentData): ContentData {
  return JSON.parse(JSON.stringify(content)) as ContentData;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RetroPortfolioSite({ initialContent }: PortfolioSiteProps) {
  const [content, setContent] = useState<ContentData>(() => cloneContent(initialContent));
  const [editing, setEditing] = useState(false);
  const [activeWorkId, setActiveWorkId] = useState(initialContent.works[0]?.id ?? "01");
  const [savedAt, setSavedAt] = useState("");
  const [saveError, setSaveError] = useState("");

  const activeWork = useMemo(
    () => content.works.find((work) => work.id === activeWorkId) ?? content.works[0],
    [activeWorkId, content.works],
  );

  function updateSite(field: keyof ContentData["site"], value: string) {
    setContent((current) => ({ ...current, site: { ...current.site, [field]: value } }));
  }

  function updateHero(field: keyof ContentData["hero"], value: string) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  }

  function updateWork(workId: string, patch: Partial<WorkItem>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => (work.id === workId ? { ...work, ...patch } : work)),
    }));
  }

  async function handleImageUpload(workId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const image = await readFileAsDataUrl(file);
    updateWork(workId, { image });
  }

  function addWork() {
    const nextNumber = String(content.works.length + 1).padStart(2, "0");
    const work: WorkItem = {
      id: nextNumber,
      title: "NEW WORK",
      subtitle: "新作品",
      description: "在编辑面板里替换标题、介绍和图片。",
      image: "/images/style-reference.jpg",
      tags: ["视觉设计", "Portfolio"],
      links: [{ label: "查看详情", icon: "Eye" }],
    };

    setContent((current) => ({ ...current, works: [...current.works, work] }));
    setActiveWorkId(work.id);
    setEditing(true);
  }

  async function saveLocal() {
    try {
      const response = await fetch("/api/retro-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("Save failed");
      window.localStorage.removeItem(storageKey);
      setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
      setSaveError("");
    } catch {
      setSaveError("保存失败：请确认开发服务仍在运行。");
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "retro-content.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="portfolio-hero">
        <div className="ticker top-0">
          {content.nav.categories.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
          <button className="icon-button" aria-label="菜单">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-xs font-black uppercase">
            <span className="h-3 w-3 rounded-full bg-[#00e6ff]" />
            <span className="h-3 w-3 rounded-full bg-[#ff1c8d]" />
            <span className="h-3 w-3 rounded-full bg-[#fff200]" />
            {content.site.title}
          </div>
          <button className="edit-toggle" onClick={() => setEditing(true)}>
            <PenLine size={16} />
            编辑
          </button>
        </nav>

        <div className="relative z-10 grid min-h-[78vh] grid-cols-1 items-center gap-8 px-5 pb-16 pt-6 md:grid-cols-[1fr_0.82fr] md:px-10 lg:px-16">
          <div className="space-y-5">
            <div className="inline-flex -rotate-3 items-center gap-3 bg-[#f7ff28] px-4 py-2 text-sm font-black text-black shadow-[8px_8px_0_#ff1c8d]">
              <Sparkles size={18} />
              {content.hero.subtitle}
            </div>
            {content.profile && (
              <div className="profile-badges">
                <span>{content.profile.gender} · {content.profile.age}</span>
                <span>{content.profile.degree}</span>
                <span>{content.profile.experience}</span>
              </div>
            )}
            <h1 className="hero-title">
              <span>{content.hero.titleLines[0]}</span>
              <span>{content.hero.titleLines[1]}</span>
              <span>{content.hero.titleLines[2]}</span>
            </h1>
            <p className="max-w-xl border-l-8 border-[#00e6ff] bg-black/70 px-5 py-4 text-lg font-black leading-tight text-white shadow-[10px_10px_0_#2f45ff] md:text-2xl">
              {content.hero.mainText}
            </p>
            <div className="flex flex-wrap gap-3">
              {content.catalog.categories.map((cat) => (
                <a
                  key={cat.id}
                  href="#catalog"
                  className="category-chip"
                  style={{ "--chip": cat.color } as CSSProperties}
                >
                  #{cat.id} {cat.name}
                </a>
              ))}
            </div>
            {content.profile && (
              <div className="contact-row">
                <a href={`tel:${content.profile.phone.replace(/-/g, "")}`}>
                  <Phone size={17} />
                  {content.profile.phone}
                </a>
                <a href={`mailto:${content.profile.email}`}>
                  <Mail size={17} />
                  {content.profile.email}
                </a>
                <span>
                  <MapPin size={17} />
                  {content.profile.city} · {content.profile.salary}
                </span>
              </div>
            )}
          </div>

          <div className="hero-scrapbook">
            <div className="year-bubble">{content.profile?.experience ?? "2026"}</div>
            <div className="paper-frame">
              <img src={activeWork?.image || "/images/style-reference.jpg"} alt={activeWork?.subtitle ?? "作品预览"} />
              <div className="paper-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="spiral" />
            <div className="sticker sticker-blue">{content.hero.searchValue}</div>
            <div className="sticker sticker-yellow">{content.hero.exchangeValue}</div>
          </div>
        </div>

        <div className="ticker bottom-0">
          {content.nav.categories.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {content.profile && (
        <>
          {content.profile.metrics && (
            <section className="metrics-strip" aria-label="关键成果">
              {content.profile.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </section>
          )}

          <section className="profile-section">
            <div className="profile-card primary">
              <p>PROFILE · 个人定位</p>
              <h2>{content.profile.role}</h2>
              <strong>{content.profile.summary}</strong>
            </div>
            <div className="profile-card">
              <p>ADVANTAGES · 个人优势</p>
              <ul>
                {content.profile.advantages.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      <section id="catalog" className="catalog-section">
        <div className="section-heading">
          <div>
            <p>CATALOGS · 目录</p>
            <h2>{content.catalog.title}</h2>
          </div>
          <span>核心项目复盘</span>
        </div>

        <div className="work-grid">
          {content.works.map((work) => (
            <article
              key={work.id}
              className={`work-tile ${activeWorkId === work.id ? "is-active" : ""}`}
              onMouseEnter={() => setActiveWorkId(work.id)}
            >
              <div className="work-image">
                <img src={work.image} alt={work.subtitle} />
              </div>
              <h3>#{work.id} {work.subtitle}</h3>
              <p>{work.description}</p>
              <div className="tag-row">
                {work.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {content.experience && (
        <section className="resume-section">
          <div className="section-heading compact">
            <div>
              <p>EXPERIENCE · 工作经历</p>
              <h2>WORK</h2>
            </div>
            <span>直播技术与影像执行闭环</span>
          </div>

          <div className="timeline">
            {content.experience.map((job) => (
              <article key={job.company} className="timeline-item">
                <div className="timeline-meta">
                  <span>{job.period}</span>
                  <strong>{job.company}</strong>
                  <em>{job.role}</em>
                </div>
                <div className="timeline-body">
                  <h3>{job.position}</h3>
                  <ul>
                    {job.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {content.skills && (
        <section className="skills-section">
          <div className="section-heading compact">
            <div>
              <p>SKILLS · 技能栈清单</p>
              <h2>STACK</h2>
            </div>
            <span>{content.education}</span>
          </div>

          <div className="skill-grid">
            {content.skills.map((group) => (
              <article key={group.title} className="skill-card">
                <h3>{group.title}</h3>
                <div>
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="about-strip">
        <div>
          <p>{content.hero.arcText}</p>
          <h2>{content.site.author}</h2>
        </div>
        <a href={`mailto:${content.footer.contact}`}>
          <Mail size={18} />
          {content.footer.contact}
        </a>
      </section>

      {editing && (
        <aside className="editor-panel" aria-label="编辑内容">
          <div className="editor-header">
            <div>
              <p>EDIT MODE</p>
              <h2>旧版直播技术简历</h2>
            </div>
            <button className="icon-button dark" onClick={() => setEditing(false)} aria-label="关闭编辑面板">
              <X size={20} />
            </button>
          </div>

          <p className="editor-scope-note">此处只保存旧版 <code>/retro</code> 页面数据，不会修改主站 <code>/admin</code> 的内容、案例或上传媒体。</p>

          <div className="editor-divider">
            <Palette size={16} />
            首页与个人信息
          </div>

          <label>
            网站标题
            <input value={content.site.title} onChange={(event) => updateSite("title", event.target.value)} />
          </label>
          <label>
            作者/姓名
            <input value={content.site.author} onChange={(event) => updateSite("author", event.target.value)} />
          </label>
          <label>
            主标题第一行
            <input value={content.hero.titleLines[0]} onChange={(event) => {
              const titleLines = [...content.hero.titleLines];
              titleLines[0] = event.target.value;
              setContent((current) => ({ ...current, hero: { ...current.hero, titleLines } }));
            }} />
          </label>
          <label>
            主标题第二行
            <input value={content.hero.titleLines[1]} onChange={(event) => {
              const titleLines = [...content.hero.titleLines];
              titleLines[1] = event.target.value;
              setContent((current) => ({ ...current, hero: { ...current.hero, titleLines } }));
            }} />
          </label>
          <label>
            主视觉文案
            <textarea value={content.hero.mainText} onChange={(event) => updateHero("mainText", event.target.value)} />
          </label>

          <div className="editor-divider">
            <Palette size={16} />
            旧版项目内容（仅 /retro）
          </div>

          <div className="work-tabs">
            {content.works.map((work) => (
              <button
                key={work.id}
                className={activeWorkId === work.id ? "active" : ""}
                onClick={() => setActiveWorkId(work.id)}
              >
                {work.id}
              </button>
            ))}
            <button onClick={addWork} aria-label="添加作品">
              <Plus size={16} />
            </button>
          </div>

          {activeWork && (
            <div className="editor-work">
              <label>
                作品分类标题
                <input value={activeWork.title} onChange={(event) => updateWork(activeWork.id, { title: event.target.value })} />
              </label>
              <label>
                作品名称
                <input value={activeWork.subtitle} onChange={(event) => updateWork(activeWork.id, { subtitle: event.target.value })} />
              </label>
              <label>
                作品介绍
                <textarea value={activeWork.description} onChange={(event) => updateWork(activeWork.id, { description: event.target.value })} />
              </label>
              <label>
                标签，用逗号分隔
                <input
                  value={activeWork.tags.join(", ")}
                  onChange={(event) => updateWork(activeWork.id, {
                    tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                  })}
                />
              </label>
              <label className="upload-box">
                <ImagePlus size={18} />
                上传/替换图片
                <input type="file" accept="image/*" onChange={(event) => handleImageUpload(activeWork.id, event)} />
              </label>
            </div>
          )}

          <div className="editor-actions">
            <button onClick={saveLocal}>
              <Save size={16} />
              保存旧版数据
            </button>
            <button onClick={exportJson}>
              <Download size={16} />
              导出 JSON
            </button>
          </div>
          {savedAt && <p className="saved-note">已保存 {savedAt}</p>}
          {saveError && <p className="saved-note">{saveError}</p>}
        </aside>
      )}

      <button className="floating-edit" onClick={() => setEditing(true)} aria-label="打开编辑面板">
        <PenLine size={20} />
      </button>
    </main>
  );
}
