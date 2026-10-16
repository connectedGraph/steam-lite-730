// Vite 静态资源映射：构建时自动收集 assets/ingredients/ 下的全部透明 PNG。
// 由 food-cutout-toolkit 产出（512x512 RGBA，AI 生成 / 去背）。
import { INGREDIENT_KEY_BY_ID } from './ingredientAssetMap';

const modules = import.meta.glob('./ingredients/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const ASSETS: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const name = path.split('/').pop() as string;
  ASSETS[name] = url;
}

// 旧素材名 -> 新概念键（历史 App.tsx 中硬编码的素材名）
const LEGACY_KEY: Record<string, string> = {
  chicken: 'chicken_breast',
  cod: 'fish_white',
  tofu: 'tofu_firm',
  purple_yam: 'purple_potato',
};

const FALLBACK = 'cut_broccoli.png';

/** 把 App 里使用的素材名解析为 Vite 静态资源 URL。 */
export function resolveAsset(name: string): string {
  if (!name) return ASSETS[FALLBACK] || '';
  let candidate = name;

  if (name.startsWith('plate_')) {
    // plate_beef.png -> cut_plate_beef.png
    candidate = `cut_${name}`;
  } else if (name.startsWith('cut_')) {
    const key = name.slice(4).replace(/\.png$/, '');
    candidate = `cut_${LEGACY_KEY[key] || key}.png`;
  }

  if (!ASSETS[candidate]) {
    const key = name.replace(/^cut_/, '').replace(/^plate_/, '').replace(/\.png$/, '');
    candidate = `cut_${LEGACY_KEY[key] || key}.png`;
  }

  return ASSETS[candidate] || ASSETS[FALLBACK] || '';
}

/** 按食材 id 取素材 URL（77 种食材各自使用自己的透明图）。 */
export function ingredientAssetById(id: number): string {
  const key = INGREDIENT_KEY_BY_ID[id];
  return key ? ASSETS[`cut_${key}.png`] || ASSETS[FALLBACK] || '' : ASSETS[FALLBACK] || '';
}

export { ASSETS };
