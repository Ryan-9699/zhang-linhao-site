import type { WorkGroupId, WorkItem } from "@/types/content";

export const workGroupOptions: Array<{
  id: WorkGroupId;
  title: string;
  directoryTitle: string;
  directorySubtitle: string;
  defaultCoverTitle: string;
}> = [
  {
    id: "s-live",
    title: "S 级直播项目案例",
    directoryTitle: "S级直播",
    directorySubtitle: "S-Class Live",
    defaultCoverTitle: "巴黎奥运会 / 贵州村奥会",
  },
  {
    id: "celebrity",
    title: "明星级直播影像把控",
    directoryTitle: "明星影像",
    directorySubtitle: "Celebrity Live",
    defaultCoverTitle: "周杰伦之夜 / 明星直播影像",
  },
  {
    id: "commerce",
    title: "电商直播案例",
    directoryTitle: "电商直播",
    directorySubtitle: "Commerce Live",
    defaultCoverTitle: "网易有道精品课直播间",
  },
  {
    id: "brand",
    title: "短视频 / TVC / 品牌内容案例",
    directoryTitle: "品牌内容",
    directorySubtitle: "TVC & Brand",
    defaultCoverTitle: "TVC / 短视频内容拍摄",
  },
];

export function getWorkGroup(work: WorkItem): WorkGroupId {
  if (work.group) return work.group;

  if (work.id === "02") return "celebrity";
  if (work.id === "05") return "commerce";
  return "s-live";
}
