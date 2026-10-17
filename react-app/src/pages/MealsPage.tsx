import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import DishCard from '../components/DishCard';
import { Button, PageHeader, Segmented } from '../components/ui';
import { MEAL_CATEGORIES, MEALS_TABLE, type MealRow } from '../data/db';
import { cx } from '../lib/utils';

export type MealSort = 'default' | 'kcal-asc' | 'protein-desc';

const PAGE_SIZE = 12;
const TYPE_OPTIONS = ['全部', '午餐', '晚餐'] as const;

const CATEGORY_COUNTS: Record<string, number> = MEAL_CATEGORIES.reduce(
  (acc, category) => {
    acc[category] = category === '全部' ? MEALS_TABLE.length : MEALS_TABLE.filter((m) => m.mainCategory === category).length;
    return acc;
  },
  {} as Record<string, number>,
);

const SORT_OPTIONS: { value: MealSort; label: string }[] = [
  { value: 'default', label: '默认顺序' },
  { value: 'kcal-asc', label: '热量由低到高' },
  { value: 'protein-desc', label: '蛋白质由高到低' },
];

interface Props {
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  mealType: string;
  onMealType: (value: string) => void;
  maxCalories: number;
  onMaxCalories: (value: number) => void;
  sort: MealSort;
  onSort: (value: MealSort) => void;
  page: number;
  onPage: (value: number) => void;
  inMenu: (id: number) => boolean;
  onOpen: (meal: MealRow) => void;
  onToggleMenu: (meal: MealRow) => void;
  onReset: () => void;
}

function FilterPanel({ compact = false, ...props }: Props & { compact?: boolean }) {
  const { search, onSearch, category, onCategory, mealType, onMealType, maxCalories, onMaxCalories, sort, onSort, onReset } = props;

  return (
    <>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="搜菜名或食材，如 鲈鱼"
          aria-label="搜索菜名或食材"
          className="h-11 w-full rounded-xl border border-line bg-paper/50 pl-10 pr-3 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-forest/40 focus:bg-white"
        />
      </div>

      {compact ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {MEAL_CATEGORIES.map((cat) => {
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
      ) : (
        <>
          <div className="mt-5">
            <p className="eyebrow !text-[9.5px]">蛋白类别</p>
            <div className="mt-2.5 space-y-0.5">
              {MEAL_CATEGORIES.map((cat) => {
                const active = cat === category;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategory(cat)}
                    className={cx(
                      'flex w-full items-center rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold transition-colors',
                      active ? 'bg-forest text-[#f6f1e4]' : 'text-ink-soft hover:bg-sage/60',
                    )}
                  >
                    <span>{cat === '全部' ? '全部菜品' : cat}</span>
                    <span className={cx('ml-auto text-[10px] tabular', active ? 'text-[#f6f1e4]/60' : 'text-muted')}>
                      {CATEGORY_COUNTS[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-4">
            <p className="eyebrow !text-[9.5px]">餐次</p>
            <Segmented
              options={TYPE_OPTIONS}
              value={mealType as (typeof TYPE_OPTIONS)[number]}
              onChange={onMealType}
              size="sm"
              className="mt-2.5 grid w-full grid-cols-3"
            />
          </div>

          <div className="mt-5 border-t border-line-soft pt-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[9.5px]">热量上限</p>
              <span className="text-[11px] font-bold tabular text-forest-deep">{maxCalories} kcal</span>
            </div>
            <input
              type="range"
              min={360}
              max={660}
              step={10}
              value={maxCalories}
              aria-label="热量上限"
              onChange={(e) => onMaxCalories(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-soft"
            />
            <div className="mt-1.5 flex justify-between text-[9.5px] text-muted">
              <span>360</span>
              <span>660</span>
            </div>
          </div>

          <div className="mt-5 border-t border-line-soft pt-4">
            <p className="eyebrow !text-[9.5px]">排序</p>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as MealSort)}
              className="mt-2.5 h-10 w-full rounded-xl border border-line bg-paper/50 px-2.5 text-[12px] font-semibold text-ink-soft outline-none focus:border-forest/40"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onReset}
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-forest-deep"
          >
            <RotateCcw size={12} />
            重置全部筛选
          </button>
        </>
      )}
    </>
  );
}

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function MealsPage(props: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    search,
    category,
    mealType,
    maxCalories,
    sort,
    page,
    onPage,
    inMenu,
    onOpen,
    onToggleMenu,
    onMealType,
    onMaxCalories,
    onSearch,
    onSort,
  } = props;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = MEALS_TABLE.filter((meal) => {
      if (category !== '全部' && meal.mainCategory !== category) return false;
      if (mealType !== '全部' && meal.mealType !== mealType) return false;
      if (meal.caloriesKcal > maxCalories) return false;
      if (q && !meal.title.toLowerCase().includes(q) && !meal.items.some((item) => item.name.toLowerCase().includes(q))) {
        return false;
      }
      return true;
    });
    if (sort === 'kcal-asc') list.sort((a, b) => a.caloriesKcal - b.caloriesKcal);
    else if (sort === 'protein-desc') list.sort((a, b) => b.proteinG - a.proteinG);
    return list;
  }, [search, category, mealType, maxCalories, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        eyebrow="Recipes · 菜谱"
        title={
          <>
            730 道，<span className="italic text-persimmon">慢慢</span>选。
          </>
        }
        description="按蛋白类别、餐次与热量上限筛选。点开任意一道，可以按自己的食量调整每种食材的克重，热量与蛋白会实时重算。"
      />

      <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-7">
        {/* 桌面筛选栏 */}
        <aside className="sticky top-8 hidden rounded-[24px] border border-line/80 bg-card p-5 shadow-soft lg:block">
          <FilterPanel {...props} />
        </aside>

        <div className="min-w-0">
          {/* 移动筛选 */}
          <div className="mb-4 rounded-[22px] border border-line/80 bg-card p-4 shadow-soft lg:hidden">
            <FilterPanel {...props} compact />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11.5px] text-muted">
                找到 <b className="font-bold tabular text-forest-deep">{filtered.length}</b> 道
              </p>
              <button
                onClick={() => setFiltersOpen((open) => !open)}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
                  filtersOpen ? 'border-forest bg-forest text-[#f6f1e4]' : 'border-line bg-card text-ink-soft',
                )}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={12} />
                筛选
              </button>
            </div>
            {filtersOpen && (
              <div className="anim-fade mt-4 border-t border-line-soft pt-4">
                <div>
                  <p className="eyebrow !text-[9.5px]">餐次</p>
                  <Segmented
                    options={TYPE_OPTIONS}
                    value={mealType as (typeof TYPE_OPTIONS)[number]}
                    onChange={onMealType}
                    size="sm"
                    className="mt-2 grid w-full grid-cols-3"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow !text-[9.5px]">热量上限</p>
                    <span className="text-[11px] font-bold tabular text-forest-deep">{maxCalories} kcal</span>
                  </div>
                  <input
                    type="range"
                    min={360}
                    max={660}
                    step={10}
                    value={maxCalories}
                    aria-label="热量上限"
                    onChange={(e) => onMaxCalories(Number(e.target.value))}
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-soft"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <select
                    value={sort}
                    onChange={(e) => onSort(e.target.value as MealSort)}
                    aria-label="排序"
                    className="h-9 flex-1 rounded-xl border border-line bg-paper/50 px-2.5 text-[12px] font-semibold text-ink-soft outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      props.onReset();
                      onSearch('');
                    }}
                  >
                    <RotateCcw size={12} /> 重置
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 结果栏 */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-[12px] text-muted">
              找到 <b className="font-bold tabular text-forest-deep">{filtered.length}</b> 道
              {category !== '全部' && <span className="ml-1.5">· {category}</span>}
              {mealType !== '全部' && <span className="ml-1.5">· {mealType}</span>}
            </p>
            <p className="text-[11px] text-muted">第 {safePage} / {totalPages} 页</p>
          </div>

          {paged.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((meal) => (
                <DishCard
                  key={meal.id}
                  meal={meal}
                  inMenu={inMenu(meal.id)}
                  onOpen={() => onOpen(meal)}
                  onToggleMenu={() => onToggleMenu(meal)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-line bg-card/60 px-6 py-16 text-center">
              <p className="font-display text-[20px] font-semibold text-forest-deep">没有符合条件的菜</p>
              <p className="mt-2 text-[12.5px] text-muted">试试放宽热量上限，或换一个类别。</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-5"
                onClick={() => {
                  props.onReset();
                  onSearch('');
                }}
              >
                <RotateCcw size={12} /> 重置筛选
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <button
                onClick={() => onPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                aria-label="上一页"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-ink-soft transition-colors hover:border-forest hover:text-forest-deep disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink-soft"
              >
                <ChevronLeft size={15} />
              </button>
              <div className="hidden items-center gap-1 sm:flex">
                {pageWindow(safePage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="px-1 text-[11px] text-muted">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => onPage(p)}
                      aria-current={p === safePage ? 'page' : undefined}
                      className={cx(
                        'h-9 min-w-9 rounded-full px-2 text-[12px] font-semibold tabular transition-colors',
                        p === safePage
                          ? 'bg-forest text-[#f6f1e4]'
                          : 'text-ink-soft hover:bg-sage/70 hover:text-forest-deep',
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <span className="px-2 text-[12px] tabular text-muted sm:hidden">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => onPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                aria-label="下一页"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-ink-soft transition-colors hover:border-forest hover:text-forest-deep disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink-soft"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
