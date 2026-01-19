'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchForYouFeed,
  fetchNewsFeed,
  fetchBookmarks,
  recordInteraction,
  removeInteraction,
} from '@/lib/api';
import { useFeedStore } from '@/lib/stores';
import type { Interaction } from '@/types';

/**
 * Hook for infinite scrolling For You feed
 */
export function useForYouFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'foryou'],
    queryFn: ({ pageParam }) => fetchForYouFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for infinite scrolling News feed
 */
export function useNewsFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'news'],
    queryFn: ({ pageParam }) => fetchNewsFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for fetching bookmarked items
 */
export function useBookmarks() {
  return useInfiniteQuery({
    queryKey: ['bookmarks'],
    queryFn: ({ pageParam }) => fetchBookmarks(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for liking/unliking content with optimistic updates
 */
export function useLikeMutation() {
  const queryClient = useQueryClient();
  const { toggleLike, likedIds } = useFeedStore();
  
  return useMutation({
    mutationFn: async ({ contentId, isLiked }: { contentId: string; isLiked: boolean }) => {
      if (isLiked) {
        await removeInteraction(contentId, 'like');
      } else {
        await recordInteraction(contentId, 'like');
      }
    },
    onMutate: async ({ contentId }) => {
      // Optimistic update
      toggleLike(contentId);
    },
    onError: (_, { contentId }) => {
      // Rollback on error
      toggleLike(contentId);
    },
    onSettled: () => {
      // Invalidate feeds to refresh counts
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Hook for bookmarking/unbookmarking content with optimistic updates
 */
export function useBookmarkMutation() {
  const queryClient = useQueryClient();
  const { toggleBookmark, bookmarkedIds } = useFeedStore();
  
  return useMutation({
    mutationFn: async ({ contentId, isBookmarked }: { contentId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        await removeInteraction(contentId, 'bookmark');
      } else {
        await recordInteraction(contentId, 'bookmark');
      }
    },
    onMutate: async ({ contentId }) => {
      // Optimistic update
      toggleBookmark(contentId);
    },
    onError: (_, { contentId }) => {
      // Rollback on error
      toggleBookmark(contentId);
    },
    onSettled: () => {
      // Invalidate bookmarks query
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * Hook for recording view/complete events (fire-and-forget)
 */
export function useTrackingMutation() {
  return useMutation({
    mutationFn: async ({
      contentId,
      type,
      metadata,
    }: {
      contentId: string;
      type: Extract<Interaction['interaction_type'], 'view' | 'complete'>;
      metadata?: Record<string, unknown>;
    }) => {
      await recordInteraction(contentId, type, metadata);
    },
  });
}
