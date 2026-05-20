import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  delay = 0,
   onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel rounded-2xl p-6 ${
        hoverEffect ? 'hover:bg-white/[0.04] hover:border-brand-500/30 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
