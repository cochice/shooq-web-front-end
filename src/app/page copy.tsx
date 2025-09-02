'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiService, SiteBbsInfo } from '@/lib/api';

export default function Home() {
    const [posts, setPosts] = useState<SiteBbsInfo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sites, setSites] = useState<string[]>([]);
    const [copyrightDisplay, setCopyrightDisplay] = useState<'full' | 'short' | 'hidden'>('full');

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

    // 사이트별 색상 가져오기
    const getSiteColor = (site?: string) => {
        if (site === 'FMKorea') {
            return 'rgb(62, 97, 197)';
        } else if (site === 'Humoruniv') {
            return 'rgb(219, 23, 55)';
        } else if (site === 'TheQoo') {
            return 'rgb(42, 65, 95)';
        }

        const siteColors = {
            'Clien': 'rgb(59, 130, 246)', // Blue
            'Inven': 'rgb(16, 185, 129)', // Green
            'Ruliweb': 'rgb(139, 92, 246)', // Purple
            'Dcinside': 'rgb(245, 101, 101)', // Red
            'MLBPARK': 'rgb(251, 191, 36)', // Yellow
            'SLRClub': 'rgb(236, 72, 153)', // Pink
            'Natepann': 'rgb(34, 197, 94)', // Emerald
        } as const;

        return siteColors[site as keyof typeof siteColors] || 'rgb(107, 114, 128)'; // Default gray
    };

    // 초기 데이터 로드
    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [postsResult, sitesResult] = await Promise.all([
                ApiService.getPosts(1, 10),
                ApiService.getSites().catch(() => []) // 사이트 로드 실패해도 계속 진행
            ]);

            setPosts(postsResult.data);
            setCurrentPage(postsResult.page);
            setTotalCount(postsResult.totalCount);
            setHasMore(postsResult.hasNextPage);
            setSites(sitesResult);
            console.log('Loaded sites:', sitesResult);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 더 많은 포스트 로드
    const loadMorePosts = useCallback(async () => {
        if (loading || !hasMore) {
            return;
        }

        try {
            setLoading(true);
            const result = await ApiService.getPosts(currentPage + 1, 10);

            setPosts(prev => [...prev, ...result.data]);
            setCurrentPage(result.page);
            setHasMore(result.hasNextPage);
        } catch (error) {
            console.error('추가 포스트 로드 실패:', error);
            setError('추가 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, loading, hasMore]);

    // 홈 버튼 클릭 시 새글 불러오기
    const handleHomeClick = () => {
        loadInitialData();
    };

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // 스크롤 이벤트 핸들러
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.offsetHeight;

            // 페이지 하단에서 800px 전에 로드 시작
            if (scrollTop + windowHeight >= documentHeight - 800) {
                loadMorePosts();
            }
        };

        // 디바운싱을 위한 타이머
        let timeoutId: NodeJS.Timeout;
        const debouncedHandleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 100);
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            clearTimeout(timeoutId);
        };
    }, [loadMorePosts]);

    // 다크 모드 토글
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (typeof window !== 'undefined') {
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    };

    // 초기 다크 모드 설정
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                setIsDarkMode(true);
                document.documentElement.classList.add('dark');
            } else {
                setIsDarkMode(false);
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // 저작권 표시 반응형 처리
    useEffect(() => {
        const checkViewportSize = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;

                if (width >= 640) { // sm 이상
                    setCopyrightDisplay('full');
                } else if (width >= 400) { // 중간 크기
                    setCopyrightDisplay('short');
                } else { // 380px 이하
                    setCopyrightDisplay('hidden');
                }
            }
        };

        checkViewportSize();
        window.addEventListener('resize', checkViewportSize);

        return () => {
            window.removeEventListener('resize', checkViewportSize);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Reddit-style Loading Bar */}
            {loading && (
                <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent overflow-hidden">
                    <div
                        className="h-full bg-orange-500 w-full transform -translate-x-full animate-pulse"
                        style={{
                            animation: 'loading-slide 2s ease-in-out infinite',
                            background: 'linear-gradient(90deg, transparent, #f97316, transparent)'
                        }}
                    ></div>
                </div>
            )}

            {/* Global styles for loading animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes loading-slide {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                `
            }} />

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {/* Mobile Hamburger Menu */}
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                aria-label={isSidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
                            >
                                {isSidebarOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleHomeClick}
                                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">S</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Shoooq</span>
                            </button>
                        </div>

                        <div className="flex-1 max-w-lg mx-2 sm:mx-8">
                            <input
                                type="text"
                                placeholder="게시물 검색"
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Dark Mode Toggle */}
                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="다크 모드 토글"
                            >
                                {isDarkMode ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            <button type="button" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900">
                                로그인
                            </button>
                            <button type="button" className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600">
                                회원가입
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <div className={`lg:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop with dim effect */}
                <div 
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${isSidebarOpen ? 'bg-opacity-60' : 'bg-opacity-0'}`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
                
                {/* Sidebar Content */}
                <div className={`relative z-41 bg-gray-900 w-80 h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4">
                        {/* 메뉴 헤더 */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white">메뉴</h2>
                        </div>

                        {/* 홈 버튼 - 모바일 */}
                        <button
                            type="button"
                            onClick={() => {
                                handleHomeClick();
                                setIsSidebarOpen(false);
                            }}
                            disabled={loading}
                            className="w-full flex items-center justify-start space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 font-medium py-3 px-3 mb-4 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>홈</span>
                        </button>

                        {/* 경계선 */}
                        <div className="border-b border-gray-700 mb-4"></div>

                        <h3 className="font-medium text-gray-400 mb-3 text-sm uppercase tracking-wide">사이트 목록 ({sites.length}개)</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {sites.length > 0 ? (
                                sites.map((site) => {
                                    const siteColor = getSiteColor(site);
                                    return (
                                        <div key={site} className="flex items-center justify-between py-3 px-3 hover:bg-gray-800 rounded-lg transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-6 h-6 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: siteColor }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-300">{site}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                                            >
                                                필터
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-400">사이트 정보를 불러오는 중...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-80 flex-shrink-0 space-y-4 p-4">
                    <div className="sticky top-20">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            {/* 홈 버튼 - 데스크톱 */}
                            <button
                                type="button"
                                onClick={handleHomeClick}
                                disabled={loading}
                                className="w-full flex items-center justify-start space-x-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold py-3 px-2 mb-4 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>홈</span>
                            </button>

                            {/* 경계선 */}
                            <div className="border-b border-gray-100 dark:border-gray-700 mb-4"></div>

                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">사이트 목록 ({sites.length}개)</h3>
                            <div className="space-y-2">
                                {sites.length > 0 ? (
                                    sites.map((site) => {
                                        const siteColor = getSiteColor(site);
                                        return (
                                            <div key={site} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: siteColor }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{site}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                                                >
                                                    필터
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">사이트 정보를 불러오는 중...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 max-w-4xl">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                            <div className="flex">
                                <div className="text-red-800 dark:text-red-200">
                                    <p className="font-medium">오류 발생</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading Initial Data */}
                    {loading && posts.length === 0 && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</span>
                        </div>
                    )}

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <article key={`post-${post.no}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Site Badge */}
                                    <div
                                        className="flex items-center justify-center p-3 sm:w-16 w-full rounded-l-lg sm:rounded-none"
                                        style={{ backgroundColor: getSiteColor(post.site) }}
                                    >
                                        <span
                                            className={`text-xs font-bold text-center leading-tight ${post.site === 'TheQoo' ? 'text-white' : 'text-white'
                                                }`}
                                        >
                                            {post.site === 'FMKorea' ? 'FM' :
                                                post.site === 'Humoruniv' ? 'HU' :
                                                    post.site === 'TheQoo' ? 'TQ' :
                                                        (post.site || 'N/A')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {post.site && (
                                                <>
                                                    <span className="font-semibold">{post.site}</span>
                                                    <span className="mx-1">•</span>
                                                </>
                                            )}
                                            {post.author && (
                                                <>
                                                    <span>Posted by {post.author}</span>
                                                    <span className="mx-1">•</span>
                                                </>
                                            )}
                                            <span>{formatDate(post.regDate)}</span>
                                            {post.views && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span>조회 {post.views}</span>
                                                </>
                                            )}
                                        </div>

                                        {post.url ? (
                                            <a
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-orange-500 cursor-pointer block"
                                            >
                                                {post.title || '제목 없음'}
                                            </a>
                                        ) : (
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {post.title || '제목 없음'}
                                            </h2>
                                        )}

                                        {post.content && (
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                                                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                            {post.replyNum && (
                                                <div className="flex items-center space-x-1 px-2 py-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="hidden sm:inline">{post.replyNum} Comments</span>
                                                    <span className="sm:hidden">{post.replyNum}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Loading More Posts */}
                    {loading && posts.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">새로운 포스트를 불러오는 중...</span>
                        </div>
                    )}

                    {/* End of Posts Message */}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">모든 포스트를 확인했습니다! (총 {totalCount}개)</p>
                        </div>
                    )}

                    {/* No Posts Message */}
                    {!loading && posts.length === 0 && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">아직 포스트가 없습니다.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Copyright - Responsive Display */}
            {copyrightDisplay !== 'hidden' && (
                <div className="mt-8 mb-4">
                    <div className="flex">
                        <div className="hidden lg:block w-80 flex-shrink-0"></div>
                        <div className="flex-1 px-4">
                            <div className="text-right">
                                <div className="inline-block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm">
                                    {copyrightDisplay === 'full' ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            Shoooq, Inc. © 2025. All rights reserved.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            © 2025 Shoooq, Inc.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}