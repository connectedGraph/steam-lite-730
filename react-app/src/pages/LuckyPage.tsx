import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Dices, Loader2, Plus, Sparkles } from 'lucide-react';
import { resolveAsset } from '../assets/assetMap';
import MealPlate from '../components/MealPlate';
import { Button, Chip, Hairline, PageHeader, Segmented } from '../components/ui';
import { MEALS_TABLE, type GuidelineRow, type MealRow } from '../data/db';

type MealTypeFilter = '不限' | '午餐' | '晚餐';

interface Props {
  luckyType: MealTypeFilter;
  onTypeChange: (type: MealTypeFilter) => void;
  meal: MealRow | null;
  onDrawn: (meal: MealRow) => void;
  onOpen: (meal: MealRow) => void;
  inMenu: (id: number) => boolean;
  onAddToMenu: (meal: MealRow) => void;
  guideline: GuidelineRow;
}

const TYPE_OPTIONS = ['不限', '午餐', '晚餐'] as const;
const REEL_START_INDEX = 4;
const REEL_FINAL_INDEX = 26;
const REEL_LENGTH = 34;
const REEL_DURATION = 2300;

const dishImage = (meal: MealRow) => `${import.meta.env.BASE_URL}dishes/m${meal.id}.webp`;

export default function LuckyPage({
  luckyType,
  onTypeChange,
  meal,
  onDrawn,
  onOpen,
  inMenu,
  onAddToMenu,
  guideline,
}: Props) {
  const [rolling, setRolling] = useState(false);
  const [reel, setReel] = useState<MealRow[]>([]);
  const warmDeck = useRef<MealRow[]>([]);
  const finalRef = useRef<MealRow | null>(null);
  const onDrawnRef = useRef(onDrawn);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const holdTimer = useRef<number | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  onDrawnRef.current = onDrawn;

  const poolFor = () =>
    luckyType === '不限' ? MEALS_TABLE : MEALS_TABLE.filter((m) => m.mealType === luckyType);

  // 空暇时预热一批菜品图，第一次抽签也能直接滚真图
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const pool = poolFor();
      const picks: MealRow[] = [];
      for (let i = 0; i < Math.min(12, pool.length); i++) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        picks.push(pick);
        const img = new Image();
        img.src = dishImage(pick);
      }
      warmDeck.current = picks;
    }, 200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luckyType]);

  // 移动端一开抽就把结果卡滚到眼前，让轮播动画可见
  useEffect(() => {
    if (rolling && window.innerWidth < 1024) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [rolling]);

  // 轮播：从第一张滚到最后一张，先快后慢，最后正中定格
  useLayoutEffect(() => {
    if (!rolling) return;
    const strip = stripRef.current;
    const viewport = viewportRef.current;
    const finalMeal = finalRef.current;
    if (!strip || !viewport || !finalMeal) return;

    const finalEl = strip.querySelector<HTMLElement>('[data-final="true"]');
    const startEl = strip.children[REEL_START_INDEX] as HTMLElement | undefined;
    if (!finalEl || !startEl) return;

    const centerOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
    const startX = viewport.clientWidth / 2 - centerOf(startEl);
    const endX = viewport.clientWidth / 2 - centerOf(finalEl);
    const distance = startX - endX;

    strip.style.transform = `translate3d(${startX}px, 0, 0)`;

    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      setRolling(false);
      setReel([]);
      onDrawnRef.current(finalMeal);
    };

    const motion =
      typeof strip.animate === 'function'
        ? strip.animate(
            [
              {
                transform: `translate3d(${startX}px, 0, 0)`,
                easing: 'linear',
              },
              {
                offset: 0.55,
                transform: `translate3d(${startX - distance * 0.82}px, 0, 0)`,
                // 起点速度与上一段衔接（≈3.7×本段均速），随后平滑减到 0
                easing: 'cubic-bezier(.2,.74,.3,1)',
              },
              { transform: `translate3d(${endX}px, 0, 0)` },
            ],
            { duration: REEL_DURATION, fill: 'forwards' },
          )
        : null;

    if (motion) {
      motion.finished
        .then(() => {
          if (cancelled) return;
          holdTimer.current = window.setTimeout(reveal, 380);
        })
        .catch(() => {});
    } else {
      holdTimer.current = window.setTimeout(reveal, 300);
    }

    return () => {
      cancelled = true;
      motion?.cancel();
      if (holdTimer.current) {
        window.clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
    };
  }, [rolling]);

  const startDraw = () => {
    if (rolling) return;
    const pool = poolFor();
    if (!pool.length) return;

    const final = pool[Math.floor(Math.random() * pool.length)];
    const preload = new Image();
    preload.src = dishImage(final);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onDrawn(final);
      if (window.innerWidth < 1024) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: 'start' }));
      }
      return;
    }

    // 保证轮播用的图都已经预热过；点得太快时当场补一批
    let deck = warmDeck.current;
    if (deck.length < 6) {
      deck = Array.from({ length: 12 }, () => pool[Math.floor(Math.random() * pool.length)]);
      warmDeck.current = deck;
      deck.forEach((item) => {
        const img = new Image();
        img.src = dishImage(item);
      });
    }

    // 轮播里不重复出现最终结果，避免提前“剧透”
    const usable = deck.filter((item) => item.id !== final.id);
    const source = usable.length ? usable : pool.filter((item) => item.id !== final.id);
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const filler = shuffled.length ? shuffled : [final];

    const items: MealRow[] = [];
    for (let i = 0; i < REEL_LENGTH; i++) {
      if (i === REEL_FINAL_INDEX) {
        items.push(final);
      } else {
        items.push(filler[i % filler.length]);
      }
    }

    finalRef.current = final;
    setReel(items);
    setRolling(true);
  };

  const marked = meal ? inMenu(meal.id) : false;

  return (
    <div>
      <PageHeader
        eyebrow="Daily Draw · 今天吃什么"
        title={
          <>
            今天，吃点<span className="italic text-persimmon">轻</span>的。
          </>
        }
        description="365 天，730 道蒸煮低油餐。不必纠结，让一餐替你做决定——抽到什么就吃什么。"
        right={
          <div className="hidden items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-2 text-[11px] font-semibold text-muted shadow-soft sm:flex">
            <Sparkles size={13} className="text-honey" />
            730 道 · 77 种食材 · 3853 条配比
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-7">
        {/* 结果卡 */}
        <section
          ref={resultRef}
          className="order-2 flex scroll-mt-20 flex-col overflow-hidden rounded-[30px] border border-line/80 bg-card shadow-soft lg:order-1"
        >
          <div className="flex items-center justify-between px-5 pt-5 sm:px-7">
            <span className="eyebrow">{rolling ? 'Shuffling' : 'The Answer'}</span>
            {rolling ? (
              <Chip className="!bg-paper/80">
                <Loader2 size={11} className="animate-spin" />
                正在挑选
              </Chip>
            ) : meal ? (
              <Chip className="!bg-paper/80 tabular">
                DAY {meal.dayNumber} · {meal.mealType} · {meal.mainCategory}
              </Chip>
            ) : (
              <Chip className="!bg-paper/80">等待抽取</Chip>
            )}
          </div>

          {rolling && reel.length ? (
            <div className="flex flex-1 flex-col px-5 pb-6 pt-1 sm:px-7">
              <div
                ref={viewportRef}
                className="relative mx-auto my-2 aspect-[4/3] w-full max-w-[360px] overflow-hidden rounded-[26px] bg-[#efe9da] shadow-[inset_0_2px_12px_rgba(28,42,34,0.09)] ring-1 ring-line/60 sm:max-w-[400px]"
              >
                {/* 左右渐隐，强化横向滚动的纵深感 */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#efe9da] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#efe9da] to-transparent" />
                {/* 中央选中框：卡片是 82% 高、正方形，这里略放宽一点 */}
                <div className="pointer-events-none absolute inset-y-[6%] left-1/2 z-10 w-[66%] -translate-x-1/2 rounded-[22px] border border-forest/25" />
                <div className="pointer-events-none absolute left-1/2 top-1.5 z-20 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-forest/40 bg-card" />

                <div ref={stripRef} className="flex h-full items-center gap-2.5 will-change-transform">
                  {reel.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      data-final={index === REEL_FINAL_INDEX ? 'true' : undefined}
                      className="relative grid aspect-square h-[82%] shrink-0 place-items-center overflow-hidden rounded-[20px] border border-line/80 bg-gradient-to-b from-white to-[#faf6ea] p-1.5 shadow-[0_10px_24px_-18px_rgba(28,42,34,0.4)]"
                    >
                      {/* 图片未就绪时的淡餐盘剪影，避免冷启动看到空白卡 */}
                      <img
                        src={resolveAsset('plate_poultry.png')}
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute inset-0 m-auto h-[62%] w-[62%] object-contain opacity-[0.13] grayscale"
                      />
                      <MealPlate
                        mealId={item.id}
                        items={item.items}
                        alt=""
                        eager
                        showSkeleton={false}
                        className="relative h-full w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-col items-center text-center">
                <h2 className="font-display text-[23px] font-semibold leading-snug text-forest-deep sm:text-[26px]">
                  正在为你挑一餐
                </h2>
                <div className="mt-3 flex items-center gap-1.5" aria-hidden>
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="dot-pulse h-1.5 w-1.5 rounded-full bg-forest/60"
                      style={{ animationDelay: `${index * 0.16}s` }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted">从 730 道里翻一张，马上就好。</p>
              </div>
            </div>
          ) : meal ? (
            <div key={meal.id} className="anim-pop flex flex-1 flex-col px-5 pb-6 pt-1 sm:px-7">
              <div className="relative mx-auto my-2 w-full max-w-[300px] sm:max-w-[330px]">
                <div
                  className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(203,218,198,0.65),rgba(247,243,233,0)_68%)]"
                  aria-hidden
                />
                <div className="absolute inset-[3%] rounded-full border border-line/60" aria-hidden />
                <span
                  key={`ring-${meal.id}`}
                  className="anim-ring pointer-events-none absolute inset-[-2%] rounded-[30px] border border-forest/30"
                  aria-hidden
                />
                <MealPlate
                  mealId={meal.id}
                  items={meal.items}
                  alt={meal.title}
                  eager
                  className="relative aspect-square w-full rounded-[26px] bg-white p-2 shadow-[0_30px_60px_-38px_rgba(28,42,34,0.5)] ring-1 ring-line/50"
                />
              </div>

              <div className="mt-2 text-center">
                <p className="eyebrow !text-[9.5px]">
                  {meal.stapleFood} · {meal.cookingMethod}
                </p>
                <h2 className="font-display mx-auto mt-2 max-w-md text-[24px] font-semibold leading-[1.3] text-forest-deep sm:text-[28px]">
                  {meal.title}
                </h2>
              </div>

              <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-3 divide-x divide-line/80 rounded-2xl border border-line/70 bg-paper/55 py-3">
                {[
                  [String(meal.caloriesKcal), 'kcal'],
                  [`${meal.proteinG}g`, '蛋白质'],
                  [`${meal.carbsG}g`, '碳水'],
                ].map(([value, label]) => (
                  <div key={label} className="px-2 text-center">
                    <p className="font-display text-[21px] font-semibold leading-none tabular text-forest-deep">
                      {value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium tracking-wide text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-center gap-2 pt-5">
                <Button onClick={() => onOpen(meal)} size="md" className="flex-1 sm:flex-none">
                  查看做法
                  <ArrowRight size={15} />
                </Button>
                <Button
                  onClick={() => onAddToMenu(meal)}
                  variant={marked ? 'soft' : 'secondary'}
                  size="md"
                  className="flex-1 sm:flex-none"
                >
                  {marked ? <Check size={15} strokeWidth={2.4} /> : <Plus size={15} strokeWidth={2.2} />}
                  {marked ? '已在菜单' : '加入菜单'}
                </Button>
                <Button onClick={startDraw} variant="ghost" size="md" className="flex-1 sm:flex-none">
                  <Dices size={15} />
                  再抽一次
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:py-14">
              <div className="relative grid h-36 w-36 place-items-center sm:h-44 sm:w-44">
                <div className="absolute inset-0 rounded-full border border-line/70" />
                <div className="absolute inset-5 rounded-full border border-line/50" />
                <img
                  src={resolveAsset('plate_seafood.png')}
                  alt=""
                  className="anim-float relative h-24 w-24 object-contain sm:h-28 sm:w-28"
                />
              </div>
              <h2 className="font-display mt-6 text-[24px] font-semibold text-forest-deep">还没抽。</h2>
              <p className="mt-2 max-w-xs text-[13px] leading-6 text-muted">
                选好餐次后按下抽签。今天的午饭或晚饭，交给运气。
              </p>
            </div>
          )}
        </section>

        {/* 控制卡 */}
        <section className="order-1 flex flex-col gap-5 self-start rounded-[28px] border border-line/80 bg-card p-5 shadow-soft sm:p-6 lg:order-2 lg:sticky lg:top-8">
          <div>
            <p className="eyebrow">Draw</p>
            <h2 className="font-display mt-2 hidden text-[23px] font-semibold leading-snug text-forest-deep lg:block">
              让 730 道菜替你决定
            </h2>
            <p className="mt-1.5 hidden text-[12.5px] leading-6 text-muted lg:block">
              先选餐次范围，再从全库随机抽一餐。抽到顺眼的，就存进菜单。
            </p>
          </div>

          <Segmented
            options={TYPE_OPTIONS}
            value={luckyType}
            onChange={onTypeChange}
            labels={{ 不限: '不限', 午餐: '午餐', 晚餐: '晚餐' }}
            className="grid w-full grid-cols-3"
          />

          <Button onClick={startDraw} disabled={rolling} size="lg" className="w-full">
            {rolling ? <Loader2 size={18} className="animate-spin" /> : <Dices size={18} />}
            {rolling ? '正在翻菜单…' : '随机抽一餐'}
          </Button>

          <Hairline className="hidden lg:block" />

          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <span className="text-honey">✦</span>
              <p className="eyebrow !text-[9.5px]">今日饮食原则</p>
            </div>
            <blockquote className="font-display mt-2.5 text-[14.5px] leading-7 text-ink-soft">
              “{guideline.ruleContent}”
            </blockquote>
            <p className="mt-2 text-[10.5px] text-muted">— {guideline.topic} · 来自原始数据包</p>
          </div>

          <div className="mt-auto hidden grid-cols-3 gap-2 border-t border-line-soft pt-4 text-center lg:grid">
            {[
              ['730', '道菜'],
              ['77', '食材'],
              ['365', '天'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-[18px] font-semibold tabular text-forest-deep">{value}</p>
                <p className="mt-0.5 text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 移动端：原则与规模 */}
        <section className="order-3 rounded-[26px] border border-line/80 bg-card p-5 shadow-soft sm:p-6 lg:hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-honey">✦</span>
            <p className="eyebrow !text-[9.5px]">今日饮食原则</p>
          </div>
          <blockquote className="font-display mt-2.5 text-[14.5px] leading-7 text-ink-soft">
            “{guideline.ruleContent}”
          </blockquote>
          <p className="mt-2 text-[10.5px] text-muted">— {guideline.topic} · 来自原始数据包</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line-soft pt-4 text-center">
            {[
              ['730', '道菜'],
              ['77', '食材'],
              ['365', '天'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-[18px] font-semibold tabular text-forest-deep">{value}</p>
                <p className="mt-0.5 text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
