import type { ElementType, ReactNode } from 'react';
import { ArrowUpRight, CheckCircle2, Dices, Leaf, Search, ShoppingBag } from 'lucide-react';
import { resolveAsset } from '../assets/assetMap';
import { cx } from '../lib/utils';

export type TabId = 'lucky' | 'meals' | 'atlas' | 'shop';

export const TABS: { id: TabId; label: string; short: string; icon: ElementType }[] = [
  { id: 'lucky', label: '今天吃什么', short: '开饭', icon: Dices },
  { id: 'meals', label: '菜谱', short: '菜谱', icon: Search },
  { id: 'atlas', label: '食材图鉴', short: '图鉴', icon: Leaf },
  { id: 'shop', label: '我的菜单', short: '菜单', icon: ShoppingBag },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cx(
          'grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#fbf7ec] to-[#e3ddc9] ring-1 ring-line',
          compact ? 'h-9 w-9' : 'h-11 w-11',
        )}
      >
        <img src={resolveAsset('plate_pork.png')} alt="" className={compact ? 'h-7 w-7' : 'h-9 w-9'} />
      </div>
      <div className="leading-tight">
        <div className={cx('font-display font-semibold tracking-wide text-forest-deep', compact ? 'text-[15px]' : 'text-[18px]')}>
          蒸轻食
        </div>
        <div className="eyebrow mt-1 !text-[9px] !tracking-[0.18em]">Steam Lite · 730</div>
      </div>
    </div>
  );
}

interface ShellProps {
  activeTab: TabId;
  onTab: (tab: TabId) => void;
  menuCount: number;
  menuKcal: number;
  toast: string | null;
  children: ReactNode;
}

export function Shell({ activeTab, onTab, menuCount, menuKcal, toast, children }: ShellProps) {
  const activeMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="relative z-[1] min-h-screen">
      {/* 桌面端左侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-line/70 bg-[rgba(255,252,245,0.62)] backdrop-blur-xl lg:flex">
        <div className="px-7 pt-8">
          <BrandMark />
          <p className="mt-7 max-w-[190px] text-[12px] leading-5 text-muted">
            365 天，730 道中式蒸煮低油餐。
            <br />
            把每天吃什么，变简单。
          </p>
        </div>

        <nav className="mt-8 flex-1 px-4" aria-label="主导航">
          <p className="eyebrow mb-3 px-3.5">Explore</p>
          <div className="space-y-1.5">
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200',
                    active
                      ? 'bg-forest text-[#f6f1e4] shadow-[0_14px_30px_-18px_rgba(14,43,32,0.9)]'
                      : 'text-ink-soft hover:bg-sage/70 hover:text-forest-deep',
                  )}
                >
                  <span className={cx('tabular w-4 text-[10px] font-semibold', active ? 'text-[#f6f1e4]/50' : 'text-muted/70')}>
                    0{index + 1}
                  </span>
                  <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                  <span className="text-[13.5px] font-semibold tracking-wide">{tab.label}</span>
                  {tab.id === 'shop' && menuCount > 0 && (
                    <span
                      className={cx(
                        'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tabular',
                        active ? 'bg-[#f6f1e4]/15 text-[#f6f1e4]' : 'bg-sage text-forest-deep',
                      )}
                    >
                      {menuCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="mx-4 mb-6 rounded-[22px] border border-line/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="eyebrow">我的菜单</span>
            <span className="font-display text-lg leading-none text-forest-deep tabular">{menuCount}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {menuCount > 0 ? `合计 ${menuKcal.toLocaleString()} kcal · 已自动生成采购清单` : '抽一餐，或从菜谱里挑几道'}
          </p>
          <button
            onClick={() => onTab('shop')}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-sage/80 px-3 py-2 text-[12px] font-semibold text-forest-deep transition-colors hover:bg-sage-deep/80"
          >
            查看采购清单
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <BrandMark compact />
          <button
            onClick={() => onTab('shop')}
            className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-bold text-forest-deep"
            aria-label="打开我的菜单"
          >
            <ShoppingBag size={13} strokeWidth={2} />
            菜单
            {menuCount > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[9px] tabular text-[#f6f1e4]">
                {menuCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <div className="lg:pl-[272px]">
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-20 lg:pt-10">
          <div key={activeTab} className="anim-rise">
            {children}
          </div>
          <footer className="mt-16 hidden items-center justify-between border-t border-line/70 pt-5 text-[11px] text-muted lg:flex">
            <span>蒸轻食 730 · 数据来自《365 天 730 道中式蒸煮低油健康餐》</span>
            <span className="tabular">每一餐，都替你算过。</span>
          </footer>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="主导航"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[24px] border border-line/80 bg-card/88 p-1.5 shadow-lift backdrop-blur-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTab(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex flex-col items-center gap-1 rounded-[18px] py-2 transition-all duration-200 active:scale-95',
                  active ? 'bg-forest text-[#f6f1e4]' : 'text-muted',
                )}
              >
                <Icon size={19} strokeWidth={active ? 2 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">{tab.short}</span>
                {tab.id === 'shop' && menuCount > 0 && (
                  <span className="absolute right-[22%] top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-persimmon px-0.5 text-[8px] font-bold text-white">
                    {menuCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {toast && (
        <div
          role="status"
          className="anim-toast fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-[60] flex max-w-[86vw] items-center gap-2 rounded-full border border-[#f6f1e4]/10 bg-forest-deep px-4 py-2.5 text-[13px] font-medium text-[#f6f1e4] shadow-lift lg:bottom-8"
        >
          <CheckCircle2 size={15} className="shrink-0 text-sage-deep" />
          <span className="truncate">{toast}</span>
        </div>
      )}
      <span className="sr-only">当前页面：{activeMeta.label}</span>
    </div>
  );
}
