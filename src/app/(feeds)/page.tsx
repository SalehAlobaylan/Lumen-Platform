'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useForYouFeed, useLikeMutation, useBookmarkMutation } from '@/lib/hooks';
import { useFeedStore } from '@/lib/stores';
import { FeedContainer, ForYouCard, ForYouSkeleton, ViewTracker } from '@/components/feed';
import { FeedSwitcher } from '@/components/layout';
import { FeedErrorFallback } from '@/components/error-boundary';
import type { ContentItem } from '@/types';

// Mock data for development (controlled by env var)
const MOCK_FORYOU_ITEMS: ContentItem[] = [
    {
        id: '1',
        type: 'VIDEO',
        title: 'The Future of AI in Creative Industries',
        author: 'Radio Thamanyah',
        source_name: 'Thamanyah Podcast',
        media_url: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        duration_sec: 180,
        like_count: 1234,
        comment_count: 89,
        share_count: 45,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        type: 'PODCAST',
        title: 'How to Build a Successful Startup in 2026',
        author: 'Tech Talks',
        source_name: 'iTunes Podcast',
        media_url: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        duration_sec: 320,
        like_count: 2456,
        comment_count: 156,
        share_count: 89,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    },
    {
        id: '3',
        type: 'VIDEO',
        title: 'Understanding Quantum Computing',
        author: 'Science Daily',
        source_name: 'YouTube',
        media_url: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        duration_sec: 240,
        like_count: 5678,
        comment_count: 234,
        share_count: 167,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    },
    {
        id: '4',
        type: 'PODCAST',
        title: 'The Psychology of Decision Making',
        author: 'Mind Matters',
        source_name: 'Spotify',
        media_url: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        duration_sec: 420,
        like_count: 3421,
        comment_count: 198,
        share_count: 112,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    },
];

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export default function ForYouPage() {
    const feedRef = useRef<HTMLDivElement>(null);
    const { activeIndex, setActiveIndex, resetProgress, likedIds, bookmarkedIds } = useFeedStore();

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
    } = useForYouFeed();

    const likeMutation = useLikeMutation();
    const bookmarkMutation = useBookmarkMutation();

    // Combine all pages of data, or use mock data
    const forYouItems = useMemo(() => {
        if (USE_MOCK_DATA) {
            return MOCK_FORYOU_ITEMS;
        }
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.items);
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

    const handleLike = (itemId: string) => {
        const isLiked = likedIds.has(itemId);
        likeMutation.mutate({ contentId: itemId, isLiked });
    };

    const handleBookmark = (itemId: string) => {
        const isBookmarked = bookmarkedIds.has(itemId);
        bookmarkMutation.mutate({ contentId: itemId, isBookmarked });
    };

    const handleShare = async (item: ContentItem) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.excerpt || item.body_text,
                    url: window.location.href,
                });
            } catch {
                // User cancelled or error
            }
        } else {
            // Fallback: copy link
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Show loading state
    const showLoading = isLoading && !USE_MOCK_DATA;

    // Show error state
    if (isError && !USE_MOCK_DATA) {
        return (
            <div className="h-full w-full bg-black">
                <FeedErrorFallback
                    onRetry={() => refetch()}
                    message={error?.message || 'Failed to load feed'}
                />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden relative">
            {/* Header with feed switcher */}
            <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex justify-between items-center p-4 pt-6">
                    <div className="pointer-events-auto">
                        <span className="text-xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            LUMEN
                        </span>
                    </div>

                    <div className="pointer-events-auto">
                        <FeedSwitcher variant="dark" />
                    </div>

                    <div className="w-16" /> {/* Spacer for balance */}
                </div>
            </header>

            {/* Feed content */}
            <FeedContainer ref={feedRef} onScroll={handleScroll}>
                {showLoading ? (
                    // Loading skeletons
                    <>
                        <ForYouSkeleton />
                        <ForYouSkeleton />
                    </>
                ) : (
                    // For You Feed items with view tracking
                    forYouItems.map((item, index) => (
                        <ViewTracker key={item.id} contentId={item.id} className="h-full w-full snap-start">
                            <ForYouCard
                                item={item}
                                isActive={index === activeIndex}
                                onLike={() => handleLike(item.id)}
                                onBookmark={() => handleBookmark(item.id)}
                                onShare={() => handleShare(item)}
                            />
                        </ViewTracker>
                    ))
                )}

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                    <div className="h-20 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </FeedContainer>
        </div>
    );
}
