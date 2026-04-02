/**
 * =========================================================================
 * AllowanceModal — Surprise-box popup shown after selecting a Unit Type
 * =========================================================================
 * Displays the moving allowance for the chosen apartment size with a
 * gift-box open animation powered by Motion.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
interface AllowanceModalProps {
  unitName: string;
  allowance: number;
  onClose: () => void;
  onContinue: () => void;
}

// Small confetti particle
function Particle({ x, y, color, delay }: { x: string; y: string; color: string; delay: number }) {
  return (
    <motion.div
      className="allowance-particle"
      style={{
        left: x,
        top: y,
        backgroundColor: color,
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0], rotate: [0, 120, 240, 360], y: [0, -40, -70, -100] }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  );
}

const CONFETTI = [
  { x: '10%', y: '20%', color: '#f59e0b', delay: 0.4 },
  { x: '80%', y: '15%', color: '#3b82f6', delay: 0.5 },
  { x: '50%', y: '10%', color: '#10b981', delay: 0.3 },
  { x: '25%', y: '30%', color: '#ef4444', delay: 0.6 },
  { x: '70%', y: '25%', color: '#8b5cf6', delay: 0.45 },
  { x: '90%', y: '35%', color: '#f97316', delay: 0.35 },
  { x: '15%', y: '40%', color: '#ec4899', delay: 0.55 },
  { x: '60%', y: '18%', color: '#06b6d4', delay: 0.5 },
];

export function AllowanceModal({ unitName, allowance, onClose, onContinue }: AllowanceModalProps) {
  const [lidOpen, setLidOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLidOpen(true), 400);
    const t2 = setTimeout(() => setShowContent(true), 750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const formattedAllowance = allowance.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="allowance-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Card — stop propagation so clicking inside doesn't close */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="allowance-card"
          initial={{ scale: 0.6, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.6, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="allowance-close-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Confetti particles */}
          {CONFETTI.map((p, i) => (
            <Particle key={i} {...p} />
          ))}

          {/* Gift box */}
          <div className="allowance-gift-box">
            {/* Lid */}
            <motion.svg
              width="96"
              height="40"
              viewBox="0 0 96 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="allowance-gift-lid"
              animate={lidOpen ? { y: -72, rotate: -12, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Lid body */}
              <rect x="4" y="14" width="88" height="26" rx="4" fill="#ef4444" />
              {/* Lid ribbon vertical */}
              <rect x="42" y="14" width="12" height="26" fill="#fca5a5" />
              {/* Bow left loop */}
              <ellipse cx="34" cy="10" rx="12" ry="8" fill="#ef4444" />
              {/* Bow right loop */}
              <ellipse cx="62" cy="10" rx="12" ry="8" fill="#ef4444" />
              {/* Bow center knot */}
              <ellipse cx="48" cy="12" rx="7" ry="6" fill="#dc2626" />
              {/* Bow highlight */}
              <ellipse cx="48" cy="10" rx="3" ry="3" fill="#fca5a5" />
            </motion.svg>

            {/* Box body */}
            <svg
              width="96"
              height="72"
              viewBox="0 0 96 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="allowance-gift-base"
            >
              <rect x="4" y="0" width="88" height="72" rx="6" fill="#fbbf24" />
              {/* Ribbon vertical */}
              <rect x="42" y="0" width="12" height="72" fill="#f59e0b" />
              {/* Ribbon horizontal */}
              <rect x="4" y="28" width="88" height="12" fill="#f59e0b" />
              {/* Shine */}
              <rect x="12" y="8" width="6" height="20" rx="3" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>

          {/* Heading */}
          <motion.p
            className="allowance-heading"
            initial={{ opacity: 0, y: 8 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
          >
            Your <strong className="allowance-heading-strong">{unitName}</strong> moving allowance
          </motion.p>

          {/* Amount */}
          <motion.div
            className="allowance-amount"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.08 }}
          >
            <span className="allowance-amount-text">{formattedAllowance}</span>
          </motion.div>

          <motion.p
            className="allowance-description"
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            applied toward your move 🎉
          </motion.p>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={onContinue}
            className="allowance-continue-btn w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Awesome, let's go!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}