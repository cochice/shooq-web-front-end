'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, TrendingCommunity } from '@/lib/api';
import { getSiteLogo } from '@/constants/content';

interface TrendingCommunitiesProps {
  onPostClick?: (postId: string) => void;
}

export default function TrendingCommunities({ onPostClick }: TrendingCommunitiesProps) {
  const router = useRouter();
  const [communities, setCommunities] = useState<TrendingCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchTrendingCommunities = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getTrendingCommunities(6);
        setCommunities(data);
      } catch (err) {
        console.error('Failed to fetch trending communities:', err);
        setError('트렌딩 커뮤니티를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCommunities();
  }, []);

  // 스크롤 가능 여부 체크
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 커뮤니티 데이터 로드 후 스크롤 가능 여부 체크
  useEffect(() => {
    if (!loading && communities.length > 0) {
      checkScrollability();
      // 윈도우 리사이즈 시에도 체크
      window.addEventListener('resize', checkScrollability);
      return () => window.removeEventListener('resize', checkScrollability);
    }
  }, [loading, communities]);

  // 좌우 스크롤 함수
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // 카드 너비 + gap
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || communities.length === 0) {
    return null;
  }

  const handleCommunityClick = (community: TrendingCommunity) => {
    const postId = `${community.site}-${community.best_post_no}`;
    if (onPostClick) {
      onPostClick(postId);
    } else {
      // 기본 동작: 상세 페이지로 이동
      router.push(`/popular?postId=${postId}`);
    }
  };

  return (
    <div className="mb-6">
      <div className="relative group">
        {/* 왼쪽 스크롤 버튼 - PC에서만 표시 */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 오른쪽 스크롤 버튼 - PC에서만 표시 */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
        {communities.map((community, index) => {
          const firstImage = community.optimizedImagesList?.[0];

          // YouTube URL에서 썸네일 추출 (개선된 버전)
          const getYouTubeThumbnail = (url?: string) => {
            if (!url) return null;

            let videoId = null;

            // 다양한 YouTube URL 패턴 시도
            const patterns = [
              /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,           // youtube.com/watch?v=VIDEO_ID
              /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                       // youtu.be/VIDEO_ID
              /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,            // youtube.com/embed/VIDEO_ID
              /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,                // youtube.com/v/VIDEO_ID
              /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,           // youtube.com/shorts/VIDEO_ID
              /[?&]v=([a-zA-Z0-9_-]{11})/,                               // any URL with ?v= or &v=
            ];

            for (const pattern of patterns) {
              const match = url.match(pattern);
              if (match && match[1]) {
                videoId = match[1];
                break;
              }
            }

            if (videoId) {
              // mqdefault는 중간 품질 (320x180), 항상 존재
              return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }

            return null;
          };

          // 이미지 URL 결정
          let imageUrl = firstImage?.cloudinary_url;

          // firstImageUrl이 YouTube URL인 경우 썸네일로 변환
          if (imageUrl && (imageUrl.includes('youtube.com') || imageUrl.includes('youtu.be'))) {
            const thumbnailUrl = getYouTubeThumbnail(imageUrl);
            if (thumbnailUrl) {
              imageUrl = thumbnailUrl;
            }
          }

          // optimizedImagesList에 없으면 best_post_url에서 YouTube 썸네일 추출 시도
          if (!imageUrl && community.best_post_url) {
            imageUrl = getYouTubeThumbnail(community.best_post_url) || undefined;
          }

          const isYouTube = community.site === 'YouTube';

          return (
            <div
              key={`${community.site}-${index}`}
              onClick={() => handleCommunityClick(community)}
              className="flex-none w-[280px] sm:w-[320px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all duration-200 group snap-start"
            >
              {/* 배경 이미지와 텍스트 오버레이 */}
              <div className="relative w-full h-[160px] sm:h-[180px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                {/* 배경 이미지 */}
                {imageUrl && (
                  <>
                    <img
                      src={imageUrl}
                      alt={community.best_post_title || community.site}
                      className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {/* 어두운 그라디언트 오버레이 (텍스트 가독성을 위해) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </>
                )}

                {/* YouTube 플레이 버튼 */}
                {isYouTube && (
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 텍스트 오버레이 (하단) */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {/* 제목 */}
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 leading-tight drop-shadow-lg">
                    {community.best_post_title || '제목 없음'}
                  </h3>

                  {/* 커뮤니티명 */}
                  <div className="flex items-center">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: getSiteLogo(community.site).bgColor,
                        color: getSiteLogo(community.site).textColor
                      }}
                    >
                      {getSiteLogo(community.site).letter}
                    </div>
                    <span className="text-white/90 text-xs font-medium truncate drop-shadow">
                      {community.site}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 스크롤바 숨기기를 위한 CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
