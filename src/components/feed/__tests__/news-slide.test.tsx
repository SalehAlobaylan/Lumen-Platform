
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsSlide } from '@/components/feed/news-slide';
import { NewsSlide as NewsSlideType } from '@/types';

// Mock interaction handlers
const mockOnOpenArticle = jest.fn();

const mockSlide: NewsSlideType = {
    slide_id: 'slide-1',
    featured: {
        id: 'feat-1',
        type: 'ARTICLE',
        title: 'Featured Article Title',
        excerpt: 'Detailed excerpt of the featured article.',
        author: 'Main Author',
        source_name: 'Main Source',
        thumbnail_url: 'http://example.com/feat.jpg',
        published_at: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        like_count: 100,
        comment_count: 50,
        share_count: 20,
        status: 'READY'
    },
    related: [
        {
            id: 'rel-1',
            type: 'TWEET',
            body_text: 'Related Tweet Body',
            author: '@user1',
            published_at: '2026-01-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            like_count: 10,
            comment_count: 5,
            share_count: 2,
            status: 'READY'
        },
        {
            id: 'rel-2',
            type: 'COMMENT',
            body_text: 'Related Comment Body',
            author: 'User Two',
            published_at: '2026-01-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            like_count: 5,
            comment_count: 1,
            share_count: 0,
            status: 'READY'
        },
        {
            id: 'rel-3',
            type: 'ARTICLE',
            title: 'Related Article Title',
            author: 'Author Three',
            published_at: '2026-01-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            like_count: 15,
            comment_count: 3,
            share_count: 1,
            status: 'READY'
        }
    ]
};

describe('NewsSlide', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders featured article correctly', () => {
        render(
            <NewsSlide
                slide={mockSlide}
                isActive={true}
                onOpenArticle={mockOnOpenArticle}
            />
        );

        expect(screen.getByText('Featured Article Title')).toBeInTheDocument();
        expect(screen.getByText('Detailed excerpt of the featured article.')).toBeInTheDocument();
        // Expect author as that is what is rendered
        expect(screen.getByText(/Main Author/)).toBeInTheDocument();
    });

    it('renders related items correctly', () => {
        render(
            <NewsSlide
                slide={mockSlide}
                isActive={true}
                onOpenArticle={mockOnOpenArticle}
            />
        );

        expect(screen.getByText('Related Tweet Body')).toBeInTheDocument();
        expect(screen.getByText('Related Comment Body')).toBeInTheDocument();
        expect(screen.getByText('Related Article Title')).toBeInTheDocument();
    });

    it('calls onOpenArticle when clicking featured item', () => {
        render(
            <NewsSlide
                slide={mockSlide}
                isActive={true}
                onOpenArticle={mockOnOpenArticle}
            />
        );

        const featuredTitle = screen.getByText('Featured Article Title');
        fireEvent.click(featuredTitle);

        expect(mockOnOpenArticle).toHaveBeenCalledWith(mockSlide.featured);
    });
});
