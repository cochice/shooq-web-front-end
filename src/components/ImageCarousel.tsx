'use client';

import { useState, useEffect, useRef } from 'react';
import { OptimizedImages } from '@/lib/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard, Zoom } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper 스타일 임포트
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import './ImageCarousel.css';

interface ImageCarouselProps {
    images: OptimizedImages[];
    isAdultContent?: boolean;
    title?: string;
}

// YouTube URL에 음소거 파라미터 추가
const addYouTubeMuteParam = (url: string) => {
    if (!url) return url;
    const urlObj = new URL(url);
    urlObj.searchParams.set('mute', '1');
    return urlObj.toString();
};

export default function ImageCarousel({ images, isAdultContent = false, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageDimensions, setImageDimensions] = useState<{ [key: number]: { width: number; height: number } }>({});
    const [shouldHide, setShouldHide] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenIndex, setFullscreenIndex] = useState(0);
    const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
    const [fullscreenSwiper, setFullscreenSwiper] = useState<SwiperType | null>(null);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [videoDimensions, setVideoDimensions] = useState<{ [key: number]: { width: number; height: number } }>({});

    // 비디오 요소들의 ref를 저장 (number와 string 키 모두 허용)
    const videoRefs = useRef<{ [key: string | number]: HTMLVideoElement | null }>({});

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

    // 화면 크기 감지 및 컨테이너 너비 업데이트
    useEffect(() => {
        const updateContainerWidth = () => {
            // max-w-3xl (48rem = 768px) 기준으로 실제 컨테이너 너비 계산
            const maxWidth = 768; // max-w-3xl
            const windowWidth = window.innerWidth;
            const actualWidth = Math.min(windowWidth - 32, maxWidth); // 32px는 padding
            setContainerWidth(actualWidth);
        };

        updateContainerWidth();
        window.addEventListener('resize', updateContainerWidth);
        return () => window.removeEventListener('resize', updateContainerWidth);
    }, []);

    // containerWidth가 변경되면 높이를 다시 계산
    useEffect(() => {
        if (containerWidth === 0 || Object.keys(imageDimensions).length === 0) {
            return;
        }

        const heights = Object.values(imageDimensions).map(dim => {
            const aspectRatio = dim.height / dim.width;

            // 이미지의 원본 너비 대비 컨테이너 너비 비율 계산
            const widthRatio = containerWidth / dim.width;

            // 실제 표시될 높이 = 원본 높이 * 너비 비율
            let displayHeight = dim.height * widthRatio;

            // 높이가 너비의 2.5배 이상이면 긴 이미지로 간주
            if (aspectRatio >= 2.5) {
                displayHeight = Math.min(displayHeight, 1000); // 긴 이미지는 1000px로 제한
            } else if (dim.height > 1000) {
                displayHeight = Math.min(displayHeight, 600); // 1000~2000은 최대 600px
            } else {
                displayHeight = Math.min(displayHeight, 800); // 1000 이하는 최대 800px
            }

            return displayHeight;
        });

        const calculatedMaxHeight = Math.max(...heights, 0);
        // 1% 높이 추가
        const adjustedHeight = Math.ceil(calculatedMaxHeight * 1.01);
        setMaxHeight(adjustedHeight);
    }, [containerWidth, imageDimensions]);

    // 키보드 이벤트 핸들러 (Escape로 전체화면 닫기)
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen]);

    // Intersection Observer를 사용한 비디오 자동 재생/정지
    useEffect(() => {
        // Intersection Observer 옵션: 50% 이상 보일 때 트리거
        const observerOptions = {
            root: null, // viewport를 root로 사용
            rootMargin: '0px',
            threshold: 0.5, // 50% 이상 보일 때
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const videoElement = entry.target as HTMLVideoElement;

                if (entry.isIntersecting) {
                    // 50% 이상 보이면 재생
                    videoElement.play().catch((error) => {
                        // 자동 재생 실패 시 (예: 사용자 인터랙션 필요) 조용히 무시
                        console.log('Video autoplay prevented:', error);
                    });
                } else {
                    // 화면에서 벗어나면 일시정지
                    videoElement.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        // 모든 비디오 요소 관찰 시작
        Object.values(videoRefs.current).forEach((videoElement) => {
            if (videoElement) {
                observer.observe(videoElement);
            }
        });

        // cleanup: 관찰 중지
        return () => {
            observer.disconnect();
        };
    }, [images]); // images가 변경될 때마다 observer 재설정

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
        // console.log('컨테이너 너비:', containerWidth);

        // 모든 이미지의 dimensions 저장
        setImageDimensions(prev => {
            const newDimensions = {
                ...prev,
                [index]: dimensions
            };

            // 컨테이너 너비가 아직 계산되지 않았으면 기다림
            if (containerWidth === 0) {
                return newDimensions;
            }

            // 모든 이미지의 표시될 높이 계산해서 최대값 찾기
            const heights = Object.values(newDimensions).map(dim => {
                const aspectRatio = dim.height / dim.width;

                // 이미지의 원본 너비 대비 컨테이너 너비 비율 계산
                const widthRatio = containerWidth / dim.width;

                // 실제 표시될 높이 = 원본 높이 * 너비 비율
                let displayHeight = dim.height * widthRatio;

                // 높이가 너비의 2.5배 이상이면 긴 이미지로 간주
                if (aspectRatio >= 2.5) {
                    displayHeight = Math.min(displayHeight, 1000); // 긴 이미지는 1000px로 제한
                } else if (dim.height > 1000) {
                    displayHeight = Math.min(displayHeight, 600); // 1000~2000은 최대 600px
                } else {
                    displayHeight = Math.min(displayHeight, 800); // 1000 이하는 최대 800px
                }

                return displayHeight;
            });

            const calculatedMaxHeight = Math.max(...heights, 0);
            // 1% 높이 추가
            const adjustedHeight = Math.ceil(calculatedMaxHeight * 1.01);
            setMaxHeight(adjustedHeight);

            //console.log('계산된 최대 높이:', adjustedHeight);

            return newDimensions;
        });

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

    const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>, index: number) => {
        const video = e.currentTarget;
        const dimensions = { width: video.videoWidth, height: video.videoHeight };

        // 비디오 dimensions 저장 (이미지와 동일한 로직 적용)
        setVideoDimensions(prev => {
            const newDimensions = {
                ...prev,
                [index]: dimensions
            };
            return newDimensions;
        });

        // imageDimensions에도 추가하여 높이 계산에 포함
        setImageDimensions(prev => {
            const newDimensions = {
                ...prev,
                [index]: dimensions
            };

            if (containerWidth === 0) {
                return newDimensions;
            }

            const heights = Object.values(newDimensions).map(dim => {
                const aspectRatio = dim.height / dim.width;
                const widthRatio = containerWidth / dim.width;
                let displayHeight = dim.height * widthRatio;

                if (aspectRatio >= 2.5) {
                    displayHeight = Math.min(displayHeight, 1000);
                } else if (dim.height > 1000) {
                    displayHeight = Math.min(displayHeight, 600);
                } else {
                    displayHeight = Math.min(displayHeight, 800);
                }

                return displayHeight;
            });

            const calculatedMaxHeight = Math.max(...heights, 0);
            const adjustedHeight = Math.ceil(calculatedMaxHeight * 1.01);
            setMaxHeight(adjustedHeight);

            return newDimensions;
        });
    };

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>, index: number) => {
        const target = e.currentTarget;

        // 첫 번째 비디오가 로드 실패하면 전체 캐러셀 숨김
        if (index === 0) {
            setShouldHide(true);
        } else {
            // 다른 비디오는 개별적으로 숨김
            target.style.display = 'none';
        }
    };


    return (
        <div className="relative mb-3 group max-w-3xl">
            {/* 메인 이미지 캐러셀 - Swiper로 구현 */}
            <div
                className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 group"
                style={maxHeight > 0 ? { height: `${maxHeight}px` } : {}}
            >
                <Swiper
                    modules={[Pagination, Keyboard]}
                    pagination={{
                        clickable: true,
                        enabled: false,
                    }}
                    keyboard={{
                        enabled: true,
                    }}
                    loop={false}
                    slidesPerView={1}
                    spaceBetween={0}
                    resistanceRatio={0}
                    touchRatio={1.5}
                    threshold={5}
                    followFinger={true}
                    onSwiper={setMainSwiper}
                    onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                    className="main-carousel-swiper"
                    resistance={true}
                    grabCursor={true}
                    speed={400}
                >
                    {images.map((image, index) => {
                        const dimension = imageDimensions[index];
                        const isVideo = image.media_type === 'video';
                        const isYouTube = image.cloudinary_url?.includes('youtube.com') || image.cloudinary_url?.includes('youtu.be');
                        let maxHeightClass = 'max-h-[600px]';
                        let isTooTall = false;

                        if (dimension) {
                            const aspectRatio = dimension.height / dimension.width;
                            // 높이가 너비의 2.5배 이상이면 긴 이미지로 간주
                            if (aspectRatio >= 2.5) {
                                maxHeightClass = 'h-auto';
                                isTooTall = true;
                            } else if (dimension.height > 1000) {
                                maxHeightClass = 'max-h-[600px]';
                            } else {
                                maxHeightClass = 'max-h-[800px]';
                            }
                        }

                        return (
                            <SwiperSlide key={index}>
                                <div className={`w-full h-full flex ${isTooTall ? 'items-start overflow-hidden' : 'items-center'} justify-center`}>
                                    {/* 긴 이미지 안내 메시지 */}
                                    {isTooTall && !isVideo && (
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs z-10 pointer-events-none">
                                            클릭하여 전체 이미지 보기
                                        </div>
                                    )}
                                    {isVideo ? (
                                        isYouTube ? (
                                            <iframe
                                                src={addYouTubeMuteParam(image.cloudinary_url || '')}
                                                className={`w-full ${maxHeightClass} ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={`YouTube video ${index + 1}`}
                                                style={{ aspectRatio: '16/9' }}
                                            />
                                        ) : (
                                            <video
                                                ref={(el) => {
                                                    videoRefs.current[index] = el;
                                                }}
                                                src={image.cloudinary_url}
                                                className={`w-full h-auto object-contain ${maxHeightClass} ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                                    }`}
                                                controls
                                                muted
                                                autoPlay
                                                playsInline
                                                preload="metadata"
                                                onLoadedMetadata={(e) => handleVideoLoad(e, index)}
                                                onError={(e) => handleVideoError(e, index)}
                                            />
                                        )
                                    ) : (
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
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* 이미지 개수 표시 */}
                {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs z-10">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* 네비게이션 버튼 */}
                {images.length > 1 && (
                    <>
                        {/* 왼쪽 클릭 영역 보호 (iframe 클릭 차단) */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-auto"
                            onClick={() => mainSwiper?.slidePrev()}
                            style={{ display: currentIndex === 0 ? 'none' : 'block' }}
                        />

                        {/* 오른쪽 클릭 영역 보호 (iframe 클릭 차단) */}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-auto"
                            onClick={() => mainSwiper?.slideNext()}
                            style={{ display: currentIndex === images.length - 1 ? 'none' : 'block' }}
                        />

                        {/* 이전 버튼 */}
                        <button
                            type="button"
                            onClick={() => mainSwiper?.slidePrev()}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            disabled={currentIndex === 0}
                            aria-label="이전 이미지"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* 다음 버튼 */}
                        <button
                            type="button"
                            onClick={() => mainSwiper?.slideNext()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            disabled={currentIndex === images.length - 1}
                            aria-label="다음 이미지"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* 전체 화면 이미지 뷰어 - Swiper로 구현 */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeFullscreen}
                >
                    {/* 닫기 버튼 */}
                    <button
                        type="button"
                        onClick={closeFullscreen}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700/90 flex items-center justify-center transition-colors z-50"
                        aria-label="닫기"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* 이미지 개수 표시 */}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-md text-sm z-50">
                            {fullscreenIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Swiper 슬라이드 컨테이너 */}
                    <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
                        <Swiper
                            modules={[Pagination, Keyboard, Zoom]}
                            pagination={{
                                clickable: true,
                                enabled: false,
                            }}
                            keyboard={{
                                enabled: true,
                            }}
                            zoom={{
                                maxRatio: 2,
                                minRatio: 1,
                                toggle: true,
                            }}
                            loop={false}
                            slidesPerView={1}
                            spaceBetween={0}
                            resistanceRatio={0}
                            touchRatio={1.5}
                            threshold={5}
                            followFinger={true}
                            initialSlide={fullscreenIndex}
                            onSwiper={setFullscreenSwiper}
                            onSlideChange={(swiper) => setFullscreenIndex(swiper.activeIndex)}
                            className="fullscreen-carousel-swiper h-full"
                            resistance={true}
                            grabCursor={true}
                            speed={400}
                        >
                            {images.map((image, index) => {
                                const dimension = imageDimensions[index];
                                const isVideo = image.media_type === 'video';
                                const isYouTube = image.cloudinary_url?.includes('youtube.com') || image.cloudinary_url?.includes('youtu.be');
                                const aspectRatio = dimension ? dimension.height / dimension.width : 0;
                                const isTooTall = aspectRatio >= 2.5;

                                return (
                                    <SwiperSlide key={index}>
                                        {isVideo ? (
                                            isYouTube ? (
                                                // YouTube: 전체화면에서 iframe으로 재생
                                                <div className="w-full h-full flex items-center justify-center px-8 py-4">
                                                    <iframe
                                                        src={addYouTubeMuteParam(image.cloudinary_url || '')}
                                                        className="max-w-full max-h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={`YouTube video ${index + 1}`}
                                                        style={{ width: '90vw', height: '50.625vw', maxHeight: '90vh' }}
                                                    />
                                                </div>
                                            ) : (
                                                // 비디오: 전체화면에서 큰 사이즈로 재생
                                                <div className="w-full h-full flex items-center justify-center px-8 py-4">
                                                    <video
                                                        ref={(el) => {
                                                            // 전체화면 비디오도 동일한 ref에 저장
                                                            videoRefs.current[`fullscreen-${index}`] = el;
                                                        }}
                                                        src={image.cloudinary_url}
                                                        className="max-w-full max-h-full object-contain"
                                                        controls
                                                        muted
                                                        autoPlay
                                                        playsInline
                                                        preload="metadata"
                                                        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                                                    />
                                                </div>
                                            )
                                        ) : isTooTall ? (
                                            // 긴 이미지: 스크롤 가능, Zoom 비활성화
                                            <div className="w-full h-full flex items-start justify-center overflow-auto px-8 py-4">
                                                <img
                                                    src={image.cloudinary_url}
                                                    alt={`이미지 ${index + 1}`}
                                                    className="h-auto object-contain"
                                                    style={{ width: '600px', maxWidth: '90vw' }}
                                                />
                                            </div>
                                        ) : (
                                            // 일반 이미지: Zoom 가능
                                            <div className="swiper-zoom-container">
                                                <img
                                                    src={image.cloudinary_url}
                                                    alt={`이미지 ${index + 1}`}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        {/* 전체화면 네비게이션 버튼 */}
                        {images.length > 1 && (
                            <>
                                {/* 이전 버튼 */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fullscreenSwiper?.slidePrev();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={fullscreenIndex === 0}
                                    aria-label="이전 이미지"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* 다음 버튼 */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fullscreenSwiper?.slideNext();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={fullscreenIndex === images.length - 1}
                                    aria-label="다음 이미지"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
