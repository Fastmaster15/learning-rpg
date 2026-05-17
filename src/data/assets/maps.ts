export type AssetProvider = "vercel-blob" | "cloudflare-r2" | "external-cdn" | "placeholder";

export type MapAssetHotspotStatus = "active" | "available" | "completed" | "locked" | "final";

export type MapAssetHotspot = {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  status: MapAssetHotspotStatus;
  targetEventId?: string;
};

export type MapAsset = {
  id: string;
  title: string;
  era: "asuka" | "nara" | "heian" | "other";
  place: string;
  type: "field-map-background";
  provider: AssetProvider;
  path: string;
  url: string;
  width: number;
  height: number;
  format: "webp" | "jpeg" | "png";
  version: number;
  notes: string;
  hotspots: MapAssetHotspot[];
};

const DEFAULT_ASSET_BASE_URL = "https://example.public.blob.vercel-storage.com";

export const assetBaseUrl = (
  process.env.NEXT_PUBLIC_RPG_ASSET_BASE_URL ?? DEFAULT_ASSET_BASE_URL
).replace(/\/$/, "");

const buildAssetUrl = (path: string) => `${assetBaseUrl}${path}`;

export const mapAssets = {
  asukaTown: {
    id: "asuka-town-v1",
    title: "飛鳥時代フィールドマップ・町",
    era: "asuka",
    place: "town",
    type: "field-map-background",
    provider: "vercel-blob",
    path: "/learning-rpg/maps/asuka-town-v1.webp",
    url: buildAssetUrl("/learning-rpg/maps/asuka-town-v1.webp"),
    width: 941,
    height: 1672,
    format: "webp",
    version: 1,
    notes:
      "UIラベル・ボタンなしの一枚絵背景。ゲーム側で吹き出しホットスポットを重ねる前提。初期はVercel Blob、容量が厳しくなったらCloudflare R2へ移行する。",
    hotspots: [
      {
        id: "river-bubbles",
        label: "川面の泡",
        description: "飛鳥川の流れを拾う導入イベント。",
        x: 0.48,
        y: 0.76,
        status: "active",
        targetEventId: "event-river-bubbles"
      },
      {
        id: "final-temple",
        label: "寺院",
        description: "Sランク「飛鳥寺」カード解放につながる最終目的地。",
        x: 0.78,
        y: 0.16,
        status: "final",
        targetEventId: "event-final-temple"
      },
      {
        id: "granary",
        label: "食料保管庫",
        description: "集落の生産と備蓄を知る場所。",
        x: 0.24,
        y: 0.28,
        status: "available",
        targetEventId: "event-granary"
      },
      {
        id: "workshop",
        label: "工房",
        description: "技術・渡来文化・寺院造営の関係を知る場所。",
        x: 0.26,
        y: 0.48,
        status: "available",
        targetEventId: "event-workshop"
      },
      {
        id: "administrative-compound",
        label: "官衙",
        description: "統治・記録・地域管理に触れる場所。",
        x: 0.51,
        y: 0.39,
        status: "available",
        targetEventId: "event-administrative-compound"
      },
      {
        id: "market",
        label: "市庭",
        description: "人・物・情報が交わる場所。",
        x: 0.68,
        y: 0.55,
        status: "available",
        targetEventId: "event-market"
      },
      {
        id: "landing-place",
        label: "船着場",
        description: "川を通じた移動・物流の入口。",
        x: 0.72,
        y: 0.80,
        status: "available",
        targetEventId: "event-landing-place"
      },
      {
        id: "residential-area",
        label: "住居群",
        description: "暮らしと共同体を観察する場所。",
        x: 0.28,
        y: 0.65,
        status: "available",
        targetEventId: "event-residential-area"
      }
    ]
  }
} as const satisfies Record<string, MapAsset>;

export const mapAssetList = Object.values(mapAssets);
