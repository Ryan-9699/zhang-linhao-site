"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, Download, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import StoredImage from "@/components/StoredImage";
import { getWorkGroup, workGroupOptions } from "@/lib/projectGroups";
import type { ContentData, WorkItem } from "@/types/content";

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

async function uploadProjectImage(file: File) {
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
  const [draggingWorkId, setDraggingWorkId] = useState("");
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDragContentRef = useRef<ContentData | null>(null);
  const suppressNextTabClickRef = useRef(false);

  const activeWork = content.works.find((work) => work.id === activeWorkId) ?? content.works[0];
  const activeWorkIndex = content.works.findIndex((work) => work.id === activeWork?.id);

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

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  const reorderWorkTabs = useCallback((fromWorkId: string, toWorkId: string) => {
    if (!fromWorkId || !toWorkId || fromWorkId === toWorkId) return;

    setContent((current) => {
      const fromIndex = current.works.findIndex((work) => work.id === fromWorkId);
      const toIndex = current.works.findIndex((work) => work.id === toWorkId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current;

      const works = [...current.works];
      const [movedWork] = works.splice(fromIndex, 1);
      works.splice(toIndex, 0, movedWork);
      const nextContent = { ...current, works };
      pendingDragContentRef.current = nextContent;
      return nextContent;
    });
  }, []);

  useEffect(() => {
    if (!draggingWorkId) return undefined;

    function finishDrag() {
      clearLongPressTimer();
      const nextContent = pendingDragContentRef.current;
      pendingDragContentRef.current = null;
      setDraggingWorkId("");
      if (nextContent) void persistContent(nextContent);
    }

    function moveTab(event: PointerEvent) {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-work-tab-id]");
      const targetId = target?.dataset.workTabId;
      if (!targetId || targetId === draggingWorkId) return;
      reorderWorkTabs(draggingWorkId, targetId);
    }

    window.addEventListener("pointermove", moveTab);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", moveTab);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [draggingWorkId, persistContent, reorderWorkTabs]);

  function updateWork(workId: string, patch: Partial<WorkItem>) {
    setContent((current) => ({
      ...current,
      works: current.works.map((work) => (work.id === workId ? { ...work, ...patch } : work)),
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
      title: "CUSTOM PAGE",
      subtitle: `新项目 ${nextId}`,
      description: "在这里填写项目背景、你的职责、执行亮点和最终成果。",
      group: "s-live",
      image: "/images/style-reference.jpg",
      showcaseTitle: `新项目 ${nextId} 展示图`,
      showcaseDescription: "用于放项目主视觉、现场执行图、海报拼图或阶段成果图，可在这里补充这张图的展示重点。",
      tags: ["项目展示", "现场执行", "成果复盘"],
      links: [{ label: "项目展示", icon: "Eye" }],
    };
    const nextContent = {
      ...content,
      works: [...content.works, nextWork],
    };

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
    if (!activeWork || activeWorkIndex < 0) return;
    if (nextIndex < 0 || nextIndex >= content.works.length || nextIndex === activeWorkIndex) return;

    const works = [...content.works];
    const [movedWork] = works.splice(activeWorkIndex, 1);
    works.splice(nextIndex, 0, movedWork);

    const nextContent = { ...content, works };
    setContent(nextContent);
    setActiveWorkId(movedWork.id);
    setDeleteConfirmId("");
    void persistContent(nextContent);
  }

  function startTabLongPress(event: ReactPointerEvent<HTMLButtonElement>, workId: string) {
    clearLongPressTimer();
    event.currentTarget.setPointerCapture(event.pointerId);
    longPressTimerRef.current = setTimeout(() => {
      suppressNextTabClickRef.current = true;
      pendingDragContentRef.current = null;
      setActiveWorkId(workId);
      setDeleteConfirmId("");
      setDraggingWorkId(workId);
    }, 220);
  }

  function cancelTabLongPress() {
    clearLongPressTimer();
  }

  function selectWorkTab(workId: string) {
    if (suppressNextTabClickRef.current) {
      suppressNextTabClickRef.current = false;
      return;
    }
    setDeleteConfirmId("");
    setActiveWorkId(workId);
  }

  async function uploadImage(workId: string, field: "image" | "videoImage", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await uploadProjectImage(file);
      persistWorkPatch(workId, { [field]: image });
      event.currentTarget.value = "";
    } catch {
      setSaveError("图片上传失败：请使用 JPG / PNG / WebP / GIF / AVIF 图片。");
    }
  }

  async function uploadGalleryImage(
    workId: string,
    field: "onsite" | "signal" | "output",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await uploadProjectImage(file);
      const work = content.works.find((item) => item.id === workId);
      persistWorkPatch(workId, {
        galleryImages: {
          ...(work?.galleryImages ?? {}),
          [field]: image,
        },
      });
      event.currentTarget.value = "";
    } catch {
      setSaveError("图片上传失败：请使用 JPG / PNG / WebP / GIF / AVIF 图片。");
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatar = await uploadProjectImage(file);
      setContent((current) => {
        const nextContent = {
          ...current,
          profile: current.profile ? { ...current.profile, avatar } : current.profile,
        };
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

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-heading">
          <div>
            <span>PRIVATE CMS</span>
            <h1>内容后台</h1>
            <p>这里的修改会直接写入 public/content.json，返回预览刷新即可看到。</p>
          </div>
          <Link href="/">返回预览</Link>
        </div>

        <div className="admin-grid">
          <form className="admin-panel">
            <h2>基础信息</h2>
            <label>
              姓名
              <input
                value={content.profile?.name ?? ""}
                onChange={(event) => setContent((current) => ({
                  ...current,
                  profile: current.profile ? { ...current.profile, name: event.target.value } : current.profile,
                }))}
              />
            </label>
            <label>
              职业定位
              <input
                value={content.profile?.role ?? ""}
                onChange={(event) => setContent((current) => ({
                  ...current,
                  profile: current.profile ? { ...current.profile, role: event.target.value } : current.profile,
                }))}
              />
            </label>
            <label>
              首屏文案
              <textarea
                value={content.hero.mainText}
                onChange={(event) => setContent((current) => ({
                  ...current,
                  hero: { ...current.hero, mainText: event.target.value },
                }))}
              />
            </label>
            <label>
              联系电话
              <input
                value={content.profile?.phone ?? ""}
                onChange={(event) => setContent((current) => ({
                  ...current,
                  profile: current.profile ? { ...current.profile, phone: event.target.value } : current.profile,
                }))}
              />
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
            <label className="admin-upload">
              <ImagePlus size={18} />
              上传/替换头像
              <input type="file" accept="image/*" onChange={uploadAvatar} />
            </label>
            {content.profile?.avatar && (
              <div className="admin-avatar-preview">
                <StoredImage src={content.profile.avatar} alt="头像预览" />
                <span>头像已保存</span>
              </div>
            )}
          </form>

          <div className="admin-panel">
            <div className="admin-panel-title">
              <h2>项目内容</h2>
              <div className="admin-project-tools">
                <button
                  className="admin-order-button"
                  disabled={activeWorkIndex <= 0}
                  onClick={() => moveActiveWork(-1)}
                  type="button"
                >
                  <ArrowLeft size={16} />
                  前移
                </button>
                <button
                  className="admin-order-button"
                  disabled={activeWorkIndex < 0 || activeWorkIndex >= content.works.length - 1}
                  onClick={() => moveActiveWork(1)}
                  type="button"
                >
                  后移
                  <ArrowRight size={16} />
                </button>
                <button className="admin-add-button" onClick={addWorkPage} type="button">
                  <Plus size={16} />
                  添加页面
                </button>
                <button
                  className={`admin-delete-button ${deleteConfirmId === activeWork?.id ? "confirm" : ""}`}
                  onClick={deleteActiveWork}
                  type="button"
                >
                  <Trash2 size={16} />
                  {deleteConfirmId === activeWork?.id ? "确认删除" : "删除页面"}
                </button>
              </div>
            </div>
            <div className={`admin-tabs ${draggingWorkId ? "reordering" : ""}`}>
              {content.works.map((work) => (
                <button
                  key={work.id}
                  className={`${work.id === activeWorkId ? "active" : ""} ${work.id === draggingWorkId ? "dragging" : ""}`}
                  data-work-tab-id={work.id}
                  onContextMenu={(event) => event.preventDefault()}
                  onClick={() => selectWorkTab(work.id)}
                  onPointerCancel={cancelTabLongPress}
                  onPointerDown={(event) => startTabLongPress(event, work.id)}
                  onPointerEnter={() => {
                    if (draggingWorkId) reorderWorkTabs(draggingWorkId, work.id);
                  }}
                  onPointerUp={cancelTabLongPress}
                  type="button"
                >
                  {work.id}
                </button>
              ))}
            </div>
            <p className="admin-tabs-help">排序建议使用“前移 / 后移”；也可以长按页码后拖动。</p>

            {activeWork && (
              <>
                <label>
                  项目名称
                  <input value={activeWork.subtitle} onChange={(event) => updateWork(activeWork.id, { subtitle: event.target.value })} />
                </label>
                <label>
                  归属栏目
                  <select
                    value={getWorkGroup(activeWork)}
                    onChange={(event) => updateWork(activeWork.id, { group: event.target.value as WorkItem["group"] })}
                  >
                    {workGroupOptions.map((group) => (
                      <option value={group.id} key={group.id}>
                        {group.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  排序位置
                  <select
                    value={activeWorkIndex}
                    onChange={(event) => moveActiveWorkToIndex(Number(event.target.value))}
                  >
                    {content.works.map((work, index) => (
                      <option value={index} key={work.id}>
                        第 {index + 1} 位 · {work.id} · {work.subtitle}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  项目描述
                  <textarea value={activeWork.description} onChange={(event) => updateWork(activeWork.id, { description: event.target.value })} />
                </label>
                <label>
                  展示图标题
                  <input
                    value={activeWork.showcaseTitle ?? `${activeWork.subtitle} 展示图`}
                    onChange={(event) => updateWork(activeWork.id, { showcaseTitle: event.target.value })}
                  />
                </label>
                <label>
                  展示图描述
                  <textarea
                    value={activeWork.showcaseDescription ?? ""}
                    onChange={(event) => updateWork(activeWork.id, { showcaseDescription: event.target.value })}
                  />
                </label>
                <label>
                  关键成果
                  <textarea
                    value={activeWork.resultText ?? ""}
                    onChange={(event) => updateWork(activeWork.id, { resultText: event.target.value })}
                  />
                </label>
                <label>
                  标签
                  <input
                    value={activeWork.tags.join(", ")}
                    onChange={(event) => updateWork(activeWork.id, {
                      tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })}
                  />
                </label>
                <label>
                  现场执行标题
                  <input
                    value={activeWork.galleryText?.onsiteTitle ?? "现场执行"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), onsiteTitle: event.target.value },
                    })}
                  />
                </label>
                <label>
                  现场执行说明
                  <input
                    value={activeWork.galleryText?.onsiteDescription ?? "导播台 / 机位 / 灯光 / 调音台"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), onsiteDescription: event.target.value },
                    })}
                  />
                </label>
                <label>
                  信号链路标题
                  <input
                    value={activeWork.galleryText?.signalTitle ?? "信号链路"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), signalTitle: event.target.value },
                    })}
                  />
                </label>
                <label>
                  信号链路说明
                  <input
                    value={activeWork.galleryText?.signalDescription ?? "回传设备 / 推流监看 / 主备链路"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), signalDescription: event.target.value },
                    })}
                  />
                </label>
                <label>
                  成片画面标题
                  <input
                    value={activeWork.galleryText?.outputTitle ?? "成片画面"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), outputTitle: event.target.value },
                    })}
                  />
                </label>
                <label>
                  成片画面说明
                  <input
                    value={activeWork.galleryText?.outputDescription ?? "直播截图 / TVC画面 / 品牌内容"}
                    onChange={(event) => updateWork(activeWork.id, {
                      galleryText: { ...(activeWork.galleryText ?? {}), outputDescription: event.target.value },
                    })}
                  />
                </label>
                <label className="admin-upload">
                  <ImagePlus size={18} />
                  上传项目主图/目录图
                  <input type="file" accept="image/*" onChange={(event) => uploadImage(activeWork.id, "image", event)} />
                </label>
                <label className="admin-upload">
                  <ImagePlus size={18} />
                  上传项目展示图
                  <input type="file" accept="image/*" onChange={(event) => uploadImage(activeWork.id, "videoImage", event)} />
                </label>
                <div className="admin-upload-grid">
                  <label className="admin-upload">
                    <ImagePlus size={18} />
                    现场执行图
                    <input type="file" accept="image/*" onChange={(event) => uploadGalleryImage(activeWork.id, "onsite", event)} />
                  </label>
                  <label className="admin-upload">
                    <ImagePlus size={18} />
                    信号链路图
                    <input type="file" accept="image/*" onChange={(event) => uploadGalleryImage(activeWork.id, "signal", event)} />
                  </label>
                  <label className="admin-upload">
                    <ImagePlus size={18} />
                    成片画面图
                    <input type="file" accept="image/*" onChange={(event) => uploadGalleryImage(activeWork.id, "output", event)} />
                  </label>
                </div>
                <div className="admin-work-preview">
                  <article>
                    <span>主图</span>
                    <StoredImage src={activeWork.image} alt="项目主图预览" />
                  </article>
                  <article>
                    <span>展示图</span>
                    <StoredImage src={activeWork.videoImage ?? activeWork.image} alt="项目展示图预览" />
                  </article>
                  <article>
                    <span>现场</span>
                    <StoredImage src={activeWork.galleryImages?.onsite ?? activeWork.image} alt="现场执行图预览" />
                  </article>
                  <article>
                    <span>链路</span>
                    <StoredImage src={activeWork.galleryImages?.signal ?? activeWork.image} alt="信号链路图预览" />
                  </article>
                  <article>
                    <span>成片</span>
                    <StoredImage src={activeWork.galleryImages?.output ?? activeWork.image} alt="成片画面图预览" />
                  </article>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="admin-actions">
          <button onClick={saveLocal} type="button"><Save size={16} />保存到代码文件</button>
          <button onClick={exportJson} type="button"><Download size={16} />导出 JSON</button>
          {savedAt && <span>已保存 {savedAt}</span>}
          {saveError && <span className="admin-error">{saveError}</span>}
        </div>
      </section>
    </main>
  );
}
