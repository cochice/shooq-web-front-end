'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService, SiteBbsInfoMain } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import YouTubeVideo from '@/components/YouTubeVideo';
import ImageCarousel from '@/components/ImageCarousel';
import { ADULT_CONTENT_KEYWORDS, STORAGE_KEYS, getSiteLogo } from '@/constants/content';
import { StorageUtils } from '@/utils/storage';

export default function Home() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNewWindowMode, setIsNewWindowMode] = useState(false);
    const [sections, setSections] = useState({
        latest: [] as SiteBbsInfoMain[],
        threeHours: [] as SiteBbsInfoMain[],
        nineHours: [] as SiteBbsInfoMain[],
        oneDay: [] as SiteBbsInfoMain[]
    });
    const [loading, setLoading] = useState({
        latest: false,
        threeHours: false,
        nineHours: false,
        oneDay: false
    });
    const [error, setError] = useState<string | null>(null);

    // 사이드바 관련 상태
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 로딩바 상태
    const [showTopLoadingBar, setShowTopLoadingBar] = useState(false);

    // 헤더에서 필요한 상태들 추가
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const searchKeywordRef = useRef('');

    // 읽은 글 관리
    const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

    // HTML 엔티티 디코딩 함수
    const decodeHtmlEntities = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString?: string) => {
        if (!dateString) return '날짜 없음';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            if (diffDays > 0) {
                return `${diffDays}일 전`;
            } else if (diffHours > 0) {
                return `${diffHours}시간 전`;
            } else {
                return '방금 전';
            }
        } catch {
            return dateString;
        }
    };


    // 읽은 글 관리 함수들
    const markPostAsRead = useCallback((postId: string) => {
        setReadPosts(prev => {
            const newSet = new Set(prev);
            newSet.add(postId);
            // localStorage에 저장 (최근 1000개만 유지)
            const readPostsArray = Array.from(newSet).slice(-1000);
            StorageUtils.setItem(STORAGE_KEYS.READ_POSTS, JSON.stringify(readPostsArray));
            return new Set(readPostsArray);
        });
    }, []);

    const isPostRead = useCallback((postId: string) => {
        return readPosts.has(postId);
    }, [readPosts]);

    // 성인 콘텐츠 감지 함수
    const hasAdultContent = useCallback((title?: string) => {
        if (!title) return false;
        return ADULT_CONTENT_KEYWORDS.some(keyword => title.includes(keyword));
    }, []);

    // 모든 섹션 데이터를 한번에 로드하고 time_bucket으로 분류
    const loadAllSectionsData = useCallback(async () => {
        try {
            setLoading({
                latest: true,
                threeHours: true,
                nineHours: true,
                oneDay: true
            });
            setShowTopLoadingBar(true);
            setError(null);

            const result = await ApiService.getMainPosts(
                isSearchMode ? searchKeywordRef.current : undefined,
                undefined, // author
                'n' // isNewsYn - 뉴스 제외
            );

            // time_bucket 값에 따라 데이터 분류
            const oneHourPosts = result.data.filter(post => post.time_bucket === '1h');
            const threeHourPosts = result.data.filter(post => post.time_bucket === '3h');
            const nineHourPosts = result.data.filter(post => post.time_bucket === '9h');
            const oneDayPosts = result.data.filter(post => post.time_bucket === '24h');

            setSections({
                latest: oneHourPosts,      // 좌상단: 1h
                threeHours: threeHourPosts, // 우상단: 3h
                nineHours: nineHourPosts,   // 좌하단: 9h
                oneDay: oneDayPosts         // 우하단: 24h
            });

        } catch (error) {
            console.error('메인 데이터 로드 실패:', error);
            setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } finally {
            setLoading({
                latest: false,
                threeHours: false,
                nineHours: false,
                oneDay: false
            });
            setShowTopLoadingBar(false);
        }
    }, [isSearchMode]);

    // 다크 모드 토글
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (typeof window !== 'undefined') {
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
                StorageUtils.setItem(STORAGE_KEYS.THEME, 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                StorageUtils.setItem(STORAGE_KEYS.THEME, 'light');
            }
        }
    };

    // 새창 모드 토글
    const toggleNewWindowMode = () => {
        const newWindowMode = !isNewWindowMode;
        setIsNewWindowMode(newWindowMode);
        StorageUtils.setItem(STORAGE_KEYS.NEW_WINDOW_MODE, newWindowMode.toString());
    };

    // 헤더에서 사용할 핸들러들
    const handleSearch = useCallback((keyword: string) => {
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword) {
            // hot 페이지로 keyword 파라미터와 함께 이동
            window.location.href = `/?keyword=${encodeURIComponent(trimmedKeyword)}`;
        }
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
        setIsSearchMode(false);
    }, []);


    const handleHomeClick = () => {
        // 홈으로 이동하거나 페이지 새로고침 로직
        loadAllSectionsData();
    };

    // 사이드바 네비게이션 함수 (검색 상태 초기화 포함)
    const refreshPage = (href: string) => {
        // 사이드바 네비게이션 시 검색 상태 초기화
        StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');
        window.location.href = href;
    };

    // 설정 복원 및 초기 데이터 로드
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 다크 모드 설정 복원
        const savedTheme = StorageUtils.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

        setIsDarkMode(shouldUseDarkMode);
        if (shouldUseDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 새창 모드 설정 복원
        const savedNewWindowMode = StorageUtils.getItem(STORAGE_KEYS.NEW_WINDOW_MODE) === 'true';
        setIsNewWindowMode(savedNewWindowMode);

        // 읽은 글 목록 복원
        const savedReadPosts = StorageUtils.getItem(STORAGE_KEYS.READ_POSTS);
        if (savedReadPosts) {
            try {
                const readPostsArray = JSON.parse(savedReadPosts);
                if (Array.isArray(readPostsArray)) {
                    setReadPosts(new Set(readPostsArray));
                }
            } catch (error) {
                console.warn('Failed to parse read posts from localStorage:', error);
            }
        }

        // 각 섹션 데이터 로드
        loadAllSectionsData();
    }, [loadAllSectionsData]);

    // PostCard 컴포넌트 (hot 페이지와 동일한 디자인)
    const PostCard = ({ post, index }: { post: SiteBbsInfoMain; index: number }) => {
        const postId = `${post.site}-${post.no}`;
        const isRead = isPostRead(postId);
        const isAdultContent = hasAdultContent(post.title);

        return (
            <article key={`post-${post.no}-${index}`} className={`rounded-lg border transition-colors ${isRead
                ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                <div className="p-4 flex flex-col items-center">
                    <div className="w-full max-w-3xl">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {post.site && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{
                                            backgroundColor: getSiteLogo(post.site).bgColor,
                                            color: getSiteLogo(post.site).textColor
                                        }}
                                    >
                                        {getSiteLogo(post.site).letter}
                                    </div>
                                    <span className="font-semibold">{post.site}</span>
                                </div>
                                <span className="mx-1">•</span>
                            </>
                        )}
                        {post.author && (
                            <>
                                <span>Posted by {post.author}</span>
                                <span className="mx-1">•</span>
                            </>
                        )}
                        <span>{formatDate(post.date)}</span>
                    </div>

                    {post.url ? (
                        <a
                            href={post.url}
                            target={isNewWindowMode ? "_blank" : "_self"}
                            rel={isNewWindowMode ? "noopener noreferrer" : undefined}
                            className={`text-lg font-semibold mb-2 hover:text-orange-500 cursor-pointer block ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                                }`}
                            onClick={() => markPostAsRead(postId)}
                        >
                            {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                            {isNewWindowMode && (
                                <svg className="inline-block ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            )}
                        </a>
                    ) : (
                        <h2 className={`text-lg font-semibold mb-2 ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                            {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                        </h2>
                    )}

                    {/* YouTube 비디오 또는 이미지 캐러셀 */}
                    {post.site === 'YouTube' && post.url ? (
                        <div className="mb-3">
                            <YouTubeVideo
                                url={post.url}
                                className={isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''}
                            />
                        </div>
                    ) : (post.optimizedImagesList && post.optimizedImagesList.length > 0) ? (
                        <ImageCarousel
                            images={post.optimizedImagesList}
                            isAdultContent={isAdultContent}
                        />
                    ) : post.cloudinary_url && (
                        <div className="mb-3">
                            <div className="inline-block bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Image
                                    src={post.cloudinary_url}
                                    alt="썸네일"
                                    width={160}
                                    height={160}
                                    className={`object-cover rounded-lg ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                        }`}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {post.likes && (
                            <div className="flex items-center space-x-1 px-2 py-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="hidden sm:inline">{post.likes} 추천</span>
                                <span className="sm:hidden">{post.likes}</span>
                            </div>
                        )}
                        {post.reply_num && (
                            <div className="flex items-center space-x-1 px-2 py-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="hidden sm:inline">{post.reply_num} 답글</span>
                                <span className="sm:hidden">{post.reply_num}</span>
                            </div>
                        )}
                        {post.views && (
                            <div className="flex items-center space-x-1 px-2 py-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="hidden sm:inline">{post.views} 조회</span>
                                <span className="sm:hidden">{post.views}</span>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            </article>
        );
    };

    // 섹션 헤더 컴포넌트
    const SectionHeader = ({ title, linkTo }: { title: string; linkTo: string }) => (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>

            {linkTo && (
                <Link
                    href={linkTo}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                    실시간 글 더보기 →
                </Link>
            )}

        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Global styles for loading animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes nprogress-spinner {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes nprogress-bar {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(0%); }
                    }
                    @keyframes loading-bar-slide {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(0%); }
                        100% { transform: translateX(100%); }
                    }
                    .loading-bar-animation {
                        animation: loading-bar-slide 2s ease-in-out infinite;
                        width: 50%;
                    }
                `
            }} />

            {/* Top Loading Bar - Desktop/PC only */}
            {showTopLoadingBar && (
                <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
                    <div className="h-0.5 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 loading-bar-animation"></div>
                    </div>
                </div>
            )}

            {/* Header */}
            <Header
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                searchKeyword={searchKeyword}
                onSearchKeywordChange={setSearchKeyword}
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                isSearchMode={isSearchMode}
                isNewWindowMode={isNewWindowMode}
                onToggleNewWindowMode={toggleNewWindowMode}
                onHomeClick={handleHomeClick}
                showDarkModeToggle={false}
            />

            {/* Mobile Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                onNavigate={refreshPage}
            />

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <Sidebar onNavigate={refreshPage} />

                {/* Main Content */}
                <main className="flex-1 p-4 max-w-4xl">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4">
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                <div className="text-red-800 dark:text-red-200">
                                    <p className="font-medium">오류 발생</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts by Time Sections */}
                    <div className="space-y-8">
                        {/* 1시간 내 섹션 */}
                        <div>
                            <SectionHeader title="커뮤니티 인기글 (3시간 이내)" linkTo="/" />
                            <div className="space-y-4">
                                {loading.latest ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : (
                                    sections.latest.map((post, index) => (
                                        <PostCard key={`1h-${post.site}-${post.no}-${index}`} post={post} index={index} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3시간 내 섹션 */}
                        <div>
                            <SectionHeader title="커뮤니티 인기글 (6시간 이내)" linkTo="" />
                            <div className="space-y-4">
                                {loading.threeHours ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : (
                                    sections.threeHours.map((post, index) => (
                                        <PostCard key={`3h-${post.site}-${post.no}-${index}`} post={post} index={index} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 9시간 내 섹션 */}
                        <div>
                            <SectionHeader title="커뮤니티 인기글 (9시간 이내)" linkTo="" />
                            <div className="space-y-4">
                                {loading.nineHours ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : (
                                    sections.nineHours.map((post, index) => (
                                        <PostCard key={`9h-${post.site}-${post.no}-${index}`} post={post} index={index} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 24시간 내 섹션 */}
                        <div>
                            <SectionHeader title="커뮤니티 인기글 (24시간 이내)" linkTo="" />
                            <div className="space-y-4">
                                {loading.oneDay ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : (
                                    sections.oneDay.map((post, index) => (
                                        <PostCard key={`24h-${post.site}-${post.no}-${index}`} post={post} index={index} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}