
import { render, screen, fireEvent } from '@testing-library/react';
import { ForYouCard } from '@/components/feed/for-you-card';
import { ContentItem } from '@/types';

// Mock interaction handlers
const mockOnLike = jest.fn();
const mockOnBookmark = jest.fn();
const mockOnShare = jest.fn();

const mockItem: ContentItem = {
    id: 'test-1',
    type: 'VIDEO',
    title: 'Test Video Title',
    author: 'Test Author',
    source_name: 'Test Source',
    media_url: 'http://example.com/video.mp4',
    thumbnail_url: 'http://example.com/thumb.jpg',
    duration_sec: 120,
    like_count: 10,
    comment_count: 5,
    share_count: 2,
    published_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    is_liked: false,
    is_bookmarked: false,
};

describe('ForYouCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders content correctly', () => {
        render(
            <ForYouCard
                item={mockItem}
                isActive={true}
                onLike={mockOnLike}
                onBookmark={mockOnBookmark}
                onShare={mockOnShare}
            />
        );

        expect(screen.getByText('Test Video Title')).toBeInTheDocument();
        expect(screen.getByText('Test Source')).toBeInTheDocument();
    });

    it('calls onLike when like button is clicked', () => {
        render(
            <ForYouCard
                item={mockItem}
                isActive={true}
                onLike={mockOnLike}
                onBookmark={mockOnBookmark}
                onShare={mockOnShare}
            />
        );

        const likeButton = screen.getByLabelText(/like/i);
        fireEvent.click(likeButton);
        expect(mockOnLike).toHaveBeenCalledTimes(1);
    });

    it('calls onBookmark when bookmark button is clicked', () => {
        render(
            <ForYouCard
                item={mockItem}
                isActive={true}
                onLike={mockOnLike}
                onBookmark={mockOnBookmark}
                onShare={mockOnShare}
            />
        );

        const bookmarkButton = screen.getByLabelText(/bookmark/i);
        fireEvent.click(bookmarkButton);
        expect(mockOnBookmark).toHaveBeenCalledTimes(1);
    });
});
