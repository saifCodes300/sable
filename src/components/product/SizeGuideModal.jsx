import { Modal } from '../ui/Modal';

const CLOTHING_SIZES = [
  { size: 'XS', chest: '34–36" (86–91 cm)', waist: '28–29" (71–74 cm)', sleeve: '32.5" (82.5 cm)' },
  { size: 'S', chest: '36–38" (91–97 cm)', waist: '30–31" (76–79 cm)', sleeve: '33.5" (85 cm)' },
  { size: 'M', chest: '38–40" (97–102 cm)', waist: '32–33" (81–84 cm)', sleeve: '34.5" (87.5 cm)' },
  { size: 'L', chest: '40–42" (102–107 cm)', waist: '34–35" (86–89 cm)', sleeve: '35.5" (90 cm)' },
  { size: 'XL', chest: '42–44" (107–112 cm)', waist: '36–38" (91–97 cm)', sleeve: '36.5" (92.5 cm)' },
];

const SHOE_SIZES = [
  { eu: '40', us: '7', uk: '6', cm: '25.0 cm' },
  { eu: '41', us: '8', uk: '7', cm: '25.8 cm' },
  { eu: '42', us: '9', uk: '8', cm: '26.6 cm' },
  { eu: '43', us: '10', uk: '9', cm: '27.4 cm' },
  { eu: '44', us: '11', uk: '10', cm: '28.2 cm' },
  { eu: '45', us: '12', uk: '11', cm: '29.0 cm' },
];

export function SizeGuideModal({ open, onClose, category = 'clothing' }) {
  const isShoes = category === 'shoes';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Size Guide"
      subtitle="All SABLE pieces are cut for a clean, contemporary tailored silhouette."
    >
      {isShoes ? (
        <div className="space-y-4">
          <p className="text-sm text-sable-muted">
            Our Italian footwear follows standard European sizing. If you are between sizes, we
            recommend sizing down for unlined suede loafers and staying true to size for sneakers
            and boots.
          </p>
          <div className="overflow-x-auto border border-sable-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sable-card-beige border-b border-sable-border font-mono text-[11px] uppercase tracking-btn text-sable-black">
                  <th className="py-3 px-4">EU</th>
                  <th className="py-3 px-4">US</th>
                  <th className="py-3 px-4">UK</th>
                  <th className="py-3 px-4">Foot Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sable-border text-sm">
                {SHOE_SIZES.map((row) => (
                  <tr key={row.eu} className="hover:bg-sable-card-beige/40">
                    <td className="py-3 px-4 font-mono font-medium">{row.eu}</td>
                    <td className="py-3 px-4 text-sable-muted">{row.us}</td>
                    <td className="py-3 px-4 text-sable-muted">{row.uk}</td>
                    <td className="py-3 px-4 font-mono text-xs">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-sable-muted">
            Measurements below correspond to body measurements. For an intentionally relaxed
            editorial drape, take your usual size.
          </p>
          <div className="overflow-x-auto border border-sable-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sable-card-beige border-b border-sable-border font-mono text-[11px] uppercase tracking-btn text-sable-black">
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sable-border text-sm">
                {CLOTHING_SIZES.map((row) => (
                  <tr key={row.size} className="hover:bg-sable-card-beige/40">
                    <td className="py-3 px-4 font-mono font-medium">{row.size}</td>
                    <td className="py-3 px-4 text-sable-muted">{row.chest}</td>
                    <td className="py-3 px-4 text-sable-muted">{row.waist}</td>
                    <td className="py-3 px-4 text-sable-muted">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
