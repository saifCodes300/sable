import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  className = '',
}) {
  return (
    <div
      className={`border border-sable-border bg-sable-card-beige/60 px-6 py-16 text-center flex flex-col items-center justify-center ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 border border-sable-border bg-sable-white flex items-center justify-center mb-5 text-sable-brown">
          <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      {eyebrow && (
        <p className="font-mono text-[11px] uppercase tracking-btn text-sable-brown mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-2xl sm:text-3xl text-sable-black mb-3">{title}</h2>
      {description && (
        <p className="text-sm text-sable-muted max-w-md mx-auto mb-7">{description}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
