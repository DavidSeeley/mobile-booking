import React, { memo } from 'react';

/**
 * =========================================================================
 * DetailCard Component - Section Card with Hover Shadow
 * =========================================================================
 *
 * A reusable card wrapper for detail page sections (Contact, Address, etc.)
 * 
 * Part of Step 6 optimization (Performance Optimization)
 * v1.12.500 - Memoized with React.memo to prevent unnecessary re-renders
 * 
 * Features:
 * - Consistent card styling across all detail pages via .detail-card CSS class
 * - Large shadow on hover with smooth transition (matches grid-card styling)
 * - All styling managed through /src/styles/index.css
 * - Flexible content via children prop
 * - Optional custom inline styles and className for overrides
 */

export interface DetailCardProps {
  /** Card content (form fields, text, etc.) */
  children: React.ReactNode;
  /** Optional inline styles to override defaults */
  style?: React.CSSProperties;
  /** Optional className for additional styling */
  className?: string;
}

export const DetailCard = memo(function DetailCard({ children, style, className }: DetailCardProps) {
  return (
    <div
      className={`detail-card ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
});