'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiService, SiteBbsInfo } from '@/lib/api';

// localStorage 키 상수
const STORAGE_KEYS = {
    THEME: 'shooq-theme',
    NEW_WINDOW_MODE: 'shooq-newWindowMode',
    SELECTED_SITES: 'shooq-selectedSites',
    SEARCH_KEYWORD: 'shooq-searchKeyword'
} as const;

// localStorage 유틸리티 함수
const StorageUtils = {
    // 안전한 localStorage 읽기
    getItem: (key: string, defaultValue: string = ''): string => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (error) {
            console.warn(`Failed to read from localStorage key: ${key}`, error);
            return defaultValue;
        }
    },

    // 안전한 localStorage 쓰기
    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to write to localStorage key: ${key}`, error);
        }
    },

    // 불린 값 읽기
    getBoolean: (key: string, defaultValue: boolean = false): boolean => {
        const value = StorageUtils.getItem(key);
        if (value === '') return defaultValue;
        return value === 'true';
    },

    // 불린 값 쓰기
    setBoolean: (key: string, value: boolean): void => {
        StorageUtils.setItem(key, value.toString());
    },

    // Set<string> 읽기
    getStringSet: (key: string): Set<string> => {
        const value = StorageUtils.getItem(key);
        if (!value) return new Set();
        try {
            const array = JSON.parse(value);
            return new Set(Array.isArray(array) ? array : []);
        } catch (error) {
            console.warn(`Failed to parse Set from localStorage key: ${key}`, error);
            return new Set();
        }
    },

    // Set<string> 쓰기
    setStringSet: (key: string, value: Set<string>): void => {
        const array = Array.from(value);
        StorageUtils.setItem(key, JSON.stringify(array));
    }
};

export default function Home() {
    const [posts, setPosts] = useState<SiteBbsInfo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNewWindowMode, setIsNewWindowMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sites, setSites] = useState<string[]>([]);
    const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
    const [copyrightDisplay, setCopyrightDisplay] = useState<'full' | 'short' | 'hidden'>('full');

    // 검색 상태
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);

    // 사이드바 호버 상태
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isMobileSidebarHovered, setIsMobileSidebarHovered] = useState(false);


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
        const siteColors = {
            'FMKorea': 'rgb(62, 97, 197)',    // Blue
            'Humoruniv': 'rgb(219, 23, 55)',  // Red
            'TheQoo': 'rgb(42, 65, 95)',      // Dark Blue
            'NaverNews': 'rgb(40, 181, 78)',  // Green
            'Ppomppu': 'rgb(199, 199, 199)',  // Gray
            'GoogleNews': 'rgb(53, 112, 255)',// Blue
            'Clien': 'rgb(25, 36, 125)',      // Navy
            'TodayHumor': 'rgb(255, 255, 255)', // White
            'SLRClub': 'rgb(66, 116, 175)',   // Blue
            '82Cook': 'rgb(230, 230, 230)',
            'MlbPark': 'rgb(65, 106, 220)',
            'BobaeDream': 'rgb(16, 90, 174)',
            'Inven': 'rgb(240, 255, 255)',
        } as const;
        return siteColors[site as keyof typeof siteColors] || 'rgb(107, 114, 128)'; // Default gray
    };

    // 초기 데이터 로드
    const loadInitialData = useCallback(async (filterSites?: string[]) => {
        try {
            setLoading(true);
            setError(null);

            const sitesArray = filterSites || (selectedSites.size > 0 ? Array.from(selectedSites) : undefined);

            const [postsResult, sitesResult] = await Promise.all([
                isSearchMode && searchKeyword
                    ? ApiService.searchPosts(searchKeyword, undefined, undefined, 1, 10, sitesArray)
                    : ApiService.getPosts(1, 10, undefined, sitesArray),
                ApiService.getSites().catch(() => []) // 사이트 로드 실패해도 계속 진행
            ]);

            setPosts(postsResult.data);
            setCurrentPage(postsResult.page);
            setTotalCount(postsResult.totalCount);
            setHasMore(postsResult.hasNextPage);
            setSites(sitesResult);
            console.log('Loaded sites:', sitesResult, 'Filter:', sitesArray);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } finally {
            setLoading(false);
        }
    }, [selectedSites, isSearchMode, searchKeyword]);


    // 더 많은 포스트 로드
    const loadMorePosts = useCallback(async () => {
        if (loading || !hasMore) {
            return;
        }

        try {
            setLoading(true);
            const sitesArray = selectedSites.size > 0 ? Array.from(selectedSites) : undefined;
            const result = isSearchMode && searchKeyword
                ? await ApiService.searchPosts(searchKeyword, undefined, undefined, currentPage + 1, 10, sitesArray)
                : await ApiService.getPosts(currentPage + 1, 10, undefined, sitesArray);

            setPosts(prev => [...prev, ...result.data]);
            setCurrentPage(result.page);
            setHasMore(result.hasNextPage);
        } catch (error) {
            console.error('추가 포스트 로드 실패:', error);
            setError('추가 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, loading, hasMore, selectedSites, isSearchMode, searchKeyword]);

    // 홈 버튼 클릭 시 새글 불러오기 (검색 상태 유지)
    const handleHomeClick = () => {
        loadInitialData();
    };

    // 검색 실행
    const handleSearch = useCallback((keyword: string) => {
        const trimmedKeyword = keyword.trim();
        setSearchKeyword(trimmedKeyword);
        setIsSearchMode(!!trimmedKeyword);
        setCurrentPage(1);
        setPosts([]);

        // localStorage에 검색 키워드 저장
        if (trimmedKeyword) {
            StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, trimmedKeyword);
        } else {
            StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');
        }

        loadInitialData();
    }, [loadInitialData]);

    // 검색 취소
    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
        setIsSearchMode(false);
        setCurrentPage(1);
        setPosts([]);

        // localStorage에서 검색 키워드 제거
        StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');

        loadInitialData();
    }, [loadInitialData]);

    // 사이드바 스크롤 이벤트 핸들러
    const handleSidebarWheel = useCallback((e: React.WheelEvent) => {
        const target = e.currentTarget as HTMLDivElement;
        const { scrollTop, scrollHeight, clientHeight } = target;

        // 스크롤이 가능한 경우에만 이벤트 전파 중단
        if (
            (e.deltaY > 0 && scrollTop < scrollHeight - clientHeight) || // 아래로 스크롤하면서 더 스크롤 가능
            (e.deltaY < 0 && scrollTop > 0) // 위로 스크롤하면서 더 스크롤 가능
        ) {
            e.stopPropagation();
        }
    }, []);

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
        StorageUtils.setBoolean(STORAGE_KEYS.NEW_WINDOW_MODE, newWindowMode);
    };

    // 사이트 필터 토글
    const toggleSiteFilter = (site: string) => {
        setSelectedSites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(site)) {
                newSet.delete(site);
            } else {
                newSet.add(site);
            }
            // localStorage에 저장
            StorageUtils.setStringSet(STORAGE_KEYS.SELECTED_SITES, newSet);
            return newSet;
        });
    };

    // 모든 필터 해제
    const clearAllFilters = () => {
        const emptySet = new Set<string>();
        setSelectedSites(emptySet);
        // localStorage에 저장
        StorageUtils.setStringSet(STORAGE_KEYS.SELECTED_SITES, emptySet);
    };

    // 필터 및 검색 상태 변경 시 데이터 다시 로드
    useEffect(() => {
        if (sites.length > 0) { // 사이트 목록이 로드된 후에만 실행
            loadInitialData();
        }
    }, [selectedSites, sites.length, searchKeyword, isSearchMode, loadInitialData]);

    // 초기 다크 모드 및 새창 모드 설정
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 다크 모드 설정
            const savedTheme = StorageUtils.getItem(STORAGE_KEYS.THEME);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            // 저장된 테마가 있으면 그것을 사용, 없으면 시스템 설정을 따름
            const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

            setIsDarkMode(shouldUseDarkMode);
            if (shouldUseDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // 새창 모드 설정 (기본값: false - 현재창)
            const savedNewWindowMode = StorageUtils.getBoolean(STORAGE_KEYS.NEW_WINDOW_MODE, false);
            setIsNewWindowMode(savedNewWindowMode);

            // 필터 설정 복원
            const savedSelectedSites = StorageUtils.getStringSet(STORAGE_KEYS.SELECTED_SITES);
            setSelectedSites(savedSelectedSites);

            // 검색 키워드 복원
            const savedSearchKeyword = StorageUtils.getItem(STORAGE_KEYS.SEARCH_KEYWORD);
            if (savedSearchKeyword) {
                setSearchKeyword(savedSearchKeyword);
                setIsSearchMode(true);
            }

            console.log('Settings loaded:', {
                theme: savedTheme || (prefersDark ? 'dark (system)' : 'light (system)'),
                newWindowMode: savedNewWindowMode,
                searchKeyword: savedSearchKeyword,
                selectedSites: Array.from(savedSelectedSites)
            });
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

    // 백엔드에서 필터링된 포스트를 받으므로 클라이언트 필터링 불필요
    const filteredPosts = posts;

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
                                    <span className="text-white font-bold text-xl">S</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">shooq</span>
                            </button>
                        </div>

                        <div className="flex-1 max-w-lg mx-2 sm:mx-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(e.currentTarget.value);
                                        }
                                    }}
                                    placeholder="게시물 검색"
                                    className="w-full px-4 py-2 pr-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {isSearchMode && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        title="검색 취소"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* New Window Mode Toggle */}
                            <button
                                type="button"
                                onClick={toggleNewWindowMode}
                                className={`p-2 text-gray-600 dark:text-gray-300 rounded-full ${isNewWindowMode ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' : ''}`}
                                aria-label="새창 모드 토글"
                                title={isNewWindowMode ? "새창 모드: 켜짐 (링크를 새창에서 열기)" : "새창 모드: 꺼짐 (링크를 현재창에서 열기)"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {isNewWindowMode && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}
                            </button>

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

                            {/* <button type="button" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900">
                                로그인
                            </button>
                            <button type="button" className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600">
                                회원가입
                            </button> */}
                        </div>
                    </div>
                </div>
            </header>

            {/* NProgress-style Loading Bar */}
            {loading && (
                <div className="fixed top-16 left-0 right-0 z-[60] h-0.5 bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-orange-500 transition-all duration-300 ease-out"
                        style={{
                            width: '30%',
                            animation: 'nprogress-bar 2s ease-in-out infinite'
                        }}
                    />
                    {/* NProgress Spinner */}
                    <div className="absolute right-2 top-1">
                        <div
                            className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full"
                            style={{ animation: 'nprogress-spinner 1s linear infinite' }}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            <div className={`lg:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop with dim effect */}
                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${isSidebarOpen ? 'bg-opacity-40' : 'bg-opacity-0'}`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>

                {/* Sidebar Content */}
                <div className={`relative z-41 bg-gray-900 w-80 h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 h-full flex flex-col">
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

                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-400 text-sm uppercase tracking-wide">이슈 채널 ({sites.length}개)</h3>
                            {selectedSites.size > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                                >
                                    전체 해제
                                </button>
                            )}
                        </div>
                        <div
                            className={`flex-1 overflow-y-auto ${!isMobileSidebarHovered ? '[&::-webkit-scrollbar]:hidden' : '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent'}`}
                            onMouseEnter={() => setIsMobileSidebarHovered(true)}
                            onMouseLeave={() => setIsMobileSidebarHovered(false)}
                            style={{
                                scrollbarWidth: isMobileSidebarHovered ? 'thin' : 'none',
                                scrollbarColor: isMobileSidebarHovered ? 'rgb(107, 114, 128) transparent' : 'transparent transparent',
                            } as React.CSSProperties}
                        >
                            <div className="space-y-1 pr-2">
                                {sites.length > 0 ? (
                                    sites.map((site) => {
                                        const siteColor = getSiteColor(site);
                                        const isSelected = selectedSites.has(site);
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
                                                    onClick={() => toggleSiteFilter(site)}
                                                    className={`p-1 rounded transition-colors ${isSelected
                                                        ? 'text-orange-400 bg-orange-900/30 hover:bg-orange-900/50'
                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                                                        }`}
                                                    title={isSelected ? `${site} 필터 해제` : `${site}만 보기`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                    </svg>
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
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-80 flex-shrink-0 space-y-4 p-4">
                    <div className="sticky top-20">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-8rem)] flex flex-col">
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

                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">이슈 채널 ({sites.length}개)</h3>
                                {selectedSites.size > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAllFilters}
                                        className="text-xs text-orange-500 hover:text-orange-600 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                                    >
                                        전체 해제
                                    </button>
                                )}
                            </div>
                            <div
                                className={`flex-1 overflow-y-auto min-h-0 ${!isSidebarHovered ? '[&::-webkit-scrollbar]:hidden' : '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent'}`}
                                onWheel={handleSidebarWheel}
                                onMouseEnter={() => setIsSidebarHovered(true)}
                                onMouseLeave={() => setIsSidebarHovered(false)}
                                style={{
                                    scrollbarWidth: isSidebarHovered ? 'thin' : 'none',
                                    scrollbarColor: isSidebarHovered ? 'rgb(156, 163, 175) transparent' : 'transparent transparent',
                                } as React.CSSProperties}
                            >
                                <div className="space-y-2 pr-2">
                                    {sites.length > 0 ? (
                                        sites.map((site) => {
                                            const siteColor = getSiteColor(site);
                                            const isSelected = selectedSites.has(site);
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
                                                        onClick={() => toggleSiteFilter(site)}
                                                        className={`p-1 rounded transition-colors ${isSelected
                                                            ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                            }`}
                                                        title={isSelected ? `${site} 필터 해제` : `${site}만 보기`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                        </svg>
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

                    {/* Search Status */}
                    {isSearchMode && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                                        검색 결과: &quot;{searchKeyword}&quot;
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
                                        총 {totalCount}개의 게시물이 검색되었습니다.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClearSearch}
                                    className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm underline"
                                >
                                    검색 취소
                                </button>
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
                        {filteredPosts.map((post, index) => (
                            <article key={`post-${post.no}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Site Badge */}
                                    <div
                                        className="flex items-center justify-center p-3 sm:w-16 w-full rounded-l-lg sm:rounded-none"
                                        style={{ backgroundColor: getSiteColor(post.site) }}
                                    >
                                        <span
                                            className={`text-xs font-bold text-center leading-tight 
                                                ${post.site === 'TheQoo' ? 'text-white' :
                                                    post.site === 'TodayHumor' ? 'text-gray-700' :
                                                        post.site === '82Cook' ? 'text-green-700' :
                                                            post.site === 'Inven' ? 'text-[#FF4433]' :
                                                                'text-white'
                                                }`
                                            }
                                        >
                                            {
                                                post.site === 'FMKorea' ? 'FM' :
                                                    post.site === 'Humoruniv' ? 'HU' :
                                                        post.site === 'TheQoo' ? 'TQ' :
                                                            post.site === 'NaverNews' ? 'N 뉴스' :
                                                                post.site === 'Ppomppu' ? '뽐뿌' :
                                                                    post.site === 'GoogleNews' ? 'G 뉴스' :
                                                                        post.site === 'Clien' ? 'CLIen' :
                                                                            post.site === 'TodayHumor' ? '오유' :
                                                                                post.site === 'SlrClub' ? 'SLR' :
                                                                                    post.site === 'MlbPark' ? '엠팍' :
                                                                                        post.site === 'BobaeDream' ? '보배' :
                                                                                            post.site === 'Inven' ? '인벤' :
                                                                                                (post.site || 'N/A')
                                            }
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
                                                target={isNewWindowMode ? "_blank" : "_self"}
                                                rel={isNewWindowMode ? "noopener noreferrer" : undefined}
                                                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-orange-500 cursor-pointer block"
                                            >
                                                {post.title || '제목 없음'}
                                                {isNewWindowMode && (
                                                    <svg className="inline-block ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                )}
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
                                            {post.likes && (
                                                <div className="flex items-center space-x-1 px-2 py-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <span className="hidden sm:inline">{post.likes} 추천</span>
                                                    <span className="sm:hidden">{post.likes}</span>
                                                </div>
                                            )}
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
                            <p className="text-gray-500 dark:text-gray-400">
                                {selectedSites.size > 0 ?
                                    `선택한 채널의 모든 포스트를 확인했습니다! (총 ${filteredPosts.length}개)` :
                                    `모든 포스트를 확인했습니다! (총 ${totalCount}개)`
                                }
                            </p>
                        </div>
                    )}

                    {/* No Posts Message */}
                    {!loading && posts.length === 0 && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">아직 포스트가 없습니다.</p>
                        </div>
                    )}

                    {/* Filtered No Posts Message */}
                    {!loading && posts.length > 0 && filteredPosts.length === 0 && selectedSites.size > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">선택한 채널에 포스트가 없습니다.</p>
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="mt-2 text-sm text-orange-500 hover:text-orange-600 underline"
                            >
                                모든 채널 보기
                            </button>
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
                                            Shooq, Inc. © 2025. All rights reserved.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            © 2025 Shooq, Inc.
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