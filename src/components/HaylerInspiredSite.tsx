"use client";

/* eslint-disable @next/next/no-img-element */
import { ArrowUpRight, Mail, MapPin, Phone, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StoredImage from "@/components/StoredImage";
import type { ArchiveImageItem, ContentData, WorkItem } from "@/types/content";

interface HaylerInspiredSiteProps {
  initialContent: ContentData;
}

const navItems = [
  { label: "Index", href: "#index" },
  { label: "Core", href: "#profile" },
  { label: "Experience", href: "#experience" },
  { label: "Works", href: "#works" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const fallbackProfile = {
  name: "张林浩",
  gender: "男",
  age: "26岁",
  phone: "178-6420-7579",
  email: "1261250708@QQ.com",
  city: "北京",
  education: "中国传媒大学 本科",
  experience: "6年视频制作经验",
  role: "后期制作 / 视频剪辑包装 / AIGC视频制作",
  summary:
    "具备视频后期制作、摄影拍摄和 AIGC 工具应用经验，能够独立完成素材理解、剪辑节奏、包装调色到成片交付的完整流程。",
};

const defaultCapabilities = [
  {
    title: "AIGC 视频制作",
    text: "根据脚本、产品调性和参考片拆解人物、场景、服装、道具、光影与镜头语言，使用 Stable Diffusion、ComfyUI、Midjourney、即梦、可灵、Runway 等工具完成视觉参考图、分镜概念图、AI 封面、风格化素材、背景延展和视频关键帧预演。能够把 AIGC 用在创意前期沟通、画面风格探索、素材补充和短视频包装中，让项目更快统一视觉方向并提高制作效率。",
    items: ["AI制作方向", "Prompt设计", "参考图拆解", "分镜概念", "AI封面", "图生图/局部重绘", "风格控制", "AI视频生成"],
  },
  {
    title: "宣传短片制作",
    text: "覆盖品牌宣传片、TVC、课程产品短片、讲师介绍片和商业内容，从选题理解、分镜脚本、拍摄执行到素材整理、粗剪精剪、音乐匹配、字幕包装、调色修正和成片输出均可独立推进。能够把产品卖点、人物状态、品牌信息和情绪表达整合成清晰的视频叙事，兼顾传播效率与成片质感。",
    items: ["商业视频方向", "分镜脚本", "镜头组接", "剪辑节奏", "字幕包装", "调色修正", "基础合成", "成片交付"],
  },
  {
    title: "大型项目内容支持",
    text: "参与快手年度盛典、快手 CNY、巴黎奥运会、周杰伦、成龙、蔡依林等大型活动与明星内容项目，具备高压现场下的视觉执行、摄像剪辑、素材质量判断和跨团队协作经验。能够把控人物特写、灯光质感、肤色还原、多机位色彩统一和镜头切换，为活动回顾、宣发短片、切片和二创内容提供稳定素材基础。",
    items: ["活动视频方向", "S级项目经验", "现场执行", "多机位画面", "人物肤色", "活动回顾", "宣发短片", "切片素材", "画面统一"],
  },
  {
    title: "新媒体内容制作",
    text: "面向快手、抖音、视频号等平台完成短视频剪辑、账号内容包装、封面设计、技术科普、器材测评、项目花絮和幕后内容制作。能够根据平台节奏优化开头吸引力、信息密度、转场节奏、字幕表达、完播体验和多版本适配，同时结合 AIGC 生成封面图、视觉参考和风格化素材，提高内容产出效率与视觉差异化。",
    items: ["新媒体方向", "短视频剪辑", "开头吸引力", "完播节奏", "封面设计", "账号内容", "平台适配", "AIGC包装"],
  },
];

const capabilityFolderTitles = ["AIGC 视频", "宣传短片制作", "大型项目支持", "新媒体内容"];
const capabilityTargetIds = ["work-aigc-video", "work-commercial-film", "work-large-projects", "work-new-media"];
const projectDetailAnchorIds = ["work-aigc-video", "work-commercial-film", "work-large-projects", "work-new-media"];

const experiences = [
  {
    company: "北京快手科技有限公司",
    role: "视频制作 / 摄像剪辑 / AIGC视觉制作探索",
    period: "2023.07 - 至今",
    intro: "负责大型内容项目的视频视觉执行、影像采集、素材质量把控、短视频内容制作及 AIGC 辅助创作探索。",
    highlights: [
      "参与周杰伦、成龙、蔡依林等明星内容项目，把控人物肤色、特写质感、灯光氛围和多机位画面统一。",
      "参与快手年度盛典、快手 CNY、巴黎奥运会等大型活动项目，负责内容画面把控、素材质量管理和视觉执行支持。",
      "策划并制作技术类官方账号内容，参与器材测评、技术科普、短视频剪辑、封面设计和内容包装。",
      "探索 Stable Diffusion、ComfyUI、Midjourney、GPT 等工具在 AI 封面、分镜概念图、风格化素材和短视频包装中的应用。",
    ],
  },
  {
    company: "网易有道信息技术（北京）有限公司",
    role: "资深摄影 / 视频制作 / 后期剪辑",
    period: "2019.06 - 2023.07",
    intro: "负责课程视频、品牌宣传片、TVC、短视频和直播间内容制作，覆盖前期策划、拍摄执行、剪辑包装和成片交付。",
    highlights: [
      "从 0 到 1 搭建近百个讲师内容录制场景，建立布光、收音、构图、录制和后期输出标准。",
      "执行 200+ 节精品课程录制，主控大型校招直播累计观看 20w+，支撑课程销售累计 600w+。",
      "负责有道精品课宣传视频、TVC、课程短视频和讲师介绍视频制作，独立把控选题、分镜、拍摄、剪辑节奏和调色修正。",
      "建立视频制作规范，沉淀人物拍摄、课程视频、品牌视觉、短视频剪辑和包装标准。",
    ],
  },
];

const projectNarratives = [
  {
    title: "AIGC 视频制作 / AI视觉素材",
    titleLines: ["AIGC 视频制作", "AI视觉素材"],
    role: "AI视觉素材生成 / 分镜概念 / 视觉参考 / 封面包装 / 视频创意预演",
    text: "根据项目脚本、品牌调性和传播目标，拆解人物、场景、服装、道具、光影、镜头语言与画面氛围，生成可用于前期沟通、分镜预演、封面包装、背景延展和 AI 视频制作的视觉素材。",
    tags: ["AI分镜", "风格化素材", "Prompt工作流", "视觉参考库"],
    details: [
      "前期根据脚本和参考片拆解视觉方向，整理人物设定、场景气质、色彩倾向、光影关系、镜头景别和画面关键词，转化为可执行的 Prompt 结构。",
      "使用 Stable Diffusion、ComfyUI、Midjourney、即梦、可灵等工具生成视觉参考图、分镜概念图、AI 封面、背景延展图和短视频包装素材。",
      "通过图生图、局部重绘、参考图控制、风格迁移和多轮迭代，调整人物一致性、服装材质、场景氛围、画面构图和品牌调性。",
      "将 AIGC 素材用于创意预演、提案沟通、封面包装、画面修复、素材补充和 AI 视频关键帧设计，提高前期沟通效率和视觉统一性。",
      "沉淀 Prompt 模板、视觉参考库、风格标签、角色素材和项目素材管理方法，让同一项目的画面风格更稳定，也方便后续复用。",
    ],
  },
  {
    title: "TVC / 宣传短片制作",
    titleLines: ["TVC / 宣传短片", "制作"],
    role: "摄影 / 剪辑 / 后期制作 / 成片交付",
    text: "覆盖选题、分镜、拍摄、剪辑包装和成片输出，将产品卖点、人物状态、品牌信息和情绪表达整合为清晰的视频叙事。",
    tags: ["剪辑节奏", "调色包装", "商业视频"],
    details: [
      "负责有道精品课宣传视频、TVC、讲师介绍片、课程产品短片等内容制作。",
      "根据产品卖点、品牌调性和传播目标，完成视频节奏设计、镜头组接、音乐匹配、字幕包装、调色修正和基础合成。",
      "提升品牌视频质感和内容识别度，让信息表达更清晰、人物状态更可信。",
    ],
  },
  {
    title: "活动视频制作 / 大型项目内容支持",
    titleLines: ["活动视频制作", "大型项目内容支持"],
    role: "摄像剪辑 / 画面质感把控 / 活动素材支持",
    text: "参与快手年度盛典、快手 CNY、巴黎奥运会、周杰伦、成龙、蔡依林等大型活动与明星内容项目。",
    tags: ["活动回顾", "明星内容", "素材把控"],
    details: [
      "把控人物特写、灯光质感、肤色还原、多机位色彩统一和镜头切换。",
      "为活动回顾、宣发短片、切片和二创内容提供素材基础。",
      "根据活动调性快速判断素材可用性、传播亮点和后期剪辑方向，提升活动视频成片效率。",
    ],
  },
  {
    title: "短视频剪辑 / 新媒体内容制作",
    titleLines: ["短视频剪辑", "新媒体内容制作"],
    role: "短视频剪辑 / 内容包装 / 封面设计 / 账号内容制作",
    text: "完成选题理解、素材整理、粗剪精剪、节奏优化、音乐匹配、字幕包装、封面设计和多平台成片输出。",
    tags: ["完播节奏", "封面包装", "平台适配"],
    details: [
      "策划并制作技术类官方账号内容，参与器材测评、技术科普、项目花絮、幕后内容和短视频包装。",
      "熟悉抖音、快手、视频号等平台内容节奏，能够优化开头吸引力、信息密度、转场节奏和完播体验。",
      "结合 AIGC 工具制作封面图、视觉参考、风格化素材和背景延展，提高短视频制作效率和视觉差异化。",
    ],
  },
];

const skillGroups = [
  {
    title: "AIGC工具",
    note: "覆盖 AI 生图、视频生成、分镜概念、封面包装和视觉迭代。",
    items: ["Stable Diffusion", "ComfyUI", "Midjourney", "GPT", "即梦", "可灵", "Runway", "Pika"],
  },
  {
    title: "后期软件",
    note: "能够完成剪辑、包装、调色、基础合成、画面修正和多平台输出。",
    items: ["Premiere", "After Effects", "DaVinci Resolve", "Photoshop", "C4D", "剪映"],
  },
  {
    title: "视频制作能力",
    note: "从前期分镜到成片交付，能兼顾内容节奏、画面质感和品牌表达。",
    items: ["宣传片制作", "TVC制作", "课程视频", "活动视频", "直播切片", "短视频剪辑"],
  },
  {
    title: "AIGC视觉能力",
    note: "用 AI 提升前期沟通、视觉素材生成、封面包装和视频创意效率。",
    items: ["Prompt 设计", "参考图拆解", "AI封面", "AI分镜", "AI视频生成", "素材库搭建"],
  },
];

function pickWorks(works: WorkItem[]) {
  const preferred = ["01", "02", "07", "13", "15", "03"];
  return preferred
    .map((id) => works.find((work) => work.id === id))
    .filter((work): work is WorkItem => Boolean(work))
    .slice(0, 6);
}

function splitTitle(title: string) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return [];
  if (cleanTitle.length <= 13) return [cleanTitle];
  const breakPoint = Math.ceil(cleanTitle.length / 2);
  return [cleanTitle.slice(0, breakPoint), cleanTitle.slice(breakPoint)];
}

function isVideoSource(src?: string) {
  return Boolean(src && /\.(mp4|webm|mov)(\?.*)?$/i.test(src));
}

function ProjectVisual({
  work,
  alt,
  sizes,
  priority = false,
}: {
  work?: WorkItem;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const stillImage = work?.videoImage ?? work?.image;

  if (isVideoSource(work?.showcaseVideo)) {
    return (
      <>
        <video
          className="hyl-project-video"
          src={work?.showcaseVideo}
          poster={work?.videoImage}
          controls
          playsInline
          preload="none"
        />
      </>
    );
  }

  return <StoredImage src={stillImage} alt={alt} sizes={sizes} priority={priority} />;
}

function getArchiveColumnCount() {
  if (typeof window === "undefined") return 7;
  if (window.innerWidth <= 640) return 2;
  if (window.innerWidth <= 980) return 4;
  return 7;
}

function distributeArchiveItems(items: ArchiveImageItem[], columnCount: number) {
  const columns = Array.from({ length: columnCount }, () => [] as ArchiveImageItem[]);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

export default function HaylerInspiredSite({ initialContent }: HaylerInspiredSiteProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
  const [archiveColumnCount, setArchiveColumnCount] = useState(7);
  const visibleWorks = useMemo(() => initialContent.works.filter((work) => !work.hidden), [initialContent.works]);
  const works = useMemo(() => pickWorks(visibleWorks), [visibleWorks]);
  const galleryWorks = useMemo(() => visibleWorks.slice(0, 15), [visibleWorks]);
  const archiveItems = useMemo(() => {
    if (initialContent.archiveImages?.length) return initialContent.archiveImages;

    return visibleWorks.slice(0, 15).map((work) => ({
      id: work.id,
      title: work.title,
      subtitle: work.subtitle,
      image: work.videoImage ?? work.image,
    }));
  }, [initialContent.archiveImages, visibleWorks]);
  const archivePreviewCount = 14;
  const archiveMoreItems = useMemo(() => archiveItems.slice(archivePreviewCount), [archiveItems]);
  const archiveColumns = useMemo(
    () => distributeArchiveItems(archiveItems, archiveColumnCount),
    [archiveColumnCount, archiveItems],
  );
  const hiddenArchiveCount = archiveMoreItems.length;

  useEffect(() => {
    const syncArchiveColumns = () => setArchiveColumnCount(getArchiveColumnCount());
    syncArchiveColumns();
    window.addEventListener("resize", syncArchiveColumns);
    return () => window.removeEventListener("resize", syncArchiveColumns);
  }, []);

  const toggleArchiveExpanded = useCallback(() => {
    const scrollY = typeof window === "undefined" ? 0 : window.scrollY;
    setIsArchiveExpanded((value) => !value);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, []);
  const profile = useMemo(() => {
    const contentProfile = initialContent.profile;
    return {
      ...fallbackProfile,
      ...contentProfile,
      education: contentProfile?.degree ?? fallbackProfile.education,
      role: contentProfile?.role || fallbackProfile.role,
      summary: contentProfile?.summary || fallbackProfile.summary,
      city: contentProfile?.city || fallbackProfile.city,
    };
  }, [initialContent.profile]);
  const capabilityViews = initialContent.capabilities?.length ? initialContent.capabilities : defaultCapabilities;
  const experienceViews = initialContent.experience?.length
    ? initialContent.experience.map((item) => ({
      company: item.company,
      role: item.role,
      period: item.period,
      intro: item.position,
      highlights: item.highlights,
    }))
    : experiences;
  const skillViews = initialContent.skills?.length
    ? initialContent.skills.map((group) => ({
      ...group,
      note: group.note || skillGroups.find((item) => item.title === group.title)?.note || "可直接用于当前网站对应内容生产。",
    }))
    : skillGroups;
  const sectionCopy = initialContent.sectionCopy ?? {};
  const selectedWork = selectedProject === null ? null : works[selectedProject] ?? works[0];
  const projectViews = useMemo(() => projectNarratives.map((project, index) => {
    const work = works[index];
    const workTitle = work?.subtitle?.trim();
    return {
      ...project,
      title: workTitle || project.title,
      titleLines: workTitle ? splitTitle(workTitle) : project.titleLines,
      role: work?.caseRole || project.role,
      text: work?.resultText || work?.description || project.text,
      details: work?.caseDetails?.length ? work.caseDetails : project.details,
      tags: work?.tags?.length ? work.tags.slice(0, 3) : project.tags,
    };
  }), [works]);
  const selectedProjectData = selectedProject === null ? null : projectViews[selectedProject];
  const selectedCaseShowcaseImage = selectedWork?.workflowImage ?? selectedWork?.videoImage ?? selectedWork?.image;
  const selectedCaseShowcaseTitle = selectedWork?.showcaseTitle ?? `${selectedProjectData?.title ?? "项目"} 展示`;
  const selectedCaseShowcaseDescription = selectedWork?.showcaseDescription ?? "";
  const selectedCaseProcessImage =
    selectedWork?.galleryImages?.onsite ??
    selectedWork?.galleryImages?.signal ??
    selectedWork?.galleryImages?.output ??
    selectedWork?.image;
  const selectedCaseProcessVideo = selectedWork?.galleryVideos?.onsite;
  const selectedCaseProcessMedia = selectedCaseProcessVideo || selectedCaseProcessImage;
  const selectedCaseProcessTitle = selectedWork?.galleryText?.onsiteTitle ?? "现场 / 过程画面";
  const selectedCaseProcessDescription = selectedWork?.galleryText?.onsiteDescription ?? "";
  const nextProjectIndex = selectedProject === null ? 0 : (selectedProject + 1) % projectNarratives.length;
  const nextProject = projectViews[nextProjectIndex];
  const selectedCaseGallery = useMemo(() => {
    if (selectedProject === null) return [];
    const start = selectedProject * 3;
    return galleryWorks.slice(start, start + 4);
  }, [galleryWorks, selectedProject]);
  const selectedCaseMethod = selectedWork?.caseMethod;
  const selectedCaseMethodText =
    selectedCaseMethod?.visualText ||
    "从岗位实际需求出发，不把 AIGC 当作单纯出图工具，而是放进视频制作流程里判断：脚本能不能拆成镜头，生成片段能不能接入剪辑，画面是否稳定，节奏是否适配短视频平台，最后能不能形成可交付的成片资产。";
  const selectedCaseMetrics = selectedCaseMethod?.metrics?.length
    ? selectedCaseMethod.metrics
    : [
        { title: "Edit", label: "可剪性" },
        { title: "Visual", label: "镜头质感" },
        { title: "AIGC", label: "版本效率" },
      ];
  const selectedCaseSteps = selectedCaseMethod?.steps?.length
    ? selectedCaseMethod.steps
    : [
        { number: "01", title: "脚本转镜头", text: "把脚本、参考片和传播目标拆成景别、机位、运动方向、情绪节奏和画面优先级。" },
        { number: "02", title: "生成与质检", text: "多轮生成后按主体稳定、透视合理、光色统一、可剪可接来筛选，不合格版本直接淘汰。" },
        { number: "03", title: "剪辑交付", text: "进入时间线测试开头钩子、节奏段落、转场衔接和封面包装，再输出可展示的成片版本。" },
      ];
  const selectedCaseNotesTitle = selectedCaseMethod?.notesTitle || "从素材到成片的制作经验";
  const selectedCaseNotes = selectedCaseMethod?.notes?.length
    ? selectedCaseMethod.notes
    : [
        "对标 AI 视频创意、短剧分镜和视频制作岗位要求，重点呈现“理解脚本-组织镜头-判断素材-完成成片”的能力。",
        "判断 AI 镜头是否可用时，不只看单帧质感，更看主体运动、透视变化、节奏长度和下一镜能否接上。",
        "用摄影和后期经验反推生成标准，让素材从“视觉参考”进一步变成能剪、能包装、能进入商业内容流程的资产。",
      ];
  const scrollCaseToTop = () => {
    window.requestAnimationFrame(() => {
      modalRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  };
  const openCaseAtTop = (targetIndex: number) => {
    setSelectedProject(targetIndex);
    scrollCaseToTop();
  };
  const openGalleryWork = (work: WorkItem) => {
    const targetIndex = works.findIndex((item) => item.id === work.id);

    if (targetIndex >= 0 && targetIndex < projectViews.length) {
      openCaseAtTop(targetIndex);
      return;
    }

    setSelectedProject(null);
    window.requestAnimationFrame(() => {
      document.getElementById("works")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const heroTargets = root.querySelectorAll<HTMLElement>(".hyl-hero-copy, .hyl-hero-visual, .hyl-hero-footer");
      const heroTitle = root.querySelectorAll<HTMLElement>(".hyl-hero h1 span");
      const heroEyebrow = root.querySelector<HTMLElement>(".hyl-eyebrow");
      const revealSelectors = [
        ".hyl-section-label",
        ".hyl-profile-poster",
        ".hyl-intro-text",
        ".hyl-pinned-title",
        ".hyl-capability-list",
        ".hyl-capability",
        ".hyl-experience > .hyl-section-head",
        ".hyl-timeline",
        ".hyl-timeline > article",
        ".hyl-works > .hyl-section-head",
        ".hyl-work",
        ".hyl-archive-head",
        ".hyl-archive-shell",
        ".hyl-archive-more",
        ".hyl-skills-inner > .hyl-section-head",
        ".hyl-skill-panel",
        ".hyl-contact-title",
        ".hyl-contact-card",
      ];
      const revealUnits = Array.from(
        new Set(revealSelectors.flatMap((selector) => Array.from(root.querySelectorAll<HTMLElement>(selector)))),
      );
      const mediaSelector = ".hyl-work-media, .hyl-case-media";
      const titleSelector = [
        ".hyl-section-head h2",
        ".hyl-archive-head h2",
        ".hyl-pinned-title strong",
        ".hyl-capability h2",
        ".hyl-timeline h3",
        ".hyl-skill-panel h3",
        ".hyl-work-copy h3",
        ".hyl-contact-title span",
      ].join(", ");
      const copySelector = [
        ".hyl-section-head > p",
        ".hyl-work-copy > p",
        ".hyl-work-copy > small",
        ".hyl-work-copy > div",
        ".hyl-work-copy > button",
        ".hyl-capability > p",
        ".hyl-capability > div",
        ".hyl-timeline strong",
        ".hyl-timeline li",
        ".hyl-skill-panel > p",
        ".hyl-skill-panel > div",
        ".hyl-contact-card > *",
        ".hyl-profile-statline",
        ".hyl-profile-copy p",
      ].join(", ");

      if (reduceMotion) {
        gsap.set([...heroTargets, ...heroTitle, ...revealUnits], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform,clipPath,scale",
        });
        return;
      }

      if (heroTargets.length) gsap.set(heroTargets, { autoAlpha: 0, y: 28 });
      if (heroTitle.length) gsap.set(heroTitle, { autoAlpha: 0, y: 30 });
      if (heroEyebrow) gsap.set(heroEyebrow, { autoAlpha: 0, y: 12 });

      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (heroTargets.length) heroTimeline.to(heroTargets, { autoAlpha: 1, y: 0, duration: 0.72 }, 0);
      if (heroEyebrow) heroTimeline.to(heroEyebrow, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.08);
      if (heroTitle.length) heroTimeline.to(heroTitle, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.15);

      revealUnits.forEach((unit) => {
        const media = unit.querySelector<HTMLElement>(mediaSelector);
        const title = unit.querySelector<HTMLElement>(titleSelector);
        const copy = Array.from(unit.querySelectorAll<HTMLElement>(copySelector)).filter(
          (element) => element !== title && !element.contains(title),
        );

        gsap.set(unit, { autoAlpha: 0, y: 28 });
        if (title) gsap.set(title, { autoAlpha: 0, y: 18 });
        if (copy.length) gsap.set(copy, { autoAlpha: 0, y: 14 });
        if (media) {
          gsap.set(media, {
            autoAlpha: 0,
            scale: 1.045,
            clipPath: "inset(0 0 9% 0 round 14px)",
          });
        }

        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: unit,
            start: "top 82%",
            once: true,
          },
        });

        timeline.to(unit, { autoAlpha: 1, y: 0, duration: 0.5 });
        if (title) {
          timeline.to(title, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.06);
        }
        if (copy.length) {
          timeline.to(copy, { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.055 }, 0.2);
        }
        if (media) {
          timeline.to(
            media,
            {
              autoAlpha: 1,
              scale: 1,
              clipPath: "inset(0 0 0% 0 round 14px)",
              duration: 0.96,
            },
            0.32,
          );
        }
      });
    }, root);

    root.style.setProperty("--scroll-progress", "0");
    let progressFrame = 0;
    const updateScrollProgress = () => {
      progressFrame = 0;
      const documentElement = document.documentElement;
      const maxScroll = Math.max(documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
    };
    const requestProgressUpdate = () => {
      if (!progressFrame) progressFrame = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
      if (progressFrame) window.cancelAnimationFrame(progressFrame);
      context.revert();
    };
  }, []);

  useEffect(() => {
    if (selectedProject === null || !modalRef.current) return undefined;

    document.body.classList.add("hyl-case-open");
    modalRef.current.scrollTo({ top: 0, behavior: "auto" });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(".hyl-case-modal, .hyl-case-panel", { autoAlpha: 1, clearProps: "transform,clipPath" });
        return;
      }
      gsap.fromTo(".hyl-case-modal", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, ease: "power2.out" });
      gsap.fromTo(
        ".hyl-case-panel",
        { y: 34, scale: 0.992, clipPath: "inset(2% 2% 2% 2% round 14px)" },
        { y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 0.56, ease: "power3.out" },
      );
      gsap.fromTo(
        ".hyl-case-media img, .hyl-case-media video",
        { autoAlpha: 0, scale: 1.035 },
        { autoAlpha: 1, scale: 1, duration: 0.88, ease: "power3.out" },
      );
      gsap.fromTo(
        ".hyl-case-hero-meta, .hyl-case-kicker, .hyl-case-copy h2 span, .hyl-case-copy p, .hyl-case-copy strong, .hyl-case-chip, .hyl-case-block, .hyl-case-gallery-card, .hyl-case-next",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.05, ease: "power3.out", delay: 0.16 },
      );
    }, modalRef);

    window.requestAnimationFrame(() => {
      modalRef.current?.scrollTo({ top: 0, behavior: "auto" });
      modalRef.current?.querySelector<HTMLButtonElement>(".hyl-case-close")?.focus({ preventScroll: true });
    });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      context.revert();
      document.body.classList.remove("hyl-case-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedProject]);

  return (
    <main ref={rootRef} className="hyl-site">
      <div className="hyl-atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hyl-progress" aria-hidden="true" />

      <header className="hyl-nav">
        <a href="#index" className="hyl-logo">
          ZL
        </a>
        <nav>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              <span data-hover={item.label}>{item.label}</span>
            </a>
          ))}
          <a href="/admin">
            <span data-hover="Edit">Edit</span>
          </a>
        </nav>
      </header>

      <section id="index" className="hyl-hero">
        <div className="hyl-cover-art" aria-hidden="true">
          {/* Keep the generated cover unoptimized so the hero uses the source PNG quality. */}
          <img
            src="/images/visual-cover-designportfolic-color-3d.png"
            alt=""
          />
        </div>
      </section>

      <section id="profile" className="hyl-intro">
        <div className="hyl-profile-poster hyl-reveal">
          <img
            src="/images/profile-intro-v3.png"
            alt={`${profile.name} 个人介绍页`}
          />
        </div>
      </section>

      <section id="experience" className="hyl-experience">
        <div className="hyl-section-head hyl-reveal">
          <p>Experience</p>
          <h2>{sectionCopy.experienceTitle || "从后期剪辑、现场拍摄到 AI 视频制作。"}</h2>
        </div>
        <div className="hyl-timeline hyl-reveal">
          <div className="hyl-timeline-toolbar" aria-hidden="true">
            <span>CAREER LOG</span>
            <strong>LIVE PRODUCTION / VIDEO / AIGC</strong>
          </div>
          {experienceViews.map((item) => (
            <article className="hyl-reveal" key={item.company}>
              <div>
                <span>{item.period}</span>
                <h3>{item.company}</h3>
                <p>{item.role}</p>
              </div>
              <section>
                <strong>{item.intro}</strong>
                <ul>
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </section>
            </article>
          ))}
        </div>
      </section>

      <section id="works-index" className="hyl-capabilities">
        <div className="hyl-pinned-title hyl-reveal">
          <span>JQQ</span>
          <strong>目录</strong>
        </div>
        <div className="hyl-capability-list">
          <div className="hyl-catalog-head" aria-hidden="true">
            <span>24 - 25</span>
            <span>VISUAL DESIGN</span>
            <span>AI VIDEO</span>
            <strong>CATALOGS</strong>
          </div>
          {capabilityViews.map((item, index) => {
            const title = capabilityFolderTitles[index] ?? item.title;
            const targetId = capabilityTargetIds[index] ?? "works";

            return (
              <a
                className="hyl-capability hyl-reveal"
                href={`#${targetId}`}
                key={item.title}
                aria-label={`查看${title}详情`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{title}</h2>
                <div className="hyl-folder-preview" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>{item.text}</p>
                <div>
                  {item.items.map((skill) => (
                    <em key={skill}>{skill}</em>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section id="works" className="hyl-works">
        <div className="hyl-section-head hyl-reveal">
          <p>Selected Projects</p>
          <h2>{sectionCopy.worksTitle || "混剪视频、项目画面与重点案例可以单独展开。"}</h2>
        </div>
        <div className="hyl-work-showcase">
          {projectViews.map((project, index) => {
            const work = works[index] ?? works[0];
            return (
              <article
                className="hyl-work hyl-reveal"
                id={projectDetailAnchorIds[index]}
                key={project.title}
              >
                <div className="hyl-work-media hyl-parallax-media">
                  <ProjectVisual work={work} alt={project.title} sizes="(max-width: 900px) 92vw, 44vw" />
                </div>
                <div className="hyl-work-copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>
                    {project.titleLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p>{project.role}</p>
                  <small>{project.text}</small>
                  <div>
                    {project.tags.map((tag) => (
                      <em key={tag}>{tag}</em>
                    ))}
                  </div>
                  <button className="hyl-case-trigger" type="button" onClick={() => setSelectedProject(index)}>
                    <ArrowUpRight size={18} />
                    <span>View Case</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hyl-archive">
          <div className="hyl-archive-head">
            <p>Archive / Visual Works</p>
            <h2>{sectionCopy.archiveTitle || "项目图片瀑布流保留，用更安静的画廊方式展示。"}</h2>
          </div>
          <div className={`hyl-archive-shell hyl-reveal ${isArchiveExpanded ? "is-expanded" : "is-collapsed"}`}>
            <div className="hyl-archive-toolbar" aria-hidden="true">
              <span>VISUAL ARCHIVE</span>
              <strong>{String(archiveItems.length).padStart(2, "0")} FRAMES</strong>
              <em>AIGC / LIVE / EDIT</em>
            </div>
            <div className="hyl-masonry">
              {archiveColumns.map((column, columnIndex) => (
                <div className="hyl-masonry-column" key={`archive-column-${columnIndex}`}>
                  {column.map((work, rowIndex) => {
                    const itemIndex = columnIndex + rowIndex * archiveColumnCount;
                    return (
                      <article className={`hyl-masonry-item hyl-ratio-${itemIndex % 7}`} key={`${work.id}-${itemIndex}`}>
                        <div className="hyl-masonry-media hyl-parallax-media">
                          <StoredImage src={work.image} alt={work.subtitle ?? work.title} sizes="(max-width: 900px) 44vw, 16vw" />
                        </div>
                        <div>
                          <span>{work.title}</span>
                          <h3>{work.subtitle ?? "Visual Archive"}</h3>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {archiveItems.length > archivePreviewCount ? (
            <div className={`hyl-archive-more ${isArchiveExpanded ? "is-expanded" : ""}`}>
              <button
                type="button"
                onClick={toggleArchiveExpanded}
                aria-expanded={isArchiveExpanded}
              >
                <span>{isArchiveExpanded ? "收起图片" : "查看更多项目画面"}</span>
                <em>{isArchiveExpanded ? `${archivePreviewCount} 张预览` : `继续查看 ${hiddenArchiveCount} 张`}</em>
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section id="skills" className="hyl-skills">
        <div className="hyl-skills-inner">
          <div className="hyl-section-head hyl-section-head--dark hyl-reveal">
            <p>Work Skills</p>
            <h2>{sectionCopy.skillsTitle || "后期软件、镜头经验和 AIGC 工具，可以直接进入内容生产。"}</h2>
          </div>
          <div className="hyl-skill-cloud">
            {skillViews.map((group, index) => (
              <article className="hyl-skill-panel hyl-reveal" key={group.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{group.title}</h3>
                <p>{group.note}</p>
                <div>
                  {group.items.map((skill) => (
                    <em key={skill}>{skill}</em>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="hyl-contact">
        <div className="hyl-contact-title hyl-reveal">
          {(sectionCopy.contactTitleLines?.length ? sectionCopy.contactTitleLines : ["Let's Cut", "Better Visuals"]).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="hyl-contact-card hyl-reveal">
          <p>{sectionCopy.contactText || "适合宣传片、TVC、活动视频、短视频剪辑、AI 视频生成和 AIGC 视觉素材制作。"}</p>
          <a href={`mailto:${profile.email}`}>
            <Mail size={18} />
            {profile.email}
          </a>
          <a href={`tel:${profile.phone}`}>
            <Phone size={18} />
            {profile.phone}
          </a>
          <span>
            <MapPin size={18} />
            {profile.city}
          </span>
          <a href="#index">
            <ArrowUpRight size={18} />
            Back to Top
          </a>
        </div>
      </section>

      {selectedProjectData && (
        <div className="hyl-case-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={selectedProjectData.title} tabIndex={-1}>
          <button className="hyl-case-backdrop" type="button" onClick={() => setSelectedProject(null)} aria-label="Close case" />
          <div className="hyl-case-panel">
            <button className="hyl-case-close" type="button" onClick={() => setSelectedProject(null)} aria-label="Close case">
              <X size={22} />
            </button>
            <div className="hyl-case-media">
              <ProjectVisual work={selectedWork ?? undefined} alt={selectedProjectData.title} sizes="100vw" label="CASE VIDEO" />
              <div className="hyl-case-hero-meta">
                <span>{String((selectedProject ?? 0) + 1).padStart(2, "0")}</span>
                <strong>{selectedProjectData.title}</strong>
              </div>
            </div>
            <div className="hyl-case-copy">
              <span className="hyl-case-kicker">{String((selectedProject ?? 0) + 1).padStart(2, "0")}</span>
              <h2>
                {selectedProjectData.titleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p>{selectedProjectData.role}</p>
              <strong>{selectedProjectData.text}</strong>
              <div>
                {selectedProjectData.tags.map((tag) => (
                  <em className="hyl-case-chip" key={tag}>{tag}</em>
                ))}
              </div>
              {selectedCaseShowcaseImage && (
                <section className="hyl-case-inline-media" aria-label="项目展示图">
                  <figure>
                    <StoredImage
                      src={selectedCaseShowcaseImage}
                      alt={`${selectedProjectData.title}项目展示图`}
                      sizes="(max-width: 900px) calc(100vw - 28px), 1720px"
                    />
                    {(selectedCaseShowcaseTitle || selectedCaseShowcaseDescription) && (
                      <figcaption>
                        {selectedCaseShowcaseTitle && <strong>{selectedCaseShowcaseTitle}</strong>}
                        {selectedCaseShowcaseDescription && <span>{selectedCaseShowcaseDescription}</span>}
                      </figcaption>
                    )}
                  </figure>
                </section>
              )}
              <section className="hyl-case-block">
                <span>Project Role</span>
                <h3>项目职责</h3>
                <ul>
                  {selectedProjectData.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </section>
              {selectedCaseProcessMedia && (
                <section className="hyl-case-inline-media" aria-label="现场执行视频">
                  <figure>
                    {isVideoSource(selectedCaseProcessVideo) ? (
                      <video
                        src={selectedCaseProcessVideo}
                        poster={selectedCaseProcessImage}
                        controls
                        playsInline
                        preload="none"
                      />
                    ) : (
                      <StoredImage
                        src={selectedCaseProcessImage}
                        alt={`${selectedProjectData.title}现场执行图`}
                        sizes="(max-width: 900px) calc(100vw - 28px), 1720px"
                      />
                    )}
                    {(selectedCaseProcessTitle || selectedCaseProcessDescription) && (
                      <figcaption>
                        {selectedCaseProcessTitle && <strong>{selectedCaseProcessTitle}</strong>}
                        {selectedCaseProcessDescription && <span>{selectedCaseProcessDescription}</span>}
                      </figcaption>
                    )}
                  </figure>
                </section>
              )}
              <section className="hyl-case-block">
                <span>Visual Method</span>
                <h3>视觉方法</h3>
                <p>{selectedCaseMethodText}</p>
              </section>
              <section className="hyl-case-block hyl-case-scoreboard">
                {selectedCaseMetrics.map((metric) => (
                  <div key={`${metric.title}-${metric.label}`}>
                    <strong>{metric.title}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </section>
              <section className="hyl-case-block hyl-case-process-cards">
                {selectedCaseSteps.map((step, index) => (
                  <div key={`${step.number}-${step.title}`}>
                    <span>{step.number || String(index + 1).padStart(2, "0")}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                ))}
              </section>
              <section className="hyl-case-block">
                <span>Production Notes</span>
                <h3>{selectedCaseNotesTitle}</h3>
                <ul>
                  {selectedCaseNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
              <section className="hyl-case-block">
                <span>Gallery</span>
                <h3>更多项目画面</h3>
                <div className="hyl-case-gallery">
                  {selectedCaseGallery.map((work) => (
                    <button
                      className="hyl-case-gallery-card"
                      type="button"
                      key={work.id}
                      onClick={() => openGalleryWork(work)}
                      aria-label={`查看 ${work.subtitle}`}
                    >
                      <StoredImage
                        src={work.videoImage ?? work.image}
                        alt={work.subtitle}
                        sizes="(max-width: 640px) 42vw, 180px"
                      />
                      <small>{work.subtitle}</small>
                    </button>
                  ))}
                </div>
              </section>
              <section className="hyl-case-next">
                <span>Next Case</span>
                <button type="button" onClick={() => openCaseAtTop(nextProjectIndex)}>
                  <small>{String(nextProjectIndex + 1).padStart(2, "0")}</small>
                  <span className="hyl-case-next-copy">
                    <strong>{nextProject.title}</strong>
                    <em>点击进入下一个项目，从顶部开始阅读</em>
                  </span>
                  <ArrowUpRight size={20} />
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
