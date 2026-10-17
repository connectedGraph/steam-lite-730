// Vite 静态资源映射：构建时自动收集 assets/ingredients/ 下的全部透明 WebP。
// 由 food-cutout-toolkit 的 512px PNG 原图批量缩到 320px WebP（约 15KB/张），
// 站内最大显示约 180px，320px 足够覆盖 2x 屏，同时把图鉴首屏体积从 ~19MB 降到 ~1MB。
import { INGREDIENT_KEY_BY_ID } from './ingredientAssetMap';

const modules = import.meta.glob('./ingredients/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const ASSETS: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const name = path.split('/').pop() as string;
  ASSETS[name] = url;
}

// 旧素材名 -> 新概念键（历史数据里硬编码的素材名）
const LEGACY_KEY: Record<string, string> = {
  chicken: 'chicken_breast',
  cod: 'fish_white',
  tofu: 'tofu_firm',
  purple_yam: 'purple_potato',
};

const FALLBACK = 'cut_broccoli.webp';

/** 把数据里的素材名（可能是 .png 结尾）解析为 Vite 静态资源 URL。 */
export function resolveAsset(name: string): string {
  if (!name) return ASSETS[FALLBACK] || '';
  let candidate = name;
  const bare = name.replace(/\.(png|webp)$/, '');

  if (bare.startsWith('plate_')) {
    // plate_beef -> cut_plate_beef.webp
    candidate = `cut_${bare}.webp`;
  } else if (bare.startsWith('cut_')) {
    const key = bare.slice(4);
    candidate = `cut_${LEGACY_KEY[key] || key}.webp`;
  }

  if (!ASSETS[candidate]) {
    const key = bare.replace(/^cut_/, '').replace(/^plate_/, '');
    candidate = `cut_${LEGACY_KEY[key] || key}.webp`;
  }

  return ASSETS[candidate] || ASSETS[FALLBACK] || '';
}

/** 按食材 id 取素材 URL（77 种食材各自使用自己的透明图）。 */
export function ingredientAssetById(id: number): string {
  const key = INGREDIENT_KEY_BY_ID[id];
  return key ? ASSETS[`cut_${key}.webp`] || ASSETS[FALLBACK] || '' : ASSETS[FALLBACK] || '';
}

export { ASSETS };
