import { resolveAsset } from '../assets/assetMap';
import type { MealIngredientItem } from '../App';

type Slot = 'protein' | 'veg' | 'staple' | 'oil';

function slotOf(category: string): Slot {
  if (category === '主食' || category === '低主食') return 'staple';
  if (category === '油脂') return 'oil';
  if (category === '蔬菜' || category === '菌菇') return 'veg';
  return 'protein';
}

interface Props {
  items: MealIngredientItem[];
  className?: string;
}

// 每个槽位的摆放（相对碗宽的百分比，left/top 指左上角）
// 两行布局：上行为两份蔬菜，下行为蛋白 + 主食
const VEG_POS = [
  { left: '1%', top: '2%' },
  { left: '49%', top: '2%' },
];
const PROT_POS = [{ left: '1%', top: '45%' }];
const PROT_POS_2 = [
  { left: '-4%', top: '43%' },
  { left: '24%', top: '43%' },
];

/**
 * 按一道菜的真实食材，用透明 cutout 在碗里叠出一张俯视图。
 * 两行摆盘：上行两份蔬菜，下行蛋白与主食，均用碗沿内圈约束。
 */
export default function DishBowl({ items, className = '' }: Props) {
  const protein = items.filter((i) => slotOf(i.category) === 'protein').slice(0, 2);
  const veg = items.filter((i) => slotOf(i.category) === 'veg').slice(0, 2);
  const staple = items.find((i) => slotOf(i.category) === 'staple');
  const protPos = protein.length > 1 ? PROT_POS_2 : PROT_POS;

  return (
    <div
      className={`relative aspect-square rounded-full bg-gradient-to-br from-[#FDFCF9] via-[#F4F2EA] to-[#E7E4D8] shadow-inner overflow-hidden ${className}`}
    >
      <div className="absolute inset-[4%] rounded-full border-[5px] border-white/80" />
      <div className="absolute inset-[7%] rounded-full bg-[#F9F7F0]/50" />

      {/* 主食：右下 */}
      {staple && (
        <img
          src={resolveAsset(staple.assetPng)}
          alt=""
          className="absolute object-contain"
          style={{ left: '44%', top: '44%', width: '52%', zIndex: 2 }}
        />
      )}

      {/* 两份蔬菜：左上、右上 */}
      {veg.map((v, i) => (
        <img
          key={`v${i}`}
          src={resolveAsset(v.assetPng)}
          alt=""
          className="absolute object-contain drop-shadow-sm"
          style={{ ...VEG_POS[i], width: '48%', zIndex: 2 }}
        />
      ))}

      {/* 蛋白：左下（优先视觉）；两份时错开 */}
      {protein.map((p, i) => (
        <img
          key={`p${i}`}
          src={resolveAsset(p.assetPng)}
          alt=""
          className="absolute object-contain drop-shadow-md"
          style={{ ...protPos[i], width: protein.length > 1 ? '46%' : '52%', zIndex: 3 }}
        />
      ))}
    </div>
  );
}
