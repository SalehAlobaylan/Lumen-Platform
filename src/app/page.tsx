'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useForYouFeed, useNewsFeed, useLikeMutation, useBookmarkMutation } from '@/lib/hooks';
import { useFeedStore } from '@/lib/stores';
import { FeedContainer, ForYouCard, NewsSlide } from '@/components/feed';
import { FeedSwitcher } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentItem } from '@/types';

// Mock data for development (until CMS is ready)
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
];

const MOCK_NEWS_SLIDES = [
  {
    slide_id: 's1',
    featured: {
      id: 'f1',
      type: 'ARTICLE' as const,
      title: 'Tech Giants Report Record Quarterly Earnings',
      excerpt: 'Major technology companies have announced their strongest financial results in years, driven by AI investments and cloud services growth.',
      author: 'Tech News Today',
      source_name: 'TechCrunch',
      thumbnail_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      share_count: 0,
    },
    related: [
      {
        id: 'r1',
        type: 'TWEET' as const,
        body_text: 'This earnings report shows the power of AI integration. Companies investing early are seeing massive returns. #TechEarnings',
        author: '@techanalyst',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      },
      {
        id: 'r2',
        type: 'COMMENT' as const,
        body_text: 'As an investor, this validates my thesis that AI-first companies will dominate the next decade.',
        author: 'InvestorPro',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      },
      {
        id: 'r3',
        type: 'ARTICLE' as const,
        title: 'Analysis: What These Earnings Mean for 2026',
        author: 'Market Watch',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      },
    ],
  },
];

type FeedType = 'foryou' | 'news';

export default function HomePage() {
  const [feedType, setFeedType] = useState<FeedType>('foryou');
  const feedRef = useRef<HTMLDivElement>(null);
  const { activeIndex, setActiveIndex, resetProgress } = useFeedStore();

  // const { data: forYouData, isLoading: forYouLoading, fetchNextPage: fetchMoreForYou } = useForYouFeed();
  // const { data: newsData, isLoading: newsLoading, fetchNextPage: fetchMoreNews } = useNewsFeed();

  const likeMutation = useLikeMutation();
  const bookmarkMutation = useBookmarkMutation();

  // Use mock data for now
  const forYouItems = MOCK_FORYOU_ITEMS;
  const newsSlides = MOCK_NEWS_SLIDES;

  // Handle scroll to detect active item
  const handleScroll = useCallback(() => {
    if (feedRef.current) {
      const scrollPosition = feedRef.current.scrollTop;
      const height = feedRef.current.clientHeight;
      const newIndex = Math.round(scrollPosition / height);

      if (activeIndex !== newIndex) {
        setActiveIndex(newIndex);
        resetProgress();
      }
    }
  }, [activeIndex, setActiveIndex, resetProgress]);

  // Reset scroll when changing feed types
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
      setActiveIndex(0);
      resetProgress();
    }
  }, [feedType, setActiveIndex, resetProgress]);

  const handleLike = (itemId: string, isLiked: boolean) => {
    likeMutation.mutate({ contentId: itemId, isLiked });
  };

  const handleBookmark = (itemId: string, isBookmarked: boolean) => {
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
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleOpenArticle = (item: ContentItem) => {
    // TODO: Open article modal or navigate to article page
    console.log('Open article:', item);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Header with feed switcher */}
      <header className={`absolute top-0 left-0 right-0 z-20 pointer-events-none ${feedType === 'foryou'
          ? 'bg-gradient-to-b from-black/80 to-transparent'
          : 'bg-transparent'
        }`}>
        <div className="flex justify-between items-center p-4 pt-12">
          <div className="pointer-events-auto">
            <span className="text-xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              LUMEN
            </span>
          </div>

          <div className="pointer-events-auto">
            <FeedSwitcher
              value={feedType}
              onChange={setFeedType}
              variant={feedType === 'foryou' ? 'dark' : 'light'}
            />
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Feed content */}
      <FeedContainer ref={feedRef} onScroll={handleScroll}>
        {feedType === 'foryou' ? (
          // For You Feed
          forYouItems.map((item, index) => (
            <div key={item.id} className="h-screen w-full">
              <ForYouCard
                item={item}
                isActive={index === activeIndex}
                onLike={() => handleLike(item.id, false)}
                onBookmark={() => handleBookmark(item.id, false)}
                onShare={() => handleShare(item)}
              />
            </div>
          ))
        ) : (
          // News Feed
          newsSlides.map((slide, index) => (
            <div key={slide.slide_id} className="h-screen w-full">
              <NewsSlide
                slide={slide}
                isActive={index === activeIndex}
                onOpenArticle={handleOpenArticle}
              />
            </div>
          ))
        )}
      </FeedContainer>
    </div>
  );
}
