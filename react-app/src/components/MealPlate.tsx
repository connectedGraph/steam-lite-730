import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DishBowl from './DishBowl';
import type { MealIngredientItem } from '../data/db';

interface Props {
  mealId: number;
  items: MealIngredientItem[];
  className?: string;
  alt?: string;
  eager?: boolean;
}

/**
 * 菜品成品图：加载 AI 生成的 `/dishes/m<id>.webp`（白底原图，768px）。
 * 加载过程中显示纸色骨架，载入后柔和淡入；缺失或失败时回退到 DishBowl 合成。
 */
export default function MealPlate({ mealId, items, className = '', alt = '', eager = false }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
  }, [mealId]);

  // 已缓存过的图在挂载时不会触发 load 事件，绘制前直接标为完成，避免骨架闪一下
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setStatus('loaded');
  }, [mealId]);

  if (status === 'failed') {
    return <DishBowl items={items} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {status === 'loading' && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        ref={imgRef}
        src={`${import.meta.env.BASE_URL}dishes/m${mealId}.webp`}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
        className={`h-full w-full object-contain transition-[opacity,transform] duration-500 ease-out ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
