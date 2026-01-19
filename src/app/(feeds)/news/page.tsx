'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useNewsFeed } from '@/lib/hooks';
import { useFeedStore } from '@/lib/stores';
import { FeedContainer, NewsSlide, NewsSlideSkeleton, ViewTracker } from '@/components/feed';
import { FeedSwitcher } from '@/components/layout';
import { FeedErrorFallback } from '@/components/error-boundary';
import type { ContentItem, NewsSlide as NewsSlideType } from '@/types';

// Mock data for development (controlled by env var)
const MOCK_NEWS_SLIDES: NewsSlideType[] = [
    {
        slide_id: 's1',
        featured: {
            id: 'f1',
            type: 'ARTICLE',
            title: 'Tech Giants Report Record Quarterly Earnings',
            excerpt: 'Major technology companies have announced their strongest financial results in years, driven by AI investments and cloud services growth.',
            author: 'Tech News Today',
            source_name: 'TechCrunch',
            thumbnail_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            like_count: 234,
            comment_count: 89,
            share_count: 45,
        },
        related: [
            {
                id: 'r1',
                type: 'TWEET',
                body_text: 'This earnings report shows the power of AI integration. Companies investing early are seeing massive returns. #TechEarnings',
                author: '@techanalyst',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 1234,
                comment_count: 56,
                share_count: 23,
            },
            {
                id: 'r2',
                type: 'COMMENT',
                body_text: 'As an investor, this validates my thesis that AI-first companies will dominate the next decade.',
                author: 'InvestorPro',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 89,
                comment_count: 12,
                share_count: 5,
            },
            {
                id: 'r3',
                type: 'ARTICLE',
                title: 'Analysis: What These Earnings Mean for 2026',
                author: 'Market Watch',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 156,
                comment_count: 34,
                share_count: 18,
            },
        ],
    },
    {
        slide_id: 's2',
        featured: {
            id: 'f2',
            type: 'ARTICLE',
            title: 'Climate Summit Reaches Historic Agreement',
            excerpt: 'World leaders have agreed on unprecedented measures to combat climate change, including new carbon emission targets for 2035.',
            author: 'Global News',
            source_name: 'Reuters',
            thumbnail_url: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            like_count: 567,
            comment_count: 123,
            share_count: 89,
        },
        related: [
            {
                id: 'r4',
                type: 'TWEET',
                body_text: 'Finally, some real action on climate. This agreement could be a turning point for our planet. 🌍',
                author: '@climatescientist',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 2345,
                comment_count: 178,
                share_count: 456,
            },
            {
                id: 'r5',
                type: 'ARTICLE',
                title: 'What the New Climate Targets Mean for Your Daily Life',
                author: 'Environmental Weekly',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 234,
                comment_count: 67,
                share_count: 34,
            },
            {
                id: 'r6',
                type: 'COMMENT',
                body_text: 'Skeptical until I see implementation. We\'ve heard promises before.',
                author: 'RealityCheck',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 45,
                comment_count: 12,
                share_count: 3,
            },
        ],
    },
    {
        slide_id: 's3',
        featured: {
            id: 'f3',
            type: 'ARTICLE',
            title: 'Breakthrough in Quantum Computing Shocks Industry',
            excerpt: 'Researchers have achieved quantum supremacy with a new chip that solves problems impossible for classical computers.',
            author: 'Science Today',
            source_name: 'Nature',
            thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            like_count: 892,
            comment_count: 234,
            share_count: 156,
        },
        related: [
            {
                id: 'r7',
                type: 'TWEET',
                body_text: 'This quantum breakthrough changes everything. Cryptography, drug discovery, AI - all will be revolutionized.',
                author: '@quantumphysicist',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 3456,
                comment_count: 234,
                share_count: 567,
            },
            {
                id: 'r8',
                type: 'COMMENT',
                body_text: 'ELI5: This means computers can now solve certain puzzles exponentially faster than before.',
                author: 'ScienceSimplified',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 567,
                comment_count: 45,
                share_count: 23,
            },
            {
                id: 'r9',
                type: 'ARTICLE',
                title: 'The Race to Quantum Supremacy: A Timeline',
                author: 'Tech History',
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                like_count: 123,
                comment_count: 34,
                share_count: 12,
            },
        ],
    },
];

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export default function NewsPage() {
    const feedRef = useRef<HTMLDivElement>(null);
    const { activeIndex, setActiveIndex, resetProgress } = useFeedStore();

    // API hooks
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useNewsFeed();

    // Combine all pages of data, or use mock data
    const newsSlides = useMemo(() => {
        if (USE_MOCK_DATA) {
            return MOCK_NEWS_SLIDES;
        }
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.slides);
    }, [data]);

    // Handle scroll to detect active item and load more
    const handleScroll = useCallback(() => {
        if (feedRef.current) {
            const scrollPosition = feedRef.current.scrollTop;
            const height = feedRef.current.clientHeight;
            const scrollHeight = feedRef.current.scrollHeight;
            const newIndex = Math.round(scrollPosition / height);

            if (activeIndex !== newIndex) {
                setActiveIndex(newIndex);
                resetProgress();
            }

            // Load more when near bottom (infinite scroll)
            if (
                !USE_MOCK_DATA &&
                hasNextPage &&
                !isFetchingNextPage &&
                scrollPosition + height >= scrollHeight - height * 2
            ) {
                fetchNextPage();
            }
        }
    }, [activeIndex, setActiveIndex, resetProgress, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Reset scroll on mount
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
            setActiveIndex(0);
            resetProgress();
        }
    }, [setActiveIndex, resetProgress]);

    const handleOpenArticle = (item: ContentItem) => {
        // TODO: Open article modal or navigate to article page
        console.log('Open article:', item);
    };

    // Show loading state
    const showLoading = isLoading && !USE_MOCK_DATA;

    // Show error state
    if (isError && !USE_MOCK_DATA) {
        return (
            <div className="h-full w-full bg-[#f8f5f2]">
                <FeedErrorFallback
                    onRetry={() => refetch()}
                    message={error?.message || 'Failed to load news feed'}
                />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden relative">
            {/* Header with feed switcher */}
            <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                <div className="flex justify-between items-center p-4 pt-6">
                    <div className="pointer-events-auto">
                        <span className="text-xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            LUMEN
                        </span>
                    </div>

                    <div className="pointer-events-auto">
                        <FeedSwitcher variant="light" />
                    </div>

                    <div className="w-16" /> {/* Spacer for balance */}
                </div>
            </header>

            {/* Feed content */}
            <FeedContainer ref={feedRef} onScroll={handleScroll}>
                {showLoading ? (
                    // Loading skeletons
                    <>
                        <NewsSlideSkeleton />
                        <NewsSlideSkeleton />
                    </>
                ) : (
                    // News Feed slides with view tracking
                    newsSlides.map((slide, index) => (
                        <ViewTracker key={slide.slide_id} contentId={slide.featured.id} className="h-full w-full snap-start">
                            <NewsSlide
                                slide={slide}
                                isActive={index === activeIndex}
                                onOpenArticle={handleOpenArticle}
                            />
                        </ViewTracker>
                    ))
                )}

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                    <div className="h-20 flex items-center justify-center bg-[#f8f5f2]">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                )}
            </FeedContainer>
        </div>
    );
}
