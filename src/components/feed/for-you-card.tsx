'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    Heart,
    Bookmark,
    Share2,
    MessageCircle,
    RotateCcw,
    Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedStore } from '@/lib/stores';
import type { ContentItem } from '@/types';

interface ForYouCardProps {
    item: ContentItem;
    isActive: boolean;
    onLike: () => void;
    onBookmark: () => void;
    onShare: () => void;
}

/**
 * Full-screen video/audio card for For You feed
 */
export function ForYouCard({
    item,
    isActive,
    onLike,
    onBookmark,
    onShare
}: ForYouCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isPlaying, setPlaying, togglePlay, progress, setProgress, playbackSpeed, likedIds, bookmarkedIds } = useFeedStore();

    const isLiked = likedIds.has(item.id);
    const isBookmarked = bookmarkedIds.has(item.id);

    // Handle autoplay based on active state
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            videoRef.current.play().catch(() => {
                // Autoplay blocked - show play button
                setPlaying(false);
            });
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    }, [isActive, setPlaying]);

    // Handle playback speed
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    // Handle play/pause
    useEffect(() => {
        if (!videoRef.current || !isActive) return;

        if (isPlaying) {
            videoRef.current.play().catch(() => setPlaying(false));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, isActive, setPlaying]);

    const handleRewind = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 15);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(percent);
        }
    };

    return (
        <div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-black">
            {/* Background/Video */}
            {item.media_url ? (
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={item.media_url}
                    poster={item.thumbnail_url}
                    loop
                    muted={false}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                />
            ) : (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${item.thumbnail_url})` }}
                />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

            {/* Content info */}
            <div className="absolute bottom-20 left-0 right-16 p-4 space-y-3">
                {/* Type badge */}
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600/90 text-white backdrop-blur-md flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {item.type === 'PODCAST' ? 'Podcast' : 'Audio'}
                    </span>
                    {item.source_name && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-white/30 text-white/90 backdrop-blur-sm">
                            {item.source_name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                    {item.title}
                </h2>

                {/* Author */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs overflow-hidden border border-white/20">
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.author}`}
                            alt={item.author || 'Author'}
                            className="w-full h-full"
                        />
                    </div>
                    <span className="text-sm text-gray-200 font-medium">{item.author}</span>
                </div>

                {/* Duration */}
                {item.duration_sec && (
                    <span className="text-xs text-gray-400">
                        {Math.floor(item.duration_sec / 60)}:{(item.duration_sec % 60).toString().padStart(2, '0')}
                    </span>
                )}
            </div>

            {/* Action buttons (right side) */}
            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
                {/* Like */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLike();
                    }}
                    className="flex flex-col items-center gap-1"
                    aria-label="Like"
                >
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                        isLiked ? "bg-red-500" : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    )}>
                        <Heart className={cn("w-6 h-6", isLiked ? "text-white fill-white" : "text-white")} />
                    </div>
                    <span className="text-xs text-white font-medium">{item.like_count}</span>
                </button>

                {/* Comment */}
                <button
                    className="flex flex-col items-center gap-1"
                    aria-label="Comment"
                >
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-white font-medium">{item.comment_count}</span>
                </button>

                {/* Bookmark */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark();
                    }}
                    className="flex flex-col items-center gap-1"
                    aria-label="Bookmark"
                >
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                        isBookmarked ? "bg-yellow-500" : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    )}>
                        <Bookmark className={cn("w-6 h-6", isBookmarked ? "text-white fill-white" : "text-white")} />
                    </div>
                </button>

                {/* Share */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onShare();
                    }}
                    className="flex flex-col items-center gap-1"
                    aria-label="Share"
                >
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                </button>

                {/* Rewind */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRewind();
                    }}
                    className="flex flex-col items-center gap-1"
                    aria-label="Rewind"
                >
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                        <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] text-white/70">15s</span>
                </button>
            </div>

            {/* Play/Pause overlay */}
            {isActive && !isPlaying && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10"
                >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
                        <Play className="w-10 h-10 text-white ml-1 fill-white" />
                    </div>
                </motion.div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
