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
 * 菜品成品图：加载 AI 生成的 `/dishes/m<id>.webp`（白底原图，768px）；
 * 图缺失或加载失败时，回退到 DishBowl 按食材实时合成。
 *
 * 说明：早期版本用的是去背透明图，但纯白碗沿与白背景太接近，u2net 会把碗沿
 * 啃掉一块。白底原图既避免了这个问题，也和站内的白色卡片背景自然融合。
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
