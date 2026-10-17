import { ArrowRight, Check, Copy, Plus, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import MealPlate from '../components/MealPlate';
import { Button, PageHeader } from '../components/ui';
import type { MealRow, ShoppingItem } from '../data/db';
import { resolveAsset } from '../assets/assetMap';
import { cx } from '../lib/utils';

interface Props {
  menu: MealRow[];
  shoppingList: ShoppingItem[];
  checked: Record<string, boolean>;
  summary: { meals: number; kcal: number; protein: number };
  onToggleChecked: (name: string) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onOpen: (meal: MealRow) => void;
  onCopy: () => void;
  onGoDraw: () => void;
  onGoMeals: () => void;
}

export default function MenuPage({
  menu,
  shoppingList,
  checked,
  summary,
  onToggleChecked,
  onRemove,
  onClear,
  onOpen,
  onCopy,
  onGoDraw,
  onGoMeals,
}: Props) {
  const checkedCount = shoppingList.filter((item) => checked[item.name]).length;

  const grouped = shoppingList.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="My Menu · 我的菜单"
        title={
          <>
            想吃<em className="not-italic text-persimmon">什么</em>，就买什么。
          </>
        }
        description="从抽签或菜谱里收藏的菜会汇总到这里。所有食材按净用量合并、按生熟比折算成实际购买重量，边买边勾掉。"
        right={
          menu.length > 0 ? (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card/70 px-4 py-2 text-[11px] font-semibold text-muted transition-colors hover:border-persimmon/40 hover:text-persimmon"
            >
              <Trash2 size={12} /> 清空菜单
            </button>
          ) : undefined
        }
      />

      {menu.length === 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-line/80 bg-card shadow-soft">
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="relative grid h-36 w-36 place-items-center">
              <div className="absolute inset-0 rounded-full border border-line/70" />
              <div className="absolute inset-5 rounded-full border border-line/50" />
              <ShoppingBag size={44} strokeWidth={1.1} className="relative text-sage-deep" />
              <Sparkles size={16} className="absolute right-4 top-5 text-honey" />
            </div>
            <h2 className="font-display mt-6 text-[24px] font-semibold text-forest-deep">菜单还是空的。</h2>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-muted">
              先去抽一餐，或到菜谱里挑几道想吃的。加进来之后，采购清单会自动按你选的菜算好。
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={onGoDraw}>
                <Sparkles size={15} /> 去抽一餐
              </Button>
              <Button variant="secondary" onClick={onGoMeals}>
                浏览菜谱 <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          <div className="grid gap-px border-t border-line/70 bg-line/60 sm:grid-cols-3">
            {[
              ['01', '加入菜单', '抽签结果或菜谱详情里，点「加入菜单」。'],
              ['02', '自动折算', '净用量合并后，按生熟比换算成买菜重量。'],
              ['03', '边买边勾', '买齐一项勾掉一项，一键复制作战清单。'],
            ].map(([step, title, text]) => (
              <div key={step} className="bg-card px-5 py-5">
                <p className="font-display text-[18px] font-semibold text-sage-deep">{step}</p>
                <p className="mt-1.5 text-[12.5px] font-bold text-forest-deep">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 概览 */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [`${summary.meals}`, '道菜在菜单里'],
              [summary.kcal.toLocaleString(), '合计 kcal'],
              [`${summary.protein.toFixed(0)}g`, '合计蛋白质'],
              [`${shoppingList.length}`, '需采购食材'],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={cx(
                  'rounded-[22px] border border-line/80 p-4 shadow-soft sm:p-5',
                  index === 0 ? 'bg-forest text-[#f6f1e4]' : 'bg-card',
                )}
              >
                <p
                  className={cx(
                    'font-display text-[27px] font-semibold leading-none tabular sm:text-[31px]',
                    index === 0 ? 'text-[#f6f1e4]' : 'text-forest-deep',
                  )}
                >
                  {value}
                </p>
                <p className={cx('mt-2 text-[10.5px] font-medium', index === 0 ? 'text-[#f6f1e4]/70' : 'text-muted')}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            {/* 菜单列表 */}
            <section className="min-w-0 rounded-[26px] border border-line/80 bg-card p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="font-display text-[17px] font-semibold text-forest-deep">已选菜品</h2>
                <span className="text-[11px] text-muted">{menu.length} 道</span>
              </div>
              <div className="mt-3 space-y-2">
                {menu.map((meal) => (
                  <div
                    key={meal.id}
                    className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-line/80 hover:bg-paper/50"
                  >
                    <button onClick={() => onOpen(meal)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-line-soft">
                        <MealPlate mealId={meal.id} items={meal.items} alt={meal.title} className="h-full w-full p-0.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow !text-[9px] !tracking-[0.14em]">
                          DAY {meal.dayNumber} · {meal.mealType} · {meal.mainCategory}
                        </p>
                        <h3 className="font-display mt-1 truncate text-[14.5px] font-semibold text-forest-deep">
                          {meal.title}
                        </h3>
                        <p className="mt-0.5 text-[10.5px] text-muted">
                          <b className="font-bold tabular text-ink-soft">{meal.caloriesKcal} kcal</b>
                          <span className="mx-1.5">·</span>蛋白 {meal.proteinG}g
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => onRemove(meal.id)}
                      aria-label={`从菜单移除 ${meal.title}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted/70 transition-colors hover:bg-persimmon/10 hover:text-persimmon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={onGoMeals}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-[12px] font-semibold text-muted transition-colors hover:border-forest/30 hover:bg-sage/40 hover:text-forest-deep"
              >
                <Plus size={13} /> 继续挑选
              </button>
            </section>

            {/* 采购清单 */}
            <section className="min-w-0 rounded-[26px] border border-line/80 bg-card p-4 shadow-soft sm:p-5 lg:sticky lg:top-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[17px] font-semibold text-forest-deep">采购清单</h2>
                  <p className="mt-0.5 text-[10.5px] text-muted">已按生熟比折算成购买重量</p>
                </div>
                <Button size="sm" variant="secondary" onClick={onCopy} className="!h-8 !rounded-full !px-3">
                  <Copy size={12} /> 复制
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10.5px] text-muted">
                  <span>
                    已买 <b className="font-bold tabular text-forest-deep">{checkedCount}</b> / {shoppingList.length} 项
                  </span>
                  <span className="tabular">{shoppingList.length ? Math.round((checkedCount / shoppingList.length) * 100) : 0}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-forest transition-[width] duration-500 ease-out"
                    style={{ width: `${shoppingList.length ? (checkedCount / shoppingList.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="no-scrollbar mt-4 space-y-4 pr-1 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="eyebrow sticky top-0 z-[1] bg-card/95 py-1.5 backdrop-blur !text-[9px]">
                      {category} · {items.length}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {items.map((item) => {
                        const isChecked = !!checked[item.name];
                        return (
                          <button
                            key={item.name}
                            onClick={() => onToggleChecked(item.name)}
                            className={cx(
                              'flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left transition-colors hover:bg-paper/70',
                              isChecked && 'opacity-55',
                            )}
                          >
                            <span
                              className={cx(
                                'grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-colors',
                                isChecked ? 'border-forest bg-forest text-[#f6f1e4]' : 'border-sage-deep bg-card',
                              )}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </span>
                            <img src={resolveAsset(item.assetPng)} alt="" className="h-7 w-7 shrink-0 object-contain" />
                            <div className="min-w-0 flex-1">
                              <p className={cx('truncate text-[12.5px] font-semibold text-ink', isChecked && 'line-through')}>
                                {item.name}
                              </p>
                              <p className="text-[9.5px] text-muted">
                                {item.form} · 净重 {item.plannedG}g
                              </p>
                            </div>
                            <span className="shrink-0 text-[12px] font-bold tabular text-forest-deep">
                              {item.purchaseG}g
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-t border-line-soft pt-3 text-[10px] leading-5 text-muted">
                合并了 {menu.length} 道菜的食材净用量；米面折算干重，薯类与肉类预留少量损耗。
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
