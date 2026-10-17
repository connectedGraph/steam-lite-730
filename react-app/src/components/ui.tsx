import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-forest text-[#f6f1e4] shadow-[0_12px_26px_-14px_rgba(14,43,32,0.85)] hover:bg-forest-deep active:bg-forest-deep',
  secondary:
    'bg-card text-ink border border-line hover:border-sage-deep hover:bg-white shadow-[0_1px_0_rgba(255,255,255,0.6)]',
  ghost: 'text-ink-soft hover:bg-sage/70 hover:text-forest-deep',
  soft: 'bg-sage/80 text-forest-deep hover:bg-sage-deep/80',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-14 px-6 text-[15px] gap-2.5 rounded-2xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold tracking-wide transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Record<string, string>;
  className?: string;
  size?: 'sm' | 'md';
}

export function Segmented<T extends string>({ options, value, onChange, labels, className, size = 'md' }: SegmentedProps<T>) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-line bg-paper-deep/50 p-1',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cx(
              'flex flex-1 items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-200',
              size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]',
              active ? 'bg-forest text-[#f6f1e4] shadow-[0_6px_14px_-8px_rgba(14,43,32,0.8)]' : 'text-muted hover:text-ink',
            )}
          >
            {labels?.[option] ?? option}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-line/80 bg-card/80 px-2.5 py-1 text-[11px] font-semibold text-ink-soft',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="anim-rise flex flex-col gap-4 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-[30px] leading-[1.18] font-semibold tracking-[0.01em] text-forest-deep sm:text-[36px] lg:text-[42px]">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-xl text-[13px] leading-6 text-muted lg:text-sm">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cx('hairline', className)} />;
}
