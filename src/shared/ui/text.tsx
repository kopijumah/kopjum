
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import React from 'react';
import { cn } from '../lib/utils';

type VariantKey =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'h7'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-[3rem] font-[700]',
      h2: 'scroll-m-20 text-[1.875rem] font-[600]',
      h3: 'scroll-m-10 text-[1.5rem] font-[600]',
      h4: 'scroll-m-10 text-[1.25rem] font-[600]',
      h5: 'text-[1rem] font-[600]',
      h6: 'text-[0.875rem] font-[600]',
      h7: 'text-[0.75rem] font-[600]',
      p1: 'scroll-m-10 text-[1rem] font-[400]',
      p2: 'scroll-m-10 text-[0.875rem] font-[400]',
      p3: 'text-[0.75rem] font-[400]',
      p4: 'text-[0.625rem] font-[400]',
      p5: 'text-[0.45rem] font-[400]',
    },
  },
});

const variantToTag: Record<VariantKey, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  h7: 'span',
  p1: 'p',
  p2: 'p',
  p3: 'p',
  p4: 'p',
  p5: 'p',
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: VariantKey;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  disableSelect?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'p3',
      children,
      className,
      asChild = false,
      disableSelect = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : variantToTag[variant];

    return (
      <Comp
        className={cn(
          typographyVariants({ variant, className }),
          disableSelect ? 'select-none' : '',
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Typography.displayName = 'Typography';

export { Typography };
