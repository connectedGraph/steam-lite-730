import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shell, TABS, type TabId } from './components/Layout';
import MealDetail from './components/MealDetail';
import AtlasPage, { type AtlasBasis, type AtlasSort } from './pages/AtlasPage';
import LuckyPage from './pages/LuckyPage';
import MealsPage, { type MealSort } from './pages/MealsPage';
import MenuPage from './pages/MenuPage';
import {
  DIET_GUIDELINES,
  MEALS_TABLE,
  buildShoppingList,
  type GuidelineRow,
  type MealRow,
} from './data/db';

type MealTypeFilter = '不限' | '午餐' | '晚餐';

const pickGuideline = (): GuidelineRow => DIET_GUIDELINES[Math.floor(Math.random() * DIET_GUIDELINES.length)];

function readTabFromHash(): TabId {
  const hash = window.location.hash.replace('#', '');
  return (TABS.some((tab) => tab.id === hash) ? hash : 'lucky') as TabId;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(readTabFromHash);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const triggerToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    const onHash = () => setActiveTab(readTabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab]);

  const switchTab = (tab: TabId) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
  };

  // ---- 抽签 ----
  const [luckyType, setLuckyType] = useState<MealTypeFilter>('不限');
  const [luckyMeal, setLuckyMeal] = useState<MealRow | null>(null);
  const [guideline, setGuideline] = useState<GuidelineRow>(pickGuideline);

  const handleDrawn = (meal: MealRow) => {
    setLuckyMeal(meal);
    setGuideline(pickGuideline());
  };

  // ---- 菜谱筛选 ----
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedMealType, setSelectedMealType] = useState('全部');
  const [maxCalories, setMaxCalories] = useState(660);
  const [mealSort, setMealSort] = useState<MealSort>('default');
  const [currentPage, setCurrentPage] = useState(1);

  const resetMeals = () => {
    setSearchQuery('');
    setSelectedCategory('全部');
    setSelectedMealType('全部');
    setMaxCalories(660);
    setMealSort('default');
    setCurrentPage(1);
  };

  // ---- 图鉴 ----
  const [atlasSearch, setAtlasSearch] = useState('');
  const [atlasCategory, setAtlasCategory] = useState('全部');
  const [atlasSort, setAtlasSort] = useState<AtlasSort>('kcal-asc');
  const [atlasBasis, setAtlasBasis] = useState<AtlasBasis>('100');

  // ---- 我的菜单（localStorage）----
  const [myMenu, setMyMenu] = useState<MealRow[]>(() => {
    try {
      const raw = localStorage.getItem('steamlite730.menu');
      if (!raw) return [];
      const ids: number[] = JSON.parse(raw);
      return ids.map((id) => MEALS_TABLE.find((meal) => meal.id === id)).filter(Boolean) as MealRow[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('steamlite730.menu', JSON.stringify(myMenu.map((meal) => meal.id)));
    } catch {
      /* 隐私模式下写入失败时忽略 */
    }
  }, [myMenu]);

  const inMenu = (id: number) => myMenu.some((meal) => meal.id === id);

  const addToMenu = (meal: MealRow) => {
    if (inMenu(meal.id)) {
      triggerToast(`已在菜单里：${meal.title}`);
      return;
    }
    setMyMenu((prev) => [...prev, meal]);
    triggerToast(`已加入菜单：${meal.title}`);
  };

  const removeFromMenu = (id: number) => {
    setMyMenu((prev) => prev.filter((meal) => meal.id !== id));
    triggerToast('已从菜单移除');
  };

  const toggleMenu = (meal: MealRow) => {
    if (inMenu(meal.id)) removeFromMenu(meal.id);
    else addToMenu(meal);
  };

  const clearMenu = () => {
    setMyMenu([]);
    triggerToast('已清空菜单');
  };

  const [checkedShopItems, setCheckedShopItems] = useState<Record<string, boolean>>({});
  const toggleChecked = (name: string) =>
    setCheckedShopItems((prev) => ({ ...prev, [name]: !prev[name] }));

  const shoppingList = useMemo(() => buildShoppingList(myMenu), [myMenu]);
  const menuSummary = useMemo(
    () => ({
      meals: myMenu.length,
      kcal: myMenu.reduce((sum, meal) => sum + meal.caloriesKcal, 0),
      protein: myMenu.reduce((sum, meal) => sum + meal.proteinG, 0),
    }),
    [myMenu],
  );

  const copyShoppingList = () => {
    const text = [
      '蒸轻食 730 · 采购清单',
      ...shoppingList.map((item) => `${item.name}：${item.purchaseG}g`),
    ].join('\n');
    navigator.clipboard
      ?.writeText(text)
      .then(() => triggerToast('采购清单已复制'))
      .catch(() => triggerToast('复制失败，请手动选择文本'));
  };

  // ---- 详情弹窗 ----
  const [activeMeal, setActiveMeal] = useState<MealRow | null>(null);
  const closeDetail = useCallback(() => setActiveMeal(null), []);

  return (
    <>
      <Shell
        activeTab={activeTab}
        onTab={switchTab}
        menuCount={myMenu.length}
        menuKcal={menuSummary.kcal}
        toast={toast}
      >
        {activeTab === 'lucky' && (
          <LuckyPage
            luckyType={luckyType}
            onTypeChange={setLuckyType}
            meal={luckyMeal}
            onDrawn={handleDrawn}
            onOpen={setActiveMeal}
            inMenu={inMenu}
            onAddToMenu={addToMenu}
            guideline={guideline}
          />
        )}

        {activeTab === 'meals' && (
          <MealsPage
            search={searchQuery}
            onSearch={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            category={selectedCategory}
            onCategory={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            mealType={selectedMealType}
            onMealType={(value) => {
              setSelectedMealType(value);
              setCurrentPage(1);
            }}
            maxCalories={maxCalories}
            onMaxCalories={(value) => {
              setMaxCalories(value);
              setCurrentPage(1);
            }}
            sort={mealSort}
            onSort={(value) => {
              setMealSort(value);
              setCurrentPage(1);
            }}
            page={currentPage}
            onPage={setCurrentPage}
            inMenu={inMenu}
            onOpen={setActiveMeal}
            onToggleMenu={toggleMenu}
            onReset={resetMeals}
          />
        )}

        {activeTab === 'atlas' && (
          <AtlasPage
            search={atlasSearch}
            onSearch={setAtlasSearch}
            category={atlasCategory}
            onCategory={setAtlasCategory}
            sort={atlasSort}
            onSort={setAtlasSort}
            basis={atlasBasis}
            onBasis={setAtlasBasis}
          />
        )}

        {activeTab === 'shop' && (
          <MenuPage
            menu={myMenu}
            shoppingList={shoppingList}
            checked={checkedShopItems}
            summary={menuSummary}
            onToggleChecked={toggleChecked}
            onRemove={removeFromMenu}
            onClear={clearMenu}
            onOpen={setActiveMeal}
            onCopy={copyShoppingList}
            onGoDraw={() => switchTab('lucky')}
            onGoMeals={() => switchTab('meals')}
          />
        )}
      </Shell>

      {activeMeal && (
        <MealDetail
          key={activeMeal.id}
          meal={activeMeal}
          inMenu={inMenu(activeMeal.id)}
          onClose={closeDetail}
          onToggleMenu={() => toggleMenu(activeMeal)}
        />
      )}
    </>
  );
}
