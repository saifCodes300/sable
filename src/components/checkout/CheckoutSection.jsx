export function CheckoutSection({ number, title, rightHeader, children }) {
  return (
    <section className="bg-sable-white border border-sable-border p-6 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sable-border">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-sable-black text-sable-white font-mono text-xs flex items-center justify-center shrink-0">
            {number}
          </span>
          <h2 className="font-serif text-xl sm:text-2xl text-sable-black">{title}</h2>
        </div>
        {rightHeader && <div>{rightHeader}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}
