import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ items = [], defaultOpenId = null, className = '' }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`divide-y divide-sable-border border-y border-sable-border ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              id={`accordion-header-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => toggle(item.id)}
              className="w-full py-4 flex items-center justify-between text-left group transition-colors duration-150"
            >
              <span className="font-mono text-xs uppercase tracking-btn text-sable-black group-hover:text-sable-brown transition-colors">
                {item.title}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-sable-muted transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-sable-black' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={`grid transition-all duration-200 ${
                isOpen ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden text-sm text-sable-muted leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
