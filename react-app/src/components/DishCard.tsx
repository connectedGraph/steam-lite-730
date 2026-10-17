import { Check, Plus } from 'lucide-react';
import type { MealRow } from '../data/db';
import { cx } from '../lib/utils';
import MealPlate from './MealPlate';

interface Props {
  meal: MealRow;
  inMenu: boolean;
  onOpen: () => void;
  onToggleMenu: () => void;
}

export default function DishCard({ meal, inMenu, onOpen, onToggleMenu }: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[24px] border border-line/80 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-sage-deep/80 hover:shadow-lift">
      <div className="relative bg-white">
        <button onClick={onOpen} className="block w-full text-left" aria-label={`查看 ${meal.title}`}>
          <div className="aspect-[5/4] w-full overflow-hidden">
            <MealPlate
              mealId={meal.id}
              items={meal.items}
              alt={meal.title}
              className="h-full w-full p-3 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>
        </button>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="rounded-full border border-line/70 bg-paper/90 px-2.5 py-1 text-[10px] font-bold tabular text-ink-soft backdrop-blur">
            DAY {meal.dayNumber}
          </span>
          <span className="rounded-full border border-line/70 bg-paper/90 px-2.5 py-1 text-[10px] font-semibold text-ink-soft backdrop-blur">
            {meal.mealType}
          </span>
        </div>

        <button
          onClick={onToggleMenu}
          aria-label={inMenu ? '从菜单移除' : '加入菜单'}
          title={inMenu ? '从菜单移除' : '加入菜单'}
          className={cx(
            'absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border transition-all duration-200 active:scale-90',
            inMenu
              ? 'border-forest bg-forest text-[#f6f1e4] opacity-100'
              : 'border-line bg-card/95 text-forest-deep shadow-sm backdrop-blur hover:border-forest hover:bg-forest hover:text-[#f6f1e4] lg:opacity-0 lg:group-hover:opacity-100',
          )}
        >
          {inMenu ? <Check size={16} strokeWidth={2.4} /> : <Plus size={16} strokeWidth={2.2} />}
        </button>
      </div>

      <button onClick={onOpen} className="flex flex-1 flex-col p-4 text-left">
        <div className="eyebrow !text-[9.5px] !tracking-[0.16em]">
          {meal.mainCategory} · {meal.cookingMethod}
        </div>
        <h3 className="font-display mt-1.5 line-clamp-2 min-h-[2.6em] text-[16.5px] font-semibold leading-snug text-forest-deep">
          {meal.title}
        </h3>
        <div className="mt-auto flex items-end justify-between border-t border-line-soft pt-2.5">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[20px] font-semibold leading-none tabular text-forest-deep">
              {meal.caloriesKcal}
            </span>
            <span className="text-[10px] font-medium text-muted">kcal</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span>
              蛋白 <b className="font-bold tabular text-ink">{meal.proteinG}g</b>
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="tabular">{meal.prepMinutes} min</span>
          </div>
        </div>
      </button>
    </article>
  );
}
