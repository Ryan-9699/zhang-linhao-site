"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Save, Trash2, Video } from "lucide-react";
import Link from "next/link";
import StoredImage from "@/components/StoredImage";
import type {
  ArchiveImageItem,
  CapabilityItem,
  ContentData,
  ExperienceItem,
  ProfileConfig,
  SectionCopyConfig,
  SkillGroup,
  WorkCaseMetric,
  WorkCaseStep,
  WorkItem,
} from "@/types/content";

interface AdminEditorProps {
  initialContent: ContentData;
}

function cloneContent(content: ContentData): ContentData {
  return JSON.parse(JSON.stringify(content)) as ContentData;
}

function createNextWorkId(works: WorkItem[]) {
  const maxId = works.reduce((max, work) => {
    const numericId = Number.parseInt(work.id, 10);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return String(maxId + 1).padStart(2, "0");
}

function isVideoSource(src?: string) {
  return Boolean(src && /\.(mp4|webm|mov)(\?.*)?$/i.test(src));
}

function textToLines(value: string) {
  return value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaList(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createArchiveImageId(items: ArchiveImageItem[]) {
  const maxId = items.reduce((max, item) => {
    const match = item.id.match(/(\d+)$/);
    const numericId = match ? Number.parseInt(match[1], 10) : 0;
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return `archive-${String(maxId + 1).padStart(2, "0")}`;
}

const defaultCaseMetrics: WorkCaseMetric[] = [
  { title: "Edit", label: "可剪性" },
  { title: "Visual", label: "镜头质感" },
  { title: "AIGC", label: "版本效率" },
];

const defaultCaseSteps: WorkCaseStep[] = [
  {
    number: "01",
    title: "脚本转镜头",
    text: "把脚本、参考片和传播目标拆成景别、机位、运动方向、情绪节奏和画面优先级。",
  },
  {
    number: "02",
    title: "生成与质检",
    text: "多轮生成后按主体稳定、透视合理、光色统一、可剪可接来筛选，不合格版本直接淘汰。",
  },
  {
    number: "03",
    title: "剪辑交付",
    text: "进入时间线测试开头钩子、节奏段落、转场衔接和封面包装，再输出可展示的成片版本。",
  },
];

const defaultCaseNotes = [
  "对标 AI 视频创意、短剧分镜和视频制作岗位要求，重点呈现“理解脚本-组织镜头-判断素材-完成成片”的能力。",
  "判断 AI 镜头是否可用时，不只看单帧质感，更看主体运动、透视变化、节奏长度和下一镜能否接上。",
  "用摄影和后期经验反推生成标准，让素材从“视觉参考”进一步变成能剪、能包装、能进入商业内容流程的资产。",
];

function getCaseMetrics(work?: WorkItem) {
  return work?.caseMethod?.metrics?.length ? work.caseMethod.metrics : defaultCaseMetrics;
}

function getCaseSteps(work?: WorkItem) {
  return work?.caseMethod?.steps?.length ? work.caseMethod.steps : defaultCaseSteps;
}

function AdminMediaPreview({ src, poster, alt }: { src?: string; poster?: string; alt: string }) {
  if (isVideoSource(src)) {
    return <video src={src} poster={poster} controls playsInline preload="metadata" />;
  }

  return <StoredImage src={src ?? poster} alt={alt} />;
}

async function uploadProjectMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const result = (await response.json()) as { url?: string };
  if (!result.url) {
    throw new Error("Upload response missing url");
  }

  return result.url;
}

export default function AdminEditor({ initialContent }: AdminEditorProps) {
  const [content, setContent] = useState<ContentData>(() => cloneContent(initialContent));
  const [activeWorkId, setActiveWorkId] = useState(content.works[0]?.id ?? "01");
  const [savedAt, setSavedAt] = useState("");
  const [saveError, setSaveError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const activeWork = content.works.find((work) => work.id === activeWorkId) ?? content.works[0];
  const activeWorkIndex = content.works.findIndex((work) => work.id === activeWork?.id);
  const profileAdvantages = content.profile?.advantages ?? [];
  const profileStatline = content.profile?.statline?.length
    ? content.profile.statline
    : ["6+ 年影视摄影与直播视觉制作", "快手 / 网易有道", "S 级项目现场执行"];
  const capabilityItems = content.capabilities ?? [];
  const experienceItems = content.experience ?? [];
  const skillItems = content.skills ?? [];

  const persistContent = useCallback(async (nextContent: ContentData): Promise<boolean> => {
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContent),
      });
      if (!response.ok) throw new Error("Save failed");
      setContent(nextContent);
      setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
      setSaveError("");
      return true;
    } catch {
      setSaveError("保存失败：请确认开发服务仍在运行，或换一张较小图片。");
      return false;
    }
  }, []);

  function updateProfileField<K extends keyof ProfileConfig>(field: K, value: ProfileConfig[K]) {
    setContent((current) => ({
      ...current,
      profile: current.profile ? { ...current.profile, [field]: value } : current.profile,
    }));
  }

  function updateHeroTitleLine(index: number, value: string) {
    setContent((current) => {
      const titleLines = [...current.hero.titleLines];
      titleLines[index] = value;
      return { ...current, hero: { ...current.hero, titleLines } };
    });
  }

  function updateHeroMainText(value: string) {
    setContent((current) => ({ ...current, hero: { ...current.hero, mainText: value } }));
  }

  function updateProfileStatline(index: number, value: string) {
    setContent((current) => {
      if (!current.profile) return current;
      const statline = [...profileStatline];
      statline[index] = value;
      return { ...current, profile: { ...current.profile, statline } };
    });
  }

  function updateAdvantage(index: number, value: string) {
    setContent((current) => {
      if (!current.profile) return current;
      const advantages = [...(current.profile.advantages ?? [])];
      advantages[index] = value;
      return { ...current, profile: { ...current.profile, advantages } };
    });
  }

  function updateSectionCopy<K extends keyof SectionCopyConfig>(field: K, value: SectionCopyConfig[K]) {
    setContent((current) => ({
      ...current,
      sectionCopy: { ...(current.sectionCopy ?? {}), [field]: value },
    }));
  }

  function updateContactTitleLine(index: number, value: string) {
    setContent((current) => {
      const contactTitleLines = [...(current.sectionCopy?.contactTitleLines ?? ["Let's Cut", "Better Visuals"])];
      contactTitleLines[index] = value;
      return { ...current, sectionCopy: { ...(current.sectionCopy ?? {}), contactTitleLines } };
    });
  }

  function updateArchiveImage(index: number, patch: Partial<ArchiveImageItem>) {
    setContent((current) => {
      const archiveImages = [...(current.archiveImages ?? [])];
      const currentItem = archiveImages[index] ?? {
        id: createArchiveImageId(archiveImages),
        title: "归档图片",
        subtitle: "Visual Archive",
        image: "/images/style-reference.jpg",
      };
      archiveImages[index] = { ...currentItem, ...patch };
      return { ...current, archiveImages };
    });
  }

  function deleteArchiveImage(index: number) {
    const nextContent = {
      ...content,
      archiveImages: (content.archiveImages ?? []).filter((_, itemIndex) => itemIndex !== index),
    };
    setContent(nextContent);
    void persistContent(nextContent);
  }

  function updateCapability(index: number, patch: Partial<CapabilityItem>) {
    setContent((current) => {
      const capabilities = [...(current.capabilities ?? [])];
      const currentCapability = capabilities[index] ?? { title: "", text: "", items: [] };
      capabilities[index] = { ...currentCapability, ...patch };
      return { ...current, capabilities };
    });
  }

  function addCapability() {
    setContent((current) => ({
      ...current,
      capabilities: [...(current.capabilities ?? []), { title: "新核心能力", text: "填写能力说明。", items: ["标签一", "标签二"] }],
    }));
  }

  function deleteCapability(index: number) {
    setContent((current) => ({
      ...current,
      capabilities: (current.capabilities ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateExperience(index: number, patch: Partial<ExperienceItem>) {
    setContent((current) => {
      const experience = [...(current.experience ?? [])];
      const currentItem = experience[index] ?? { company: "", role: "", period: "", position: "", highlights: [] };
      experience[index] = { ...currentItem, ...patch };
      return { ...current, experience };
    });
  }

  function addExperience() {
    setContent((current) => ({
      ...current,
      experience: [
        ...(current.experience ?? []),
        { company: "新公司/项目", role: "岗位/职责", period: "时间", position: "一句话说明负责内容。", highlights: ["项目亮点"] },
      ],
    }));
  }

  function deleteExperience(index: number) {
    setContent((current) => ({
      ...current,
      experience: (current.experience ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateSkill(index: number, patch: Partial<SkillGroup>) {
    setContent((current) => {
      const skills = [...(current.skills ?? [])];
      const currentItem = skills[index] ?? { title: "", note: "", items: [] };
      skills[index] = { ...currentItem, ...patch };
      return { ...current, skills };
    });
  }

  function addSkill() {
    setContent((current) => ({
      ...current,
      skills: [...(current.skills ?? []), { title: "新技能组", note: "填写这组技能的说明。", items: ["技能一", "技能二"] }],
    }));
  }

  function deleteSkill(index: number) {
    setContent((current) => ({
      ...current,
      skills: (current.skills ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateWork(workId: string, patch: Partial<WorkItem>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => (work.id === workId ? { ...work, ...patch } : work)),
    }));
  }

  function updateWorkCaseMethod(workId: string, patch: Partial<NonNullable<WorkItem["caseMethod"]>>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => (
        work.id === workId
          ? { ...work, caseMethod: { ...(work.caseMethod ?? {}), ...patch } }
          : work
      )),
    }));
  }

  function updateWorkCaseMetric(workId: string, index: number, patch: Partial<WorkCaseMetric>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => {
        if (work.id !== workId) return work;
        const metrics = getCaseMetrics(work).map((metric, metricIndex) => (
          metricIndex === index ? { ...metric, ...patch } : metric
        ));
        return { ...work, caseMethod: { ...(work.caseMethod ?? {}), metrics } };
      }),
    }));
  }

  function updateWorkCaseStep(workId: string, index: number, patch: Partial<WorkCaseStep>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => {
        if (work.id !== workId) return work;
        const steps = getCaseSteps(work).map((step, stepIndex) => (
          stepIndex === index ? { ...step, ...patch } : step
        ));
        return { ...work, caseMethod: { ...(work.caseMethod ?? {}), steps } };
      }),
    }));
  }

  function updateWorkGalleryText(workId: string, patch: NonNullable<WorkItem["galleryText"]>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => (
        work.id === workId
          ? { ...work, galleryText: { ...(work.galleryText ?? {}), ...patch } }
          : work
      )),
    }));
  }

  function persistWorkPatch(workId: string, patch: Partial<WorkItem>) {
    setContent((current) => {
      const nextContent = {
        ...current,
        works: current.works.map((work) => (work.id === workId ? { ...work, ...patch } : work)),
      };
      void persistContent(nextContent);
      return nextContent;
    });
  }

  function addWorkPage() {
    const nextId = createNextWorkId(content.works);
    const nextWork: WorkItem = {
      id: nextId,
      title: "PROJECT",
      subtitle: `新项目 ${nextId}`,
      description: "填写作品卡片和归档里展示的项目描述。",
      image: "/images/style-reference.jpg",
      caseRole: "填写详情页中的项目定位/职责。",
      caseDetails: ["填写项目职责或执行动作。"],
      resultText: "填写详情页开头的大段项目说明。",
      caseMethod: {
        visualText: "填写视觉方法说明：脚本如何拆镜头，素材如何判断可用，最后如何进入剪辑包装和交付。",
        metrics: defaultCaseMetrics,
        steps: defaultCaseSteps,
        notesTitle: "从素材到成片的制作经验",
        notes: defaultCaseNotes,
      },
      tags: ["项目展示", "后期制作"],
      links: [{ label: "项目展示", icon: "Eye" }],
    };
    const nextContent = { ...content, works: [...content.works, nextWork] };

    setContent(nextContent);
    setActiveWorkId(nextId);
    setDeleteConfirmId("");
    void persistContent(nextContent);
  }

  function deleteActiveWork() {
    if (!activeWork) return;
    if (content.works.length <= 1) {
      setSaveError("至少需要保留一个项目页面。");
      return;
    }

    if (deleteConfirmId !== activeWork.id) {
      setDeleteConfirmId(activeWork.id);
      setSaveError("再次点击“确认删除”才会删除当前页面。");
      return;
    }

    const activeIndex = content.works.findIndex((work) => work.id === activeWork.id);
    const works = content.works.filter((work) => work.id !== activeWork.id);
    const nextActiveWork = works[Math.max(0, activeIndex - 1)] ?? works[0];
    const nextContent = { ...content, works };

    setContent(nextContent);
    setActiveWorkId(nextActiveWork?.id ?? "");
    setDeleteConfirmId("");
    void persistContent(nextContent);
  }

  function moveActiveWork(direction: -1 | 1) {
    if (!activeWork || activeWorkIndex < 0) return;
    const nextIndex = activeWorkIndex + direction;
    if (nextIndex < 0 || nextIndex >= content.works.length) return;

    const works = [...content.works];
    const [movedWork] = works.splice(activeWorkIndex, 1);
    works.splice(nextIndex, 0, movedWork);

    const nextContent = { ...content, works };
    setContent(nextContent);
    setActiveWorkId(movedWork.id);
    setDeleteConfirmId("");
    void persistContent(nextContent);
  }

  function moveActiveWorkToIndex(nextIndex: number) {
    if (!activeWork || activeWorkIndex < 0 || nextIndex < 0 || nextIndex >= content.works.length || nextIndex === activeWorkIndex) return;

    const works = [...content.works];
    const [movedWork] = works.splice(activeWorkIndex, 1);
    works.splice(nextIndex, 0, movedWork);

    const nextContent = { ...content, works };
    setContent(nextContent);
    setActiveWorkId(movedWork.id);
    setDeleteConfirmId("");
    void persistContent(nextContent);
  }

  async function uploadImage(workId: string, field: "image" | "videoImage" | "workflowImage", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await uploadProjectMedia(file);
      persistWorkPatch(workId, { [field]: image });
      event.currentTarget.value = "";
    } catch {
      setSaveError("图片上传失败：请使用 JPG / PNG / WebP / GIF / AVIF / SVG 图片。");
    }
  }

  async function uploadShowcaseVideo(workId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const showcaseVideo = await uploadProjectMedia(file);
      persistWorkPatch(workId, { showcaseVideo });
      event.currentTarget.value = "";
    } catch {
      setSaveError("视频上传失败：请使用 MP4 / WebM / MOV，建议压到 90MB 以内。");
    }
  }

  async function uploadGalleryVideo(workId: string, field: "onsite" | "signal" | "output", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const video = await uploadProjectMedia(file);
      const work = content.works.find((item) => item.id === workId);
      persistWorkPatch(workId, {
        galleryVideos: {
          ...(work?.galleryVideos ?? {}),
          [field]: video,
        },
      });
      event.currentTarget.value = "";
    } catch {
      setSaveError("视频上传失败：请使用 MP4 / WebM / MOV，建议压到 90MB 以内。");
    }
  }

  async function uploadGalleryImage(workId: string, field: "onsite" | "signal" | "output", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await uploadProjectMedia(file);
      const work = content.works.find((item) => item.id === workId);
      persistWorkPatch(workId, {
        galleryImages: {
          ...(work?.galleryImages ?? {}),
          [field]: image,
        },
      });
      event.currentTarget.value = "";
    } catch {
      setSaveError("图片上传失败：请使用 JPG / PNG / WebP / GIF / AVIF / SVG 图片。");
    }
  }

  async function uploadArchiveImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      const uploadedImages = await Promise.all(files.map(async (file) => ({
        title: file.name.replace(/\.[^.]+$/, ""),
        image: await uploadProjectMedia(file),
      })));

      const archiveImages = [...(content.archiveImages ?? [])];
      const nextNumber = archiveImages.reduce((max, item) => {
        const match = item.id.match(/(\d+)$/);
        const numericId = match ? Number.parseInt(match[1], 10) : 0;
        return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
      }, 0) + 1;
      const nextItems = uploadedImages.map((item, index) => ({
        id: `archive-${String(nextNumber + index).padStart(2, "0")}`,
        title: item.title,
        subtitle: "独立瀑布流图片",
        image: item.image,
      }));
      const nextContent = {
        ...content,
        archiveImages: [...archiveImages, ...nextItems],
      };

      setContent(nextContent);
      void persistContent(nextContent);
      event.currentTarget.value = "";
    } catch {
      setSaveError("瀑布流图片上传失败：请使用 JPG / PNG / WebP / GIF / AVIF / SVG 图片。");
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatar = await uploadProjectMedia(file);
      setContent((current) => {
        const nextContent = { ...current, profile: current.profile ? { ...current.profile, avatar } : current.profile };
        void persistContent(nextContent);
        return nextContent;
      });
      event.currentTarget.value = "";
    } catch {
      setSaveError("头像上传失败：请使用 JPG / PNG / WebP / GIF / AVIF 图片。");
    }
  }

  function saveLocal() {
    void persistContent(content);
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-heading">
          <div>
            <span>PORTFOLIO CMS</span>
            <h1>网站内容后台</h1>
            <p>只编辑当前主站会显示的内容。修改后点击底部保存，上传媒体会自动写入主站数据。</p>
          </div>
          <div className="admin-heading-actions">
            <Link href="/">查看主站</Link>
            <Link href="/retro">编辑旧版 /retro</Link>
          </div>
        </div>

        <div className="admin-grid">
          <form className="admin-panel" onSubmit={(event) => event.preventDefault()}>
            <div className="admin-panel-title">
              <h2>首页与个人信息</h2>
              <span className="admin-mini-note">主站首屏 / Profile / 联系方式</span>
            </div>
            <p className="admin-scope-note">本页只保存到主站 <code>content.json</code>；旧版直播技术简历使用独立的 <code>/retro</code> 编辑面板与数据文件，互不覆盖。</p>

            <div className="admin-subsection admin-subsection-first">
              <div className="admin-subsection-head">
                <div>
                  <h3>首页主视觉</h3>
                  <p>对应主站首屏标题和开场说明。</p>
                </div>
              </div>
              <div className="admin-field-grid">
              {[0, 1].map((index) => (
                <label key={index}>
                  首屏标题 {index + 1}
                  <input value={content.hero.titleLines[index] ?? ""} onChange={(event) => updateHeroTitleLine(index, event.target.value)} />
                </label>
              ))}
              </div>
              <label>
                首屏文案
                <textarea value={content.hero.mainText} onChange={(event) => updateHeroMainText(event.target.value)} />
              </label>
            </div>

            <div className="admin-subsection">
              <div className="admin-subsection-head">
                <div>
                  <h3>个人资料与联系</h3>
                  <p>对应头像、Profile 履历摘要和页尾联系方式。</p>
                </div>
              </div>
              <div className="admin-field-grid">
              <label>
                姓名
                <input value={content.profile?.name ?? ""} onChange={(event) => updateProfileField("name", event.target.value)} />
              </label>
              <label>
                职业定位
                <input value={content.profile?.role ?? ""} onChange={(event) => updateProfileField("role", event.target.value)} />
              </label>
              <label>
                期望城市
                <input value={content.profile?.city ?? ""} onChange={(event) => updateProfileField("city", event.target.value)} />
              </label>
              <label>
                性别
                <input value={content.profile?.gender ?? ""} onChange={(event) => updateProfileField("gender", event.target.value)} />
              </label>
              <label>
                年龄
                <input value={content.profile?.age ?? ""} onChange={(event) => updateProfileField("age", event.target.value)} />
              </label>
              <label>
                学历
                <input value={content.profile?.degree ?? ""} onChange={(event) => updateProfileField("degree", event.target.value)} />
              </label>
              <label>
                经验
                <input value={content.profile?.experience ?? ""} onChange={(event) => updateProfileField("experience", event.target.value)} />
              </label>
              <label>
                电话
                <input value={content.profile?.phone ?? ""} onChange={(event) => updateProfileField("phone", event.target.value)} />
              </label>
              <label>
                邮箱
                <input
                  value={content.profile?.email ?? ""}
                  onChange={(event) => setContent((current) => ({
                    ...current,
                    profile: current.profile ? { ...current.profile, email: event.target.value } : current.profile,
                    footer: { ...current.footer, contact: event.target.value },
                  }))}
                />
              </label>
              </div>
              <label>
                Profile 摘要
                <textarea value={content.profile?.summary ?? ""} onChange={(event) => updateProfileField("summary", event.target.value)} />
              </label>
              <div className="admin-field-grid">
              {profileStatline.map((item, index) => (
                <label key={index}>
                  履历短标签 {index + 1}
                  <input value={item} onChange={(event) => updateProfileStatline(index, event.target.value)} />
                </label>
              ))}
              </div>
              <label className="admin-upload">
                <ImagePlus size={18} />
                上传/替换头像
                <input type="file" accept="image/*,.svg" onChange={uploadAvatar} />
              </label>
              {content.profile?.avatar && (
                <div className="admin-avatar-preview">
                  <StoredImage src={content.profile.avatar} alt="头像预览" />
                  <span>头像已保存</span>
                </div>
              )}
            </div>

            <div className="admin-subsection">
              <h3>页面文案</h3>
              <label>
                工作经历区标题
                <textarea value={content.sectionCopy?.experienceTitle ?? ""} onChange={(event) => updateSectionCopy("experienceTitle", event.target.value)} />
              </label>
              <label>
                项目作品区标题
                <textarea value={content.sectionCopy?.worksTitle ?? ""} onChange={(event) => updateSectionCopy("worksTitle", event.target.value)} />
              </label>
              <label>
                归档图片区标题
                <textarea value={content.sectionCopy?.archiveTitle ?? ""} onChange={(event) => updateSectionCopy("archiveTitle", event.target.value)} />
              </label>
              <label>
                技能区标题
                <textarea value={content.sectionCopy?.skillsTitle ?? ""} onChange={(event) => updateSectionCopy("skillsTitle", event.target.value)} />
              </label>
              <div className="admin-field-grid">
                {[0, 1].map((index) => (
                  <label key={index}>
                    联系区大字 {index + 1}
                    <input
                      value={(content.sectionCopy?.contactTitleLines ?? ["Let's Cut", "Better Visuals"])[index] ?? ""}
                      onChange={(event) => updateContactTitleLine(index, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <label>
                联系区说明
                <textarea value={content.sectionCopy?.contactText ?? ""} onChange={(event) => updateSectionCopy("contactText", event.target.value)} />
              </label>
            </div>

            <div className="admin-subsection">
              <h3>项目案例与媒体 · 首页归档</h3>
              <p className="admin-mini-note">只控制首页「项目图片瀑布流展示」这一块，不会影响上方项目卡片、详情页图片或视频封面。</p>
              <label className="admin-upload">
                <ImagePlus size={18} />
                上传瀑布流图片（可多选）
                <input type="file" accept="image/*,.svg" multiple onChange={uploadArchiveImage} />
              </label>
              <div className="admin-work-preview">
                {(content.archiveImages ?? []).map((item, index) => (
                  <article key={item.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <AdminMediaPreview src={item.image} alt={`${item.title}预览`} />
                    <input
                      aria-label="瀑布流图片标题"
                      value={item.title}
                      onChange={(event) => updateArchiveImage(index, { title: event.target.value })}
                    />
                    <input
                      aria-label="瀑布流图片说明"
                      value={item.subtitle ?? ""}
                      onChange={(event) => updateArchiveImage(index, { subtitle: event.target.value })}
                    />
                    <button className="admin-danger-action" type="button" onClick={() => deleteArchiveImage(index)}>
                      删除
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-subsection">
              <h3>能力与经历 · 个人优势</h3>
              {profileAdvantages.map((advantage, index) => (
                <label key={index}>
                  优势 {index + 1}
                  <textarea value={advantage} onChange={(event) => updateAdvantage(index, event.target.value)} />
                </label>
              ))}
            </div>
          </form>

          <div className="admin-panel">
            <div className="admin-panel-title">
              <h2>能力与经历</h2>
              <span className="admin-mini-note">核心能力 / 工作经历 / 工作技能</span>
            </div>

            <div className="admin-subsection admin-subsection-first">
              <div className="admin-subsection-head">
                <div>
                  <h3>核心能力</h3>
                  <p>对应首页 What I Do 区域。</p>
                </div>
                <button className="admin-add-button" onClick={addCapability} type="button"><Plus size={16} />添加</button>
              </div>
              <div className="admin-list-editor">
                {capabilityItems.map((capability, index) => (
                  <article className="admin-list-card" key={`${capability.title}-${index}`}>
                    <div className="admin-list-card-head">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button className="admin-delete-button" onClick={() => deleteCapability(index)} type="button"><Trash2 size={14} />删除</button>
                    </div>
                    <label>标题<input value={capability.title} onChange={(event) => updateCapability(index, { title: event.target.value })} /></label>
                    <label>说明<textarea value={capability.text} onChange={(event) => updateCapability(index, { text: event.target.value })} /></label>
                    <label>标签（逗号分隔）<input value={capability.items.join(", ")} onChange={(event) => updateCapability(index, { items: commaList(event.target.value) })} /></label>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-subsection">
              <div className="admin-subsection-head">
                <div>
                  <h3>工作经历</h3>
                  <p>对应 Experience 时间线。</p>
                </div>
                <button className="admin-add-button" onClick={addExperience} type="button"><Plus size={16} />添加</button>
              </div>
              <div className="admin-list-editor">
                {experienceItems.map((item, index) => (
                  <article className="admin-list-card" key={`${item.company}-${index}`}>
                    <div className="admin-list-card-head">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button className="admin-delete-button" onClick={() => deleteExperience(index)} type="button"><Trash2 size={14} />删除</button>
                    </div>
                    <div className="admin-field-grid">
                      <label>公司<input value={item.company} onChange={(event) => updateExperience(index, { company: event.target.value })} /></label>
                      <label>岗位<input value={item.role} onChange={(event) => updateExperience(index, { role: event.target.value })} /></label>
                      <label>时间<input value={item.period} onChange={(event) => updateExperience(index, { period: event.target.value })} /></label>
                    </div>
                    <label>职责概述<textarea value={item.position} onChange={(event) => updateExperience(index, { position: event.target.value })} /></label>
                    <label>亮点（每行一条）<textarea value={item.highlights.join("\n")} onChange={(event) => updateExperience(index, { highlights: textToLines(event.target.value) })} /></label>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-subsection">
              <div className="admin-subsection-head">
                <div>
                  <h3>技能组</h3>
                  <p>对应 Work Skills 区域。</p>
                </div>
                <button className="admin-add-button" onClick={addSkill} type="button"><Plus size={16} />添加</button>
              </div>
              <div className="admin-list-editor">
                {skillItems.map((skill, index) => (
                  <article className="admin-list-card" key={`${skill.title}-${index}`}>
                    <div className="admin-list-card-head">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button className="admin-delete-button" onClick={() => deleteSkill(index)} type="button"><Trash2 size={14} />删除</button>
                    </div>
                    <label>技能组标题<input value={skill.title} onChange={(event) => updateSkill(index, { title: event.target.value })} /></label>
                    <label>说明<input value={skill.note ?? ""} onChange={(event) => updateSkill(index, { note: event.target.value })} /></label>
                    <label>技能（逗号分隔）<input value={skill.items.join(", ")} onChange={(event) => updateSkill(index, { items: commaList(event.target.value) })} /></label>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel admin-work-panel">
          <div className="admin-panel-title">
            <h2>项目案例与媒体</h2>
            <div className="admin-project-tools">
              <button className="admin-order-button" disabled={activeWorkIndex <= 0} onClick={() => moveActiveWork(-1)} type="button">
                <ArrowLeft size={16} />前移
              </button>
              <button
                className="admin-order-button"
                disabled={activeWorkIndex < 0 || activeWorkIndex >= content.works.length - 1}
                onClick={() => moveActiveWork(1)}
                type="button"
              >
                后移<ArrowRight size={16} />
              </button>
              <button className="admin-add-button" onClick={addWorkPage} type="button"><Plus size={16} />添加项目</button>
              <button className={`admin-delete-button ${deleteConfirmId === activeWork?.id ? "confirm" : ""}`} onClick={deleteActiveWork} type="button">
                <Trash2 size={16} />{deleteConfirmId === activeWork?.id ? "确认删除" : "删除项目"}
              </button>
            </div>
          </div>

          <div className="admin-tabs">
            {content.works.map((work) => (
              <button key={work.id} className={work.id === activeWorkId ? "active" : ""} onClick={() => { setDeleteConfirmId(""); setActiveWorkId(work.id); }} type="button">
                <span>{work.id}</span>
                <strong>{work.subtitle}</strong>
              </button>
            ))}
          </div>
          <p className="admin-tabs-help">前 4 个项目会作为大案例展示，其余项目进入归档图片区。可以通过前移/后移调整顺序。</p>

          {activeWork && (
            <div className="admin-work-editor">
              <div className="admin-field-grid">
                <label>案例标题<input value={activeWork.subtitle} onChange={(event) => updateWork(activeWork.id, { subtitle: event.target.value })} /></label>
                <label>归档小标签<input value={activeWork.title} onChange={(event) => updateWork(activeWork.id, { title: event.target.value })} /></label>
                <label>
                  排序位置
                  <select value={activeWorkIndex} onChange={(event) => moveActiveWorkToIndex(Number(event.target.value))}>
                    {content.works.map((work, index) => (
                      <option value={index} key={work.id}>第 {index + 1} 位 · {work.subtitle}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>作品卡片描述<textarea value={activeWork.description} onChange={(event) => updateWork(activeWork.id, { description: event.target.value })} /></label>
              <label>详情页项目定位<input value={activeWork.caseRole ?? ""} onChange={(event) => updateWork(activeWork.id, { caseRole: event.target.value })} /></label>
              <label>详情页开头说明<textarea value={activeWork.resultText ?? ""} onChange={(event) => updateWork(activeWork.id, { resultText: event.target.value })} /></label>
              <label>详情页项目职责（每行一条）<textarea value={(activeWork.caseDetails ?? []).join("\n")} onChange={(event) => updateWork(activeWork.id, { caseDetails: textToLines(event.target.value) })} /></label>
              <div className="admin-subsection admin-detail-copy-editor">
                <h3>案例详情页文案与媒体说明</h3>
                <p>用于案例详情页的展示图、现场图和更多项目画面说明。每个项目单独保存，互不影响。</p>
                <div className="admin-field-grid">
                  <label>
                    展示图标题
                    <input
                      value={activeWork.showcaseTitle ?? ""}
                      onChange={(event) => updateWork(activeWork.id, { showcaseTitle: event.target.value })}
                    />
                  </label>
                  <label>
                    展示图说明
                    <input
                      value={activeWork.showcaseDescription ?? ""}
                      onChange={(event) => updateWork(activeWork.id, { showcaseDescription: event.target.value })}
                    />
                  </label>
                  <label>
                    现场图标题
                    <input
                      value={activeWork.galleryText?.onsiteTitle ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { onsiteTitle: event.target.value })}
                    />
                  </label>
                  <label>
                    现场图说明
                    <input
                      value={activeWork.galleryText?.onsiteDescription ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { onsiteDescription: event.target.value })}
                    />
                  </label>
                  <label>
                    更多图 1 标题
                    <input
                      value={activeWork.galleryText?.signalTitle ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { signalTitle: event.target.value })}
                    />
                  </label>
                  <label>
                    更多图 1 说明
                    <input
                      value={activeWork.galleryText?.signalDescription ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { signalDescription: event.target.value })}
                    />
                  </label>
                  <label>
                    更多图 2 标题
                    <input
                      value={activeWork.galleryText?.outputTitle ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { outputTitle: event.target.value })}
                    />
                  </label>
                  <label>
                    更多图 2 说明
                    <input
                      value={activeWork.galleryText?.outputDescription ?? ""}
                      onChange={(event) => updateWorkGalleryText(activeWork.id, { outputDescription: event.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div className="admin-subsection admin-case-method-editor">
                <h3>视觉方法 / 详情页内容</h3>
                <p>对应案例详情页里的 Visual Method、Edit / Visual / AIGC、流程卡片和 Production Notes。</p>
                <label>
                  视觉方法说明
                  <textarea
                    value={activeWork.caseMethod?.visualText ?? "从岗位实际需求出发，不把 AIGC 当作单纯出图工具，而是放进视频制作流程里判断：脚本能不能拆成镜头，生成片段能不能接入剪辑，画面是否稳定，节奏是否适配短视频平台，最后能不能形成可交付的成片资产。"}
                    onChange={(event) => updateWorkCaseMethod(activeWork.id, { visualText: event.target.value })}
                  />
                </label>
                <div className="admin-field-grid">
                  {getCaseMetrics(activeWork).map((metric, index) => (
                    <div className="admin-inline-group" key={`${metric.title}-${index}`}>
                      <label>
                        指标 {index + 1} 标题
                        <input value={metric.title} onChange={(event) => updateWorkCaseMetric(activeWork.id, index, { title: event.target.value })} />
                      </label>
                      <label>
                        指标 {index + 1} 说明
                        <input value={metric.label} onChange={(event) => updateWorkCaseMetric(activeWork.id, index, { label: event.target.value })} />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="admin-case-step-grid">
                  {getCaseSteps(activeWork).map((step, index) => (
                    <div className="admin-inline-group" key={`${step.number}-${step.title}-${index}`}>
                      <div className="admin-field-grid admin-field-grid-compact">
                        <label>
                          流程编号
                          <input value={step.number} onChange={(event) => updateWorkCaseStep(activeWork.id, index, { number: event.target.value })} />
                        </label>
                        <label>
                          流程标题
                          <input value={step.title} onChange={(event) => updateWorkCaseStep(activeWork.id, index, { title: event.target.value })} />
                        </label>
                      </div>
                      <label>
                        流程说明
                        <textarea value={step.text} onChange={(event) => updateWorkCaseStep(activeWork.id, index, { text: event.target.value })} />
                      </label>
                    </div>
                  ))}
                </div>
                <label>
                  Production Notes 标题
                  <input
                    value={activeWork.caseMethod?.notesTitle ?? "从素材到成片的制作经验"}
                    onChange={(event) => updateWorkCaseMethod(activeWork.id, { notesTitle: event.target.value })}
                  />
                </label>
                <label>
                  Production Notes 内容（每行一条）
                  <textarea
                    value={(activeWork.caseMethod?.notes?.length ? activeWork.caseMethod.notes : defaultCaseNotes).join("\n")}
                    onChange={(event) => updateWorkCaseMethod(activeWork.id, { notes: textToLines(event.target.value) })}
                  />
                </label>
              </div>
              <label>标签（逗号分隔）<input value={activeWork.tags.join(", ")} onChange={(event) => updateWork(activeWork.id, { tags: commaList(event.target.value) })} /></label>

              <div className="admin-upload-grid">
                <label className="admin-upload"><ImagePlus size={18} />主图/目录图<input type="file" accept="image/*,.svg" onChange={(event) => uploadImage(activeWork.id, "image", event)} /></label>
                <label className="admin-upload"><ImagePlus size={18} />首页重点视频封面<input type="file" accept="image/*,.svg" onChange={(event) => uploadImage(activeWork.id, "videoImage", event)} /></label>
                <label className="admin-upload"><ImagePlus size={18} />详情页顶部展示图<input type="file" accept="image/*,.svg" onChange={(event) => uploadImage(activeWork.id, "workflowImage", event)} /></label>
                <label className="admin-upload"><ImagePlus size={18} />职责下方图片<input type="file" accept="image/*,.svg" onChange={(event) => uploadGalleryImage(activeWork.id, "onsite", event)} /></label>
                <label className="admin-upload"><Video size={18} />职责下方视频<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => uploadGalleryVideo(activeWork.id, "onsite", event)} /></label>
                <label className="admin-upload"><ImagePlus size={18} />更多项目画面 1<input type="file" accept="image/*,.svg" onChange={(event) => uploadGalleryImage(activeWork.id, "signal", event)} /></label>
                <label className="admin-upload"><ImagePlus size={18} />更多项目画面 2<input type="file" accept="image/*,.svg" onChange={(event) => uploadGalleryImage(activeWork.id, "output", event)} /></label>
                <label className="admin-upload"><Video size={18} />首页重点展示视频<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => uploadShowcaseVideo(activeWork.id, event)} /></label>
              </div>
              {activeWork.showcaseVideo && (
                <button
                  className="admin-secondary-action"
                  type="button"
                  onClick={() => updateWork(activeWork.id, { showcaseVideo: undefined })}
                >
                  清空首页重点展示视频，改用首页重点视频封面
                </button>
              )}
              {activeWork.videoImage && (
                <button
                  className="admin-secondary-action"
                  type="button"
                  onClick={() => updateWork(activeWork.id, { videoImage: undefined })}
                >
                  清空首页重点视频封面，改用视频首帧预览
                </button>
              )}
              {activeWork.galleryImages?.onsite && (
                <button
                  className="admin-secondary-action"
                  type="button"
                  onClick={() => {
                    const galleryImages = { ...(activeWork.galleryImages ?? {}) };
                    delete galleryImages.onsite;
                    updateWork(activeWork.id, { galleryImages });
                  }}
                >
                  清空职责下方图片封面，改用职责下方视频首帧
                </button>
              )}

              <div className="admin-work-preview">
                <article><span>主图</span><AdminMediaPreview src={activeWork.image} alt="项目主图预览" /></article>
                <article><span>首页重点展示</span><AdminMediaPreview src={activeWork.showcaseVideo ?? activeWork.videoImage ?? activeWork.image} poster={activeWork.videoImage} alt="首页重点展示预览" /></article>
                <article><span>详情页顶部展示图</span><AdminMediaPreview src={activeWork.workflowImage ?? activeWork.image} alt="详情页顶部展示图预览" /></article>
                <article><span>职责下方视频/图片</span><AdminMediaPreview src={activeWork.galleryVideos?.onsite ?? activeWork.galleryImages?.onsite ?? activeWork.image} poster={activeWork.galleryImages?.onsite} alt="职责下方预览" /></article>
                <article><span>更多 1</span><AdminMediaPreview src={activeWork.galleryImages?.signal ?? activeWork.image} alt="更多项目画面预览" /></article>
                <article><span>更多 2</span><AdminMediaPreview src={activeWork.galleryImages?.output ?? activeWork.image} alt="更多项目画面预览" /></article>
              </div>
            </div>
          )}
        </div>

        <div className="admin-actions">
          <button onClick={saveLocal} type="button"><Save size={16} />保存全部修改</button>
          {savedAt && <span>已保存 {savedAt}</span>}
          {saveError && <span className="admin-error">{saveError}</span>}
        </div>
      </section>
    </main>
  );
}
