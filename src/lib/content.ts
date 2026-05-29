import { ContentData } from "@/types/content";

let cachedContent: ContentData | null = null;

export async function getContent(): Promise<ContentData> {
  if (cachedContent) return cachedContent;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/content.json`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch content");
    cachedContent = await res.json();
    return cachedContent as ContentData;
  } catch {
    // Fallback default content
    return {
      site: { title: "个人作品集", author: "你的名字", logoIcon: "Flame" },
      nav: {
        categories: ["Visual design", "Brand design", "poster design", "Illustration design", "ip design"],
      },
      hero: {
        titleLines: ["December", "Designer", "works"],
        subtitle: "Layout practice",
        searchLabel: "search",
        searchValue: "俊杰ya",
        exchangeLabel: "exchange",
        exchangeValue: "share",
        mainText: "BANNER POSTER",
        tagText: "Visual\ncommunication",
        motto: "有志者\n事竟成",
        bottomLeft: "SIMPLE\nDESIGN",
        arcText: "Sliding display design",
      },
      catalog: {
        title: "CATALOG",
        categories: [
          { id: "01", name: "移动端设计", items: ["单词大师", "宠物派"], color: "#FF7A45" },
          { id: "02", name: "B端设计", items: ["连客通CRM"], color: "#C8FF00" },
          { id: "03", name: "运营视觉", items: ["banner", "用户弹窗", "H5设计", "启动页与IP"], color: "#4A90D9" },
          { id: "04", name: "官网设计", items: ["孙记包子官网"], color: "#FF69B4" },
        ],
      },
      works: [
        {
          id: "01",
          title: "POSTER",
          subtitle: "单词大师",
          description: "Word Master APP Design",
          image: "/images/work-01.jpg",
          tags: ["移动端设计", "UI/UX"],
          links: [
            { label: "访问网站", icon: "ExternalLink" },
            { label: "搜索图片", icon: "Search" },
          ],
        },
      ],
      footer: {
        copyright: "© 2025 个人作品集",
        contact: "contact@example.com",
      },
    };
  }
}
