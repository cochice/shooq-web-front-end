'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubeVideoProps {
    url: string;
    className?: string;
}

/**
 * YouTube 비디오 컴포넌트 (Reddit 스타일)
 * - YouTube URL에서 비디오 ID 추출
 * - 화면에 보이면 iframe src 업데이트하여 자동 재생
 * - Intersection Observer를 사용한 뷰포트 감지
 */
export default function YouTubeVideo({ url, className = '' }: YouTubeVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [shouldAutoplay, setShouldAutoplay] = useState(false);

    // YouTube URL에서 비디오 ID 추출
    useEffect(() => {
        const extractVideoId = (youtubeUrl: string): string | null => {
            try {
                const urlObj = new URL(youtubeUrl);

                // https://www.youtube.com/watch?v=VIDEO_ID 형태
                if (urlObj.hostname.includes('youtube.com')) {
                    return urlObj.searchParams.get('v');
                }

                // https://youtu.be/VIDEO_ID 형태
                if (urlObj.hostname === 'youtu.be') {
                    return urlObj.pathname.slice(1);
                }

                return null;
            } catch (error) {
                console.error('YouTube URL 파싱 실패:', error);
                return null;
            }
        };

        const id = extractVideoId(url);
        setVideoId(id);
    }, [url]);

    // Intersection Observer로 비디오가 화면에 보이는지 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const isVisible = entry.isIntersecting;
                    setIsInView(isVisible);

                    // 처음 화면에 들어올 때 자동재생 활성화
                    if (isVisible && !shouldAutoplay) {
                        setShouldAutoplay(true);
                    }
                });
            },
            {
                threshold: 0.5, // 비디오의 50% 이상이 보일 때
                rootMargin: '0px',
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [shouldAutoplay]);

    // 비디오 ID가 없으면 에러 UI 표시
    if (!videoId) {
        return (
            <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
                <div className="aspect-video flex items-center justify-center">
                    <div className="text-center p-4">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">잘못된 YouTube URL입니다</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600 mt-2 inline-block"
                        >
                            원본 링크에서 보기 →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // YouTube embed URL 생성 (autoplay는 화면에 보일 때만)
    const embedUrl = `https://www.youtube.com/embed/${videoId}?mute=1&autoplay=${shouldAutoplay ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`;

    return (
        <div ref={containerRef} className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
            <div className="aspect-video">
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                />
            </div>

            {/* 재생 중 표시 */}
            {isInView && shouldAutoplay && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">
                    재생 중
                </div>
            )}
        </div>
    );
}
