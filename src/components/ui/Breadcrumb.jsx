import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span className="text-sable-muted select-none" aria-hidden="true">
                /
              </span>
            )}
            {isLast || !item.to ? (
              <span
                className="text-sable-black font-medium truncate max-w-[240px]"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-sable-muted hover:text-sable-brown transition-colors duration-150"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
