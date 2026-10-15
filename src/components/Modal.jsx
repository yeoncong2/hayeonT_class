import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, headerColor = 'bg-butter', icon, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl border-2 border-ink bg-cream shadow-pop-lg`}
            initial={{ y: 60, scale: 0.92, rotate: -2 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: 40, scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between gap-3 border-b-2 border-ink ${headerColor} px-4 py-3`}>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-pink-deep" />
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-butter-deep" />
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-mint-deep" />
                </div>
                {icon && <span className="text-xl leading-none">{icon}</span>}
                <h3 className="truncate text-lg sm:text-xl">{title}</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white shadow-pop-sm transition-all hover:translate-y-[2px] hover:shadow-none"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
