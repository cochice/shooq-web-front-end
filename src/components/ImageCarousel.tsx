'use client';

import { useState } from 'react';
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

    if (!images || images.length === 0) {
        return null;
    }

    // 숨김 처리된 경우 아무것도 렌더링하지 않음
    if (shouldHide) {
        return null;
    }

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

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
        const img = e.currentTarget;
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };

        // 첫 번째 이미지만 높이 체크
        if (index === 0) {
            // 디버깅용 콘솔 로그 (문제 발생 시 주석 해제하여 확인)
            // console.log('====================================');
            // console.log('글 제목:', title || '제목 없음');
            // console.log('이미지 크기:', `${dimensions.width}px x ${dimensions.height}px`);

            // 높이가 2000px 이상이면 이미지 숨김
            if (dimensions.height > 2000) {
                // console.log('⚠️ 높이 2000px 초과 - 이미지 숨김 처리');
                // console.log('====================================');
                setShouldHide(true);
                return;
            }

            // console.log('높이 제한 적용:', dimensions.height > 1000 ? '예 (600px)' : '아니오 (800px)');
            // console.log('====================================');
        }

        setImageDimensions(prev => ({
            ...prev,
            [index]: dimensions
        }));
    };

    // 현재 이미지의 높이가 1000px 이상인지 확인
    const currentImageDimension = imageDimensions[currentIndex];
    const shouldLimitHeight = currentImageDimension && currentImageDimension.height > 1000;

    return (
        <div className="relative mb-3 group max-w-3xl">
            {/* 메인 이미지 - 레딧 스타일: 최대 너비 768px(3xl), 높이 1000px 이상이면 600px 제한 */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <img
                    src={images[currentIndex].cloudinary_url}
                    alt={`이미지 ${currentIndex + 1}`}
                    className={`w-full h-auto object-contain ${
                        shouldLimitHeight ? 'max-h-[600px]' : 'max-h-[800px]'
                    } ${
                        isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                    }`}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(e, currentIndex)}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />

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
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="이전 이미지"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* 다음 버튼 */}
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'bg-orange-500 w-6'
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                                aria-label={`이미지 ${index + 1}로 이동`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
