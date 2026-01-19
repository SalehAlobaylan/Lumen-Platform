'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type FeedType = 'foryou' | 'news';

interface FeedSwitcherProps {
    value: FeedType;
    onChange: (value: FeedType) => void;
    variant?: 'dark' | 'light';
}

export function FeedSwitcher({ value, onChange, variant = 'dark' }: FeedSwitcherProps) {
    const isDark = variant === 'dark';

    return (
        <div className="flex items-center gap-6 text-sm font-semibold">
            <button
                onClick={() => onChange('foryou')}
                className={cn(
                    'transition-colors pb-1',
                    value === 'foryou'
                        ? isDark
                            ? 'text-white border-b-2 border-white'
                            : 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]'
                        : isDark
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-500 hover:text-[#1a1a1a]'
                )}
            >
                For You
            </button>
            <button
                onClick={() => onChange('news')}
                className={cn(
                    'transition-colors pb-1',
                    value === 'news'
                        ? isDark
                            ? 'text-white border-b-2 border-red-500'
                            : 'text-[#e63946] border-b-2 border-[#e63946]'
                        : isDark
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-500 hover:text-[#1a1a1a]'
                )}
            >
                News
            </button>
        </div>
    );
}
