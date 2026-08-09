'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  clickable?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, clickable = true, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
  };

  const logoIcon = (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25 ${iconSizes[size]} shrink-0`}>
      {/* Modern SVG Neural Sync Vortex Logo */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3/4 w-3/4 text-white drop-shadow-xs"
      >
        {/* Left Sync Curve */}
        <path
          d="M 12 7 C 6 10, 4 18, 9 24 C 11 26, 14 28, 17 28.5"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        {/* Left Arrow Head */}
        <path
          d="M 11 4.5 L 12.5 7.5 L 9 8.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Sync Curve */}
        <path
          d="M 24 29 C 30 26, 32 18, 27 12 C 25 10, 22 8, 19 7.5"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        {/* Right Arrow Head */}
        <path
          d="M 25 31.5 L 23.5 28.5 L 27 27.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI Neural Central Sparkle Core */}
        <circle cx="18" cy="18" r="3.25" fill="currentColor" />
        <circle cx="18" cy="18" r="1.5" fill="#C7D2FE" />
      </svg>
    </div>
  );

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {logoIcon}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`tracking-tight text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${textSizes[size]}`}>
              Hire<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
            </span>
            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              AI
            </span>
          </div>
          {size === 'lg' && (
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase mt-1">
              Autonomous Talent Pipeline
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href={ROUTES.HOME} className="inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
