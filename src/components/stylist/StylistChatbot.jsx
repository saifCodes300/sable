import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowUpRight,
  User,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { askVirtualStylist } from '../../api/stylist';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { SableSeal } from '../ui/SableSeal';
import { ProductImage } from '../ui/ProductImage';

const POSTURES = [
  { id: 'athletic', label: 'Athletic / V-Taper', desc: 'Broad shoulders, tapered waist' },
  { id: 'slim', label: 'Slim & Lean', desc: 'Slender frame, narrow silhouette' },
  { id: 'broad', label: 'Broad & Sturdy', desc: 'Full chest, powerful proportions' },
  { id: 'tall', label: 'Tall Stature', desc: 'Long torso and limbs' },
  { id: 'classic', label: 'Classic Proportions', desc: 'Even, balanced athletic frame' },
];

const COMPLEXIONS = [
  { id: 'warm', label: 'Warm Golden', hex: '#D4A373', note: 'Golden, peach or warm honey undertones' },
  { id: 'cool', label: 'Cool Rosy', hex: '#EAD9D5', note: 'Rosy, porcelain, or pink undertones' },
  { id: 'deep', label: 'Deep Rich', hex: '#4A3026', note: 'Espresso, deep mahogany, rich undertones' },
  { id: 'olive', label: 'Olive / Med', hex: '#9E8B6E', note: 'Subtle greenish or golden-tan undertones' },
  { id: 'neutral', label: 'Neutral', hex: '#D9CBBB', note: 'Balanced undertones, universally versatile' },
];

const QUICK_PROMPTS = [
  'What tailored blazer suits my posture best?',
  'Recommend shirts and knits for my undertones',
  'Curate a complete quiet luxury evening ensemble',
  'Which footwear and accessories anchor my frame?',
];

export function StylistChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [posture, setPosture] = useState('athletic');
  const [complexion, setComplexion] = useState('warm');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const { currency, setMiniCartOpen, triggerBagBump } = useUiStore();
  const { addItem } = useCartStore();

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'stylist',
      text: `Welcome to the **SABLE Atelier Fitting Room**.\n\nI am your private virtual stylist. Choose your **body posture** and **skin undertone** above, or ask me any question about silhouette drape, lapel architecture, and color harmony.`,
      recommendations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleConsultation = async (customText = null, overridePosture = null, overrideComplexion = null) => {
    const activePosture = overridePosture || posture;
    const activeComplexion = overrideComplexion || complexion;
    const promptText = customText !== null ? customText : inputMessage.trim();

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText || `Consultation for ${POSTURES.find((p) => p.id === activePosture)?.label} frame with ${COMPLEXIONS.find((c) => c.id === activeComplexion)?.label} undertones.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await askVirtualStylist({
        bodyPosture: activePosture,
        complexion: activeComplexion,
        message: promptText,
      });

      const data = res.data;
      const stylistMsg = {
        id: `stylist-${Date.now()}`,
        sender: 'stylist',
        text: data.reply,
        recommendations: data.recommendations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, stylistMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `stylist-err-${Date.now()}`,
          sender: 'stylist',
          text: 'Our atelier records could not be retrieved at this moment. Please try again shortly.',
          recommendations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (rec) => {
    addItem({
      productId: rec.id,
      slug: rec.slug,
      name: rec.name,
      price: rec.price,
      color: rec.color || 'Ink',
      size: 'M',
      quantity: 1,
      image: rec.image,
    });
    triggerBagBump();
    setMiniCartOpen(true);
    toast.success(`Added ${rec.name} to your bag`);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'stylist',
        text: `Consultation refreshed. Select your **body posture** and **skin undertone** to begin.`,
        recommendations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <aside aria-label="Virtual Stylist Assistant" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Open Atelier Stylist and Fit Advisor"
          className="group flex items-center gap-2.5 bg-sable-black text-sable-white px-4 py-3 sm:px-5 sm:py-3.5 border border-sable-brown shadow-xl hover:bg-sable-brown transition-all duration-200 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sable-beige transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-sable-brown rounded-full ring-2 ring-sable-black animate-pulse" />
          </div>
          <div className="text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sable-beige">
              MAISON SABLE
            </p>
            <p className="font-mono text-xs uppercase tracking-btn font-medium">
              Atelier Stylist & Fit
            </p>
          </div>
        </button>
      </aside>

      {/* Stylist Drawer / Modal Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Atelier Stylist & Fit Advisor Window"
          className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-50 w-[94vw] sm:w-[460px] md:w-[500px] h-[85vh] max-h-[740px] bg-sable-white border border-sable-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-sable-beige border-b border-sable-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SableSeal size={38} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sable-brown">
                  MAISON SABLE · MILANO
                </p>
                <h3 className="font-serif text-lg sm:text-xl text-sable-black leading-tight">
                  Atelier Virtual Stylist
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                title="Restart consultation"
                aria-label="Restart consultation"
                className="w-8 h-8 flex items-center justify-center text-sable-muted hover:text-sable-black transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close stylist window"
                className="w-8 h-8 flex items-center justify-center text-sable-muted hover:text-sable-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Configuration Banner / Quick Toggles */}
          <div className="px-4 py-2.5 bg-sable-card-beige border-b border-sable-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-sable-muted whitespace-nowrap">
                FITTED FOR:
              </span>
              <span className="font-mono text-[11px] uppercase text-sable-black font-semibold bg-sable-white px-2 py-0.5 border border-sable-border">
                {POSTURES.find((p) => p.id === posture)?.label.split('/')[0]}
              </span>
              <span className="font-mono text-[11px] uppercase text-sable-black font-semibold bg-sable-white px-2 py-0.5 border border-sable-border flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                  style={{ backgroundColor: COMPLEXIONS.find((c) => c.id === complexion)?.hex }}
                />
                {COMPLEXIONS.find((c) => c.id === complexion)?.label.split('/')[0]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfig((prev) => !prev)}
              className="font-mono text-[10px] uppercase tracking-btn text-sable-brown hover:underline pl-2 whitespace-nowrap cursor-pointer"
            >
              {showConfig ? 'Hide Profile' : 'Edit Profile'}
            </button>
          </div>

          {/* Interactive Profile Editor (Collapsible) */}
          {showConfig && (
            <div className="p-4 bg-sable-white border-b border-sable-border space-y-3.5 max-h-[300px] overflow-y-auto">
              {/* Posture Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sable-muted flex items-center gap-1.5">
                    <User className="w-3 h-3 text-sable-brown" /> 1. Body Posture & Frame
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {POSTURES.map((p) => {
                    const isSelected = posture === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPosture(p.id);
                          handleConsultation(null, p.id, complexion);
                        }}
                        className={`text-left p-2 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-sable-black bg-sable-black text-sable-white'
                            : 'border-sable-border bg-sable-card-beige hover:border-sable-muted text-sable-black'
                        }`}
                      >
                        <p className="font-mono text-[10px] uppercase font-semibold leading-tight">
                          {p.label}
                        </p>
                        <p
                          className={`text-[9px] leading-snug mt-0.5 ${
                            isSelected ? 'text-sable-beige/80' : 'text-sable-muted'
                          }`}
                        >
                          {p.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complexion Selector */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sable-muted mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-sable-brown" /> 2. Complexion & Skin Undertone
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {COMPLEXIONS.map((c) => {
                    const isSelected = complexion === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setComplexion(c.id);
                          handleConsultation(null, posture, c.id);
                        }}
                        className={`text-left p-2 border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-sable-black bg-sable-black text-sable-white'
                            : 'border-sable-border bg-sable-card-beige hover:border-sable-muted text-sable-black'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase font-semibold truncate leading-tight">
                            {c.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chat Message Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-sable-white/60">
            {messages.map((msg) => {
              const isStylist = msg.sender === 'stylist';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStylist ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-sable-muted">
                      {isStylist ? 'Head Stylist · Atelier' : 'You'}
                    </span>
                    <span className="font-mono text-[9px] text-sable-muted/60">·</span>
                    <span className="font-mono text-[9px] text-sable-muted">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed border ${
                      isStylist
                        ? 'bg-sable-card-beige border-sable-border text-sable-black'
                        : 'bg-sable-black border-sable-black text-sable-white'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-2">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('**').map((chunk, cIdx) =>
                            cIdx % 2 === 1 ? (
                              <strong key={cIdx} className="font-semibold text-sable-brown">
                                {chunk}
                              </strong>
                            ) : (
                              chunk
                            )
                          )}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Embedded Interactive Product Recommendation Cards */}
                  {isStylist && msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-3 space-y-2.5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sable-brown font-medium px-1">
                        RECOMMENDED PIECES FOR YOUR PROFILE:
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="bg-sable-white border border-sable-border p-3 flex gap-3 hover:border-sable-black transition-colors"
                          >
                            <div className="w-20 h-24 shrink-0 bg-sable-card-beige border border-sable-border overflow-hidden">
                              <ProductImage
                                src={rec.image}
                                alt={rec.name}
                                label={rec.name}
                                colorHex={rec.hex}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-baseline justify-between gap-2">
                                  <Link
                                    to={`/product/${rec.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="font-serif text-sm font-semibold text-sable-black hover:text-sable-brown truncate inline-flex items-center gap-1"
                                  >
                                    {rec.name}
                                    <ArrowUpRight className="w-3 h-3 text-sable-muted shrink-0" />
                                  </Link>
                                  <span className="font-mono text-xs font-semibold text-sable-black whitespace-nowrap">
                                    {formatCurrency(rec.price, currency)}
                                  </span>
                                </div>
                                <p className="font-mono text-[10px] uppercase text-sable-muted mt-0.5 flex items-center gap-1.5">
                                  <span>{rec.subcategory}</span>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-full border border-black/20"
                                      style={{ backgroundColor: rec.hex }}
                                    />
                                    {rec.color}
                                  </span>
                                </p>
                                <p className="text-[11px] text-sable-muted mt-1 leading-snug line-clamp-2">
                                  {rec.rationale}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-sable-border">
                                <Link
                                  to={`/product/${rec.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="font-mono text-[10px] uppercase tracking-btn text-sable-muted hover:text-sable-black"
                                >
                                  View Piece →
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdd(rec)}
                                  className="ml-auto inline-flex items-center gap-1 bg-sable-black text-sable-white px-2.5 py-1 text-[10px] font-mono uppercase tracking-btn hover:bg-sable-brown transition-colors cursor-pointer"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-sable-card-beige border border-sable-border p-3 text-xs flex items-center gap-2 text-sable-muted">
                  <div className="w-2 h-2 bg-sable-brown rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-sable-brown rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-sable-brown rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-sable-brown ml-1">
                    Analyzing silhouette & consulting catalog...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Consultation Chips */}
          <div className="px-4 py-2 bg-sable-beige/60 border-t border-sable-border overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleConsultation(prompt)}
                disabled={loading}
                className="font-mono text-[10px] uppercase tracking-btn text-sable-black bg-sable-white hover:bg-sable-card-beige px-2.5 py-1 border border-sable-border transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputMessage.trim() && !loading) {
                handleConsultation();
              }
            }}
            className="p-3 sm:p-4 bg-sable-white border-t border-sable-border flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask stylist about drape, lapels, shirt cuts, or color..."
              disabled={loading}
              className="flex-1 bg-sable-card-beige border border-sable-border px-3.5 py-2.5 text-xs sm:text-sm text-sable-black placeholder:text-sable-muted focus:outline-none focus:border-sable-black transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              aria-label="Send consultation message"
              className="bg-sable-black text-sable-white p-2.5 sm:px-4 sm:py-2.5 font-mono text-xs uppercase tracking-btn hover:bg-sable-brown transition-colors disabled:opacity-40 disabled:hover:bg-sable-black cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">Advise</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
