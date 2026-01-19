'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTrackingMutation } from '@/lib/hooks';

interface UseViewTrackingOptions {
    contentId: string;
    threshold?: number;
    trackOnce?: boolean;
}

/**
 * Hook to track when a content item enters the viewport
 */
export function useViewTracking({
    contentId,
    threshold = 0.5,
    trackOnce = true,
}: UseViewTrackingOptions) {
    const hasTracked = useRef(false);
    const ref = useRef<HTMLDivElement>(null);
    const trackMutation = useTrackingMutation();

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && (!trackOnce || !hasTracked.current)) {
                    hasTracked.current = true;
                    trackMutation.mutate({
                        contentId,
                        type: 'view',
                        metadata: {
                            viewedAt: new Date().toISOString(),
                            intersectionRatio: entry.intersectionRatio,
                        },
                    });
                }
            });
        },
        [contentId, trackOnce, trackMutation]
    );

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleIntersection, {
            threshold,
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [handleIntersection, threshold]);

    return ref;
}

interface ViewTrackerProps {
    contentId: string;
    children: React.ReactNode;
    className?: string;
    threshold?: number;
}

/**
 * Component wrapper that tracks when content enters viewport
 */
export function ViewTracker({
    contentId,
    children,
    className,
    threshold = 0.5,
}: ViewTrackerProps) {
    const ref = useViewTracking({ contentId, threshold });

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
