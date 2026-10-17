import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Plus, RotateCcw, X } from 'lucide-react';
import { resolveAsset } from '../assets/assetMap';
import type { MealRow } from '../data/db';
import { cx } from '../lib/utils';
import MealPlate from './MealPlate';

interface Props {
  meal: MealRow;
  inMenu: boolean;
  onClose: () => void;
  onToggleMenu: () => void;
}

export default function MealDetail({ meal, inMenu, onClose, onToggleMenu }: Props) {
  const [grams, setGrams] = useState<Record<number, number>>(() =>
    Object.fromEntries(meal.items.map((item, index) => [index, item.amountG])),
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const totals = useMemo(() => {
    let weight = 0;
    let kcal = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    meal.items.forEach((item, index) => {
      const g = grams[index] ?? item.amountG;
      weight += g;
      kcal += (g * item.kcalPer100g) / 100;
      protein += (g * item.proteinPer100g) / 100;
      carbs += (g * item.carbsPer100g) / 100;
      fat += (g * item.fatPer100g) / 100;
    });
    return {
      weight: Math.round(weight),
      kcal: Math.round(kcal),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [grams, meal.items]);

  const resetGrams = () =>
    setGrams(Object.fromEntries(meal.items.map((item, index) => [index, item.amountG])));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="meal-detail-title">
      <div className="anim-fade fixed inset-0 bg-forest-deep/55 backdrop-blur-[3px]" onClick={onClose} aria-hidden />

      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <div className="anim-sheet relative w-full max-w-4xl overflow-hidden rounded-t-[28px] border border-line/80 bg-card shadow-lift sm:rounded-[28px]">
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />

          <button
            onClick={onClose}
            aria-label="关闭详情"
            className="absolute right-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-line/70 bg-card/90 text-ink-soft shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-forest-deep"
          >
            <X size={16} strokeWidth={2} />
          </button>

          <div className="lg:grid lg:grid-cols-[340px_1fr]">
            {/* 左：成品图 + 营养 */}
            <div className="border-line/70 bg-white lg:border-r">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-square">
                <div className="absolute inset-0 p-4 lg:p-6">
                  <MealPlate mealId={meal.id} items={meal.items} alt={meal.title} eager className="h-full w-full" />
                </div>
                <span className="absolute left-4 top-4 rounded-full border border-line bg-paper/90 px-3 py-1 text-[10px] font-bold tabular text-ink-soft backdrop-blur lg:hidden">
                  DAY {meal.dayNumber} · {meal.mealType}
                </span>
              </div>
              <div className="hidden border-t border-line/70 px-5 py-4 lg:block">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="eyebrow !text-[9px]">本餐热量</p>
                    <p className="font-display mt-1 text-[34px] font-semibold leading-none tabular text-forest-deep">
                      {totals.kcal}
                      <span className="ml-1 text-[11px] font-normal tracking-normal text-muted">kcal</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] leading-5 text-muted">
                    <p>净重 {totals.weight}g</p>
                    <p>蛋白 {totals.protein}g</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line-soft pt-3 text-center">
                  {[
                    ['蛋白', totals.protein],
                    ['碳水', totals.carbs],
                    ['脂肪', totals.fat],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-[10px] text-muted">{label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular text-ink">{value}g</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右：内容 */}
            <div className="max-h-none overflow-y-auto p-5 sm:p-7 lg:max-h-[86vh]">
              <div className="pr-10">
                <p className="eyebrow !text-[9.5px]">
                  No.{meal.id} · Day {meal.dayNumber} · {meal.mealType} · {meal.mainCategory}
                </p>
                <h2 id="meal-detail-title" className="font-display mt-2 text-[24px] font-semibold leading-snug text-forest-deep sm:text-[27px]">
                  {meal.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage/70 px-2.5 py-1 font-semibold text-forest-deep">
                    {meal.cookingMethod}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> 备餐 {meal.prepMinutes} 分钟
                  </span>
                  <span className="h-3 w-px bg-line" />
                  <span>主食 · {meal.stapleFood}</span>
                </div>
              </div>

              {/* 移动端营养条 */}
              <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl border border-line/70 bg-paper/60 p-3 text-center lg:hidden">
                {[
                  [String(totals.kcal), 'kcal'],
                  [`${totals.protein}`, '蛋白 g'],
                  [`${totals.carbs}`, '碳水 g'],
                  [`${totals.fat}`, '脂肪 g'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-[17px] font-semibold tabular text-forest-deep">{value}</p>
                    <p className="mt-0.5 text-[9.5px] text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="eyebrow !text-[10px]">食材与用量</h3>
                <button
                  onClick={resetGrams}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted transition-colors hover:text-forest-deep"
                >
                  <RotateCcw size={11} /> 按原方
                </button>
              </div>

              <div className="mt-3 space-y-3.5">
                {meal.items.map((item, index) => {
                  const value = grams[index] ?? item.amountG;
                  const itemKcal = Math.round((value * item.kcalPer100g) / 100);
                  const isOil = item.category === '油脂';
                  return (
                    <div key={`${item.ingredientId}-${index}`} className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-soft bg-white">
                        <img src={resolveAsset(item.assetPng)} alt="" className="h-8 w-8 object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="truncate text-[13px] font-semibold text-ink">
                            {item.name}
                            <span className="ml-1.5 text-[10px] font-normal text-muted">{item.category}</span>
                          </p>
                          <p className="shrink-0 text-[11px] text-muted">
                            <b className="text-[12.5px] font-bold tabular text-forest-deep">{value}g</b>
                            <span className="ml-1.5 tabular">{itemKcal} kcal</span>
                          </p>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={isOil ? 15 : 300}
                          step={isOil ? 1 : 5}
                          value={value}
                          aria-label={`${item.name} 用量`}
                          onChange={(e) => setGrams((prev) => ({ ...prev, [index]: Number(e.target.value) }))}
                          className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-soft"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-line/70 bg-paper/50 p-4">
                  <p className="eyebrow !text-[9px]">调味</p>
                  <p className="mt-1.5 text-[13px] leading-6 text-ink-soft">{meal.seasoning}</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-paper/50 p-4">
                  <p className="eyebrow !text-[9px]">做法</p>
                  <p className="mt-1.5 text-[13px] leading-6 text-ink-soft">{meal.steps}</p>
                </div>
                <div className="rounded-2xl border border-sage-deep/60 bg-sage/40 p-4">
                  <p className="eyebrow !text-[9px] !text-forest-deep/70">减碳建议</p>
                  <p className="mt-1.5 text-[13px] leading-6 text-forest-deep">{meal.lowCarbTip}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2.5 border-t border-line-soft pt-5">
                <button
                  onClick={onToggleMenu}
                  className={cx(
                    'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985]',
                    inMenu
                      ? 'border border-forest/15 bg-sage text-forest-deep hover:bg-sage-deep/80'
                      : 'bg-forest text-[#f6f1e4] shadow-[0_12px_26px_-14px_rgba(14,43,32,0.85)] hover:bg-forest-deep',
                  )}
                >
                  {inMenu ? <Check size={16} strokeWidth={2.4} /> : <Plus size={16} strokeWidth={2.2} />}
                  {inMenu ? '已在菜单中' : '加入我的菜单'}
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-line bg-card px-5 text-sm font-semibold text-ink-soft transition-colors hover:bg-white"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
