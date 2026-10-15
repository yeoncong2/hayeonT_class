import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            className="card bg-butter px-5 py-3 font-jua text-base"
            initial={{ y: 40, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 40, opacity: 0 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
