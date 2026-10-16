import { useState } from 'react';
import DishBowl from './DishBowl';
import type { MealIngredientItem } from '../App';

interface Props {
  mealId: number;
  items: MealIngredientItem[];
  className?: string;
  alt?: string;
}

/**
 * 菜品成品图：优先用 AI 生成的 `/dishes/m<id>.png`；
 * 图缺失或加载失败时，回退到 DishBowl 按食材实时合成。
 */
export default function MealPlate({ mealId, items, className = '', alt = '' }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <DishBowl items={items} className={className} />;
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}dishes/m${mealId}.webp`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}
