import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-sable-black text-sable-white border border-sable-black hover:bg-sable-brown hover:border-sable-brown disabled:bg-sable-muted disabled:border-sable-muted',
  secondary:
    'bg-sable-white text-sable-black border border-sable-black hover:bg-sable-black hover:text-sable-white disabled:opacity-50',
  outline:
    'bg-transparent text-sable-black border border-sable-border hover:border-sable-black disabled:opacity-50',
  ghost:
    'bg-transparent text-sable-black border border-transparent hover:text-sable-brown disabled:opacity-50',
};

const SIZES = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-12 px-6 text-xs',
  lg: 'h-[52px] px-8 text-xs',
};

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    type = 'button',
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-none font-mono uppercase tracking-btn font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});
