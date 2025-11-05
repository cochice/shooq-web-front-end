'use client';

import { useState, useEffect } from 'react';
import { OptimizedImages } from '@/lib/api';

interface ImageCarouselProps {
    images: OptimizedImages[];
    isAdultContent?: boolean;
    title?: string;
}

export default function ImageCarousel({ images, isAdultContent = false, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageDimensions, setImageDimensions] = useState<{ [key: number]: { width: number; height: number } }>({});
    const [shouldHide, setShouldHide] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenIndex, setFullscreenIndex] = useState(0);

    // 터치 이벤트 상태
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const openFullscreen = (index: number) => {
        setFullscreenIndex(index);
        setIsFullscreen(true);
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        // body 스크롤 복원
        document.body.style.overflow = 'unset';
    };

    const goToNextFullscreen = () => {
        setFullscreenIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToPreviousFullscreen = () => {
        setFullscreenIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    // 터치 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const deltaX = touchStart.x - touchEnd.x;
        const deltaY = touchStart.y - touchEnd.y;

        // 수평 스와이프 (좌우)
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        const minSwipeDistance = 50;

        if (isHorizontalSwipe && Math.abs(deltaX) > minSwipeDistance) {
            // 좌우 스와이프: 이미지 전환
            if (deltaX > 0) {
                // 왼쪽으로 스와이프: 다음 이미지
                goToNextFullscreen();
            } else {
                // 오른쪽으로 스와이프: 이전 이미지
                goToPreviousFullscreen();
            }
        } else if (!isHorizontalSwipe && deltaY < -minSwipeDistance) {
            // 아래로 스와이프: 팝업 닫기
            closeFullscreen();
        }
    };

    // 키보드 이벤트 핸들러
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowLeft') {
                goToPreviousFullscreen();
            } else if (e.key === 'ArrowRight') {
                goToNextFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen]);

    // 조건부 return은 모든 hooks 이후에 위치
    if (!images || images.length === 0) {
        return null;
    }

    // 숨김 처리된 경우 아무것도 렌더링하지 않음
    if (shouldHide) {
        return null;
    }

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
        const img = e.currentTarget;
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };

        // 디버깅용 콘솔 로그 (문제 발생 시 주석 해제하여 확인)
        // console.log('====================================');
        // console.log('글 제목:', title || '제목 없음');
        // console.log('이미지 인덱스:', index);
        // console.log('이미지 크기:', `${dimensions.width}px x ${dimensions.height}px`);

        // 모든 이미지의 dimensions 저장
        setImageDimensions(prev => ({
            ...prev,
            [index]: dimensions
        }));

        // console.log('높이 제한 적용:', dimensions.height > 2000 ? '예 (2000px 제한)' : dimensions.height > 1000 ? '예 (600px)' : '아니오 (800px)');
        // console.log('====================================');
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
        const target = e.currentTarget;

        // 첫 번째 이미지가 로드 실패하면 전체 캐러셀 숨김
        if (index === 0) {
            setShouldHide(true);
        } else {
            // 다른 이미지는 개별적으로 숨김
            target.style.display = 'none';
        }
    };

    return (
        <div className="relative mb-3 group max-w-3xl">
            {/* 메인 이미지 - 레딧 스타일: 최대 너비 768px(3xl), 높이 1000px 이상이면 600px 제한 */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {/* 슬라이드 컨테이너 */}
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                >
                    {images.map((image, index) => {
                        const dimension = imageDimensions[index];
                        // 높이에 따라 다른 제한 적용
                        // 2000px 초과: 1000px 제한 + overflow hidden + 상단 정렬
                        // 1000px 초과: 600px 제한 + 중앙 정렬
                        // 그 외: 800px 제한 + 중앙 정렬
                        let maxHeightClass = 'max-h-[800px]';
                        let containerClass = 'w-full flex-shrink-0 flex items-center justify-center';
                        let isTooTall = false;

                        if (dimension) {
                            if (dimension.height > 2000) {
                                maxHeightClass = 'h-[1000px]';
                                containerClass = 'w-full flex-shrink-0 flex items-start justify-center overflow-hidden h-[1000px]';
                                isTooTall = true;
                            } else if (dimension.height > 1000) {
                                maxHeightClass = 'max-h-[600px]';
                            }
                        }

                        return (
                            <div
                                key={index}
                                className="w-full flex-shrink-0 relative"
                            >
                                {/* 2000px 초과 이미지 안내 메시지 */}
                                {isTooTall && (
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs z-10 pointer-events-none">
                                        클릭하여 전체 이미지 보기
                                    </div>
                                )}
                                <div className={containerClass}>
                                    <img
                                        src={image.cloudinary_url}
                                        alt={`이미지 ${index + 1}`}
                                        className={`w-full h-auto ${isTooTall ? 'object-cover object-top' : 'object-contain'} cursor-pointer ${maxHeightClass} ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                            }`}
                                        loading="lazy"
                                        onClick={() => openFullscreen(index)}
                                        onLoad={(e) => handleImageLoad(e, index)}
                                        onError={(e) => handleImageError(e, index)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 이미지 개수 표시 */}
                {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* 이전/다음 버튼 (이미지가 2개 이상일 때만 표시) */}
            {images.length > 1 && (
                <>
                    {/* 이전 버튼 */}
                    <button
                        type="button"
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        aria-label="이전 이미지"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 다음 버튼 */}
                    <button
                        type="button"
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                        aria-label="다음 이미지"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* 하단 인디케이터 (점) */}
                    <div className="flex justify-center gap-1.5 mt-2">
                        {images.map((_, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-orange-500 w-6'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                aria-label={`이미지 ${index + 1}로 이동`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* 전체 화면 이미지 뷰어 */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeFullscreen}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* 닫기 버튼 */}
                    <button
                        type="button"
                        onClick={closeFullscreen}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                        aria-label="닫기"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* 이미지 개수 표시 */}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-md text-sm z-50">
                            {fullscreenIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* 이미지 컨테이너 */}
                    {(() => {
                        const dimension = imageDimensions[fullscreenIndex];
                        const isTooTall = dimension && dimension.height > 2000;

                        return (
                            <div
                                className={`absolute inset-0 flex ${isTooTall ? 'items-start' : 'items-center'} justify-center p-4 overflow-auto`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={images[fullscreenIndex].cloudinary_url}
                                    alt={`이미지 ${fullscreenIndex + 1}`}
                                    className={isTooTall ? "h-auto object-contain" : "max-w-full max-h-full object-contain"}
                                    style={isTooTall ? { width: '600px', maxWidth: '90vw' } : {}}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        );
                    })()}

                    {/* 이전/다음 버튼 (이미지가 2개 이상일 때만 표시) */}
                    {images.length > 1 && (
                        <>
                            {/* 이전 버튼 */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPreviousFullscreen();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-50"
                                aria-label="이전 이미지"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* 다음 버튼 */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNextFullscreen();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-50"
                                aria-label="다음 이미지"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
