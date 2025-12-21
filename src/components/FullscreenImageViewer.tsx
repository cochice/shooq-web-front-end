'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { OptimizedImages } from '@/lib/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard, Zoom } from 'swiper/modules';

// Swiper 스타일 임포트
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import './ImageCarousel.css';

interface FullscreenImageViewerProps {
    images: OptimizedImages[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function FullscreenImageViewer({ images, initialIndex, isOpen, onClose }: FullscreenImageViewerProps) {
    const [fullscreenIndex, setFullscreenIndex] = useState(initialIndex);
    const [imageDimensions, setImageDimensions] = useState<{ [key: number]: { width: number; height: number } }>({});

    // initialIndex가 변경되면 fullscreenIndex도 업데이트
    useEffect(() => {
        setFullscreenIndex(initialIndex);
    }, [initialIndex]);

    // 키보드 이벤트 핸들러 (Escape로 전체화면 닫기)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            // body 스크롤 복원
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // 이미지 로드 핸들러
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
        const img = e.currentTarget;
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };

        setImageDimensions(prev => ({
            ...prev,
            [index]: dimensions
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* 닫기 버튼 */}
            <button
                type="button"
                onClick={onClose}
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
                    initialSlide={initialIndex}
                    onSlideChange={(swiper) => setFullscreenIndex(swiper.activeIndex)}
                    className="fullscreen-carousel-swiper h-full"
                    resistance={true}
                    grabCursor={true}
                    speed={400}
                >
                    {images.map((image, index) => {
                        const dimension = imageDimensions[index];
                        const aspectRatio = dimension ? dimension.height / dimension.width : 0;
                        const isTooTall = aspectRatio >= 2.5;

                        if (!image.cloudinary_url) return null;

                        return (
                            <SwiperSlide key={index}>
                                {isTooTall ? (
                                    // 긴 이미지: 스크롤 가능, Zoom 비활성화
                                    <div className="w-full h-full flex items-start justify-center overflow-auto px-8 py-4">
                                        <Image
                                            src={image.cloudinary_url || ''}
                                            alt={`이미지 ${index + 1}`}
                                            width={600}
                                            height={1500}
                                            className="h-auto object-contain"
                                            style={{ width: '600px', maxWidth: '90vw' }}
                                            onLoad={(e) => handleImageLoad(e, index)}
                                        />
                                    </div>
                                ) : (
                                    // 일반 이미지: Zoom 가능
                                    <div className="swiper-zoom-container">
                                        <Image
                                            src={image.cloudinary_url || ''}
                                            alt={`이미지 ${index + 1}`}
                                            width={1200}
                                            height={900}
                                            className="max-w-full max-h-full object-contain"
                                            onLoad={(e) => handleImageLoad(e, index)}
                                        />
                                    </div>
                                )}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
}
