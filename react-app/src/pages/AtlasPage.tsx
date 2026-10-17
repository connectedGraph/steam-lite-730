import { useMemo } from 'react';
import { Leaf, Search } from 'lucide-react';
import { Segmented } from '../components/ui';
import { PageHeader } from '../components/ui';
import { ING_CATEGORIES, INGREDIENTS_TABLE, TYPICAL_SERVING, type IngredientRow } from '../data/db';
import { resolveAsset } from '../assets/assetMap';
import { cx } from '../lib/utils';

export type AtlasSort = 'kcal-asc' | 'protein-desc';
export type AtlasBasis = '100' | 'serving';

interface Props {
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  sort: AtlasSort;
  onSort: (value: AtlasSort) => void;
  basis: AtlasBasis;
  onBasis: (value: AtlasBasis) => void;
}

const SORT_OPTIONS = ['kcal-asc', 'protein-desc'] as const;
const BASIS_OPTIONS = ['100', 'serving'] as const;

function MacroBar({ ing, grams }: { ing: IngredientRow; grams: number }) {
  const factor = grams / 100;
  const p = ing.proteinPer100g * factor * 4;
  const c = ing.carbsPer100g * factor * 4;
  const f = ing.fatPer100g * factor * 9;
  const total = p + c + f || 1;
  return (
    <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-line-soft" aria-hidden>
      <span style={{ width: `${(p / total) * 100}%` }} className="bg-forest/75" />
      <span style={{ width: `${(c / total) * 100}%` }} className="bg-honey/70" />
      <span style={{ width: `${(f / total) * 100}%` }} className="bg-persimmon/70" />
    </div>
  );
}

export default function AtlasPage({ search, onSearch, category, onCategory, sort, onSort, basis, onBasis }: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = INGREDIENTS_TABLE.filter((ing) => {
      if (category !== '全部' && ing.category !== category) return false;
      if (q && !ing.name.toLowerCase().includes(q) && !ing.category.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...list].sort((a, b) =>
      sort === 'kcal-asc' ? a.kcalPer100g - b.kcalPer100g : b.proteinPer100g - a.proteinPer100g,
    );
  }, [search, category, sort]);

  const servingLabel = basis === '100' ? '每 100g' : '常见一份';

  return (
    <div>
      <PageHeader
        eyebrow="Atlas · 食材图鉴"
        title={
          <>
            77 种食材，<span className="italic text-persimmon">各有</span>分寸。
          </>
        }
        description="每种食材都配有自己的透明切片图与营养表。可以在「每 100g」和「常见一份」之间切换——一份的克重，取自它在 730 道菜谱里的实际用量中位数。"
        right={
          <div className="hidden items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-2 text-[11px] font-semibold text-muted shadow-soft sm:flex">
            <Leaf size={13} className="text-forest" />
            数据基准 · 中国食物成分表
          </div>
        }
      />

      <div className="rounded-[24px] border border-line/80 bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="搜索食材，如 西兰花 / 菌菇"
              aria-label="搜索食材"
              className="h-11 w-full rounded-xl border border-line bg-paper/50 pl-10 pr-3 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-forest/40 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={SORT_OPTIONS}
              value={sort}
              onChange={(value) => onSort(value as AtlasSort)}
              labels={{ 'kcal-asc': '低卡优先', 'protein-desc': '高蛋白优先' }}
              size="sm"
            />
            <Segmented
              options={BASIS_OPTIONS}
              value={basis}
              onChange={(value) => onBasis(value as AtlasBasis)}
              labels={{ '100': '每 100g', serving: '常见一份' }}
              size="sm"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ING_CATEGORIES.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={cx(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
                  active
                    ? 'border-forest bg-forest text-[#f6f1e4]'
                    : 'border-line bg-card text-ink-soft hover:border-sage-deep',
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] text-muted">
          {basis === 'serving'
            ? '「常见一份」= 该食材在 730 道菜谱中的典型用量（中位数，取整到 5g）。'
            : '「每 100g」= 标准营养成分表基准。'}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[12px] text-muted">
          共 <b className="font-bold tabular text-forest-deep">{filtered.length}</b> 种
          {category !== '全部' && <span className="ml-1.5">· {category}</span>}
        </p>
        <div className="hidden items-center gap-3 text-[10px] text-muted sm:flex">
          <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-forest/75" />蛋白</span>
          <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-honey/70" />碳水</span>
          <span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-persimmon/70" />脂肪</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((ing) => {
          const grams = basis === '100' ? 100 : TYPICAL_SERVING[ing.id] || 100;
          const kcal = Math.round((grams * ing.kcalPer100g) / 100);
          const protein = Math.round((grams * ing.proteinPer100g) / 10) / 10;
          return (
            <article
              key={ing.id}
              className="group rounded-[22px] border border-line/80 bg-card p-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-sage-deep/80 hover:shadow-lift"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-[#fbf8f0] to-[#eaf1e6]">
                <img
                  src={resolveAsset(ing.assetPng)}
                  alt={ing.name}
                  loading="lazy"
                  className="absolute inset-0 m-auto h-[72%] w-[72%] object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <span className="absolute left-2 top-2 rounded-full bg-card/85 px-2 py-0.5 text-[9.5px] font-semibold text-muted backdrop-blur">
                  {ing.category}
                </span>
              </div>
              <div className="mt-2.5 px-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate text-[14px] font-bold text-forest-deep">{ing.name}</h3>
                  <span className="shrink-0 text-[9.5px] text-muted">{grams}g</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="font-display text-[18px] font-semibold leading-none tabular text-forest-deep">
                    {kcal}
                    <span className="ml-0.5 text-[9.5px] font-normal text-muted">kcal</span>
                  </p>
                  <p className="text-[10.5px] text-muted">
                    蛋白 <b className="font-bold tabular text-ink">{protein}g</b>
                  </p>
                </div>
                <MacroBar ing={ing} grams={grams} />
                <p className="mt-1.5 text-[9px] text-muted/80">{servingLabel}</p>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-line bg-card/60 px-6 py-16 text-center">
          <p className="font-display text-[20px] font-semibold text-forest-deep">没有找到这种食材</p>
          <p className="mt-2 text-[12.5px] text-muted">换个关键词，或切回「全部」类别。</p>
        </div>
      )}
    </div>
  );
}
