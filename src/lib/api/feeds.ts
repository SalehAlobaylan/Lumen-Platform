import type { ForYouResponse, NewsResponse, ContentItem, Interaction } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Fetch For You feed items
 */
export async function fetchForYouFeed(cursor?: string | null): Promise<ForYouResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '20');
  
  const response = await fetch(`${API_BASE}/feed/foryou?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch For You feed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch News feed slides
 */
export async function fetchNewsFeed(cursor?: string | null): Promise<NewsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '10');
  
  const response = await fetch(`${API_BASE}/feed/news?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch News feed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch single content item by ID
 */
export async function fetchContentItem(id: string): Promise<ContentItem> {
  const response = await fetch(`${API_BASE}/content/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch content item: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Record user interaction (like, bookmark, share, view, complete)
 */
export async function recordInteraction(
  contentItemId: string,
  interactionType: Interaction['interaction_type'],
  metadata?: Record<string, unknown>
): Promise<Interaction> {
  const response = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_item_id: contentItemId,
      interaction_type: interactionType,
      metadata,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to record interaction: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Remove an interaction (unlike, unbookmark)
 */
export async function removeInteraction(
  contentItemId: string,
  interactionType: Interaction['interaction_type']
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/interactions?content_item_id=${contentItemId}&type=${interactionType}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to remove interaction: ${response.statusText}`);
  }
}

/**
 * Fetch user's bookmarked items
 */
export async function fetchBookmarks(cursor?: string): Promise<ForYouResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '20');
  
  const response = await fetch(`${API_BASE}/interactions/bookmarks?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data;
}
