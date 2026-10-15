import { motion } from 'framer-motion';

export default function SectionTitle({ no, tag, tone = 'bg-pink', title, desc, children }) {
  return (
    <motion.div
      className="mb-8 flex flex-col items-start gap-3 sm:mb-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <span className={`chip -rotate-2 ${tone} px-3 py-1 text-sm shadow-pop-sm`}>
        <span className="font-jua">SECTION {no}</span> · {tag}
      </span>
      <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      {desc && <p className="max-w-2xl text-base text-ink/80 sm:text-lg">{desc}</p>}
      {children}
    </motion.div>
  );
}
