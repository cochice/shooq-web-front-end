'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService, SiteBbsInfoMain } from '@/lib/api';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// localStorage 키 상수
const STORAGE_KEYS = {
    THEME: 'shooq-theme',
    NEW_WINDOW_MODE: 'shooq-newWindowMode',
    SEARCH_KEYWORD: 'shooq-searchKeyword',
    SORT_TYPE: 'shooq-sortType',
    READ_POSTS: 'shooq-readPosts',
    SHOW_UNREAD_ONLY: 'shooq-showUnreadOnly'
} as const;

// localStorage 유틸리티 함수
const StorageUtils = {
    getItem: (key: string, defaultValue: string = ''): string => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (error) {
            console.warn(`Failed to read from localStorage key: ${key}`, error);
            return defaultValue;
        }
    },

    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to write to localStorage key: ${key}`, error);
        }
    }
};

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

    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

    // 사이트별 로고 문자 및 색상 가져오기
    const getSiteLogo = (site?: string) => {
        const logoData = {
            'FMKorea': { letter: 'F', bgColor: 'rgb(62, 97, 197)', textColor: 'white' },
            'Humoruniv': { letter: 'H', bgColor: 'rgb(219, 23, 55)', textColor: 'white' },
            'TheQoo': { letter: 'T', bgColor: 'rgb(42, 65, 95)', textColor: 'white' },
            'NaverNews': { letter: 'N', bgColor: 'rgb(40, 181, 78)', textColor: 'white' },
            'Ppomppu': { letter: 'P', bgColor: 'rgb(199, 199, 199)', textColor: 'rgb(75, 85, 99)' },
            'GoogleNews': { letter: 'G', bgColor: 'rgb(53, 112, 255)', textColor: 'white' },
            'Clien': { letter: 'C', bgColor: 'rgb(25, 36, 125)', textColor: 'white' },
            'TodayHumor': { letter: 'T', bgColor: 'rgb(255, 255, 255)', textColor: 'rgb(75, 85, 99)' },
            'SLRClub': { letter: 'S', bgColor: 'rgb(66, 116, 175)', textColor: 'white' },
            'SlrClub': { letter: 'S', bgColor: 'rgb(66, 116, 175)', textColor: 'white' },
            'Ruliweb': { letter: 'R', bgColor: 'rgb(255, 102, 0)', textColor: 'white' },
            '82Cook': { letter: '8', bgColor: 'rgb(230, 230, 230)', textColor: 'rgb(75, 85, 99)' },
            'MlbPark': { letter: 'M', bgColor: 'rgb(65, 106, 220)', textColor: 'white' },
            'BobaeDream': { letter: 'B', bgColor: 'rgb(16, 90, 174)', textColor: 'white' },
            'Inven': { letter: 'I', bgColor: 'rgb(240, 255, 255)', textColor: 'rgb(239, 68, 68)' },
            'Damoang': { letter: 'D', bgColor: 'rgb(138, 43, 226)', textColor: 'white' },
        } as const;

        return logoData[site as keyof typeof logoData] || { letter: '?', bgColor: 'rgb(107, 114, 128)', textColor: 'white' };
    };

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
        setSearchKeyword(keyword);
        setIsSearchMode(!!keyword);
        // 실제 검색 기능은 필요에 따라 구현
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
        setIsSearchMode(false);
    }, []);

    const toggleUnreadOnly = () => {
        setShowUnreadOnly(!showUnreadOnly);
    };

    const handleHomeClick = () => {
        // 홈으로 이동하거나 페이지 새로고침 로직
        loadAllSectionsData();
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

        // 각 섹션 데이터 로드
        loadAllSectionsData();
    }, [loadAllSectionsData]);

    // PostCard 컴포넌트 (hot 페이지와 동일한 디자인)
    const PostCard = ({ post, index }: { post: SiteBbsInfoMain; index: number }) => (
        <article key={`post-${post.no}-${index}`} className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="p-4">
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
                        className="text-lg font-semibold mb-2 hover:text-orange-500 cursor-pointer block text-gray-900 dark:text-white"
                    >
                        {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                        {isNewWindowMode && (
                            <svg className="inline-block ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        )}
                    </a>
                ) : (
                    <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                    </h2>
                )}

                {post.content && (
                    <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">
                        {post.url ? (
                            <a
                                href={post.url}
                                target={isNewWindowMode ? "_blank" : "_self"}
                                rel={isNewWindowMode ? "noopener noreferrer" : undefined}
                                className="hover:text-orange-500 cursor-pointer"
                            >
                                {post.content.length > 200 ? `${decodeHtmlEntities(post.content).substring(0, 200)}...` : decodeHtmlEntities(post.content)}
                            </a>
                        ) : (
                            post.content.length > 200 ? `${decodeHtmlEntities(post.content).substring(0, 200)}...` : decodeHtmlEntities(post.content)
                        )}
                    </p>
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
        </article>
    );

    // 섹션 헤더 컴포넌트
    const SectionHeader = ({ title, linkTo }: { title: string; linkTo: string }) => (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <Link
                href={linkTo}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
                더보기 →
            </Link>
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
                showUnreadOnly={showUnreadOnly}
                onToggleUnreadOnly={toggleUnreadOnly}
                isNewWindowMode={isNewWindowMode}
                onToggleNewWindowMode={toggleNewWindowMode}
                onHomeClick={handleHomeClick}
                showDarkModeToggle={false}
            />

            {/* Mobile Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <Sidebar />

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
                            <SectionHeader title="1시간 내" linkTo="/hot" />
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
                            <SectionHeader title="3시간 내" linkTo="/hot" />
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
                            <SectionHeader title="9시간 내" linkTo="/hot" />
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
                            <SectionHeader title="24시간 내" linkTo="/hot" />
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