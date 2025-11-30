'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ApiService, SiteBbsInfo } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import YouTubeVideo from '@/components/YouTubeVideo';
import ImageCarousel from '@/components/ImageCarousel';
import PostDetailOverlay from '@/components/PostDetailOverlay';
import TrendingCommunities from '@/components/TrendingCommunities';
import { ADULT_CONTENT_KEYWORDS, STORAGE_KEYS, getSiteLogo } from '@/constants/content';
import { StorageUtils } from '@/utils/storage';

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const siteParam = searchParams.get('site'); // GET 파라미터에서 site 값 가져오기
    const keywordParam = searchParams.get('keyword'); // GET 파라미터에서 keyword 값 가져오기
    const postIdParam = searchParams.get('postId'); // GET 파라미터에서 postId 값 가져오기

    const [posts, setPosts] = useState<SiteBbsInfo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNewWindowMode, setIsNewWindowMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [maxNo, setMaxNo] = useState<number | undefined>(undefined); // 중복 방지를 위한 최대 no 값
    // const [copyrightDisplay, setCopyrightDisplay] = useState<'full' | 'short' | 'hidden'>('full');

    // 검색 상태
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const searchKeywordRef = useRef('');

    // 읽은 글 관리
    const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

    // 정렬 드롭다운 상태
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top' | 'rising'>('hot');
    const [topPeriod, setTopPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
    const [isTopPeriodOpen, setIsTopPeriodOpen] = useState(false);

    // 로딩바 상태
    const [showTopLoadingBar, setShowTopLoadingBar] = useState(false);

    // 안 본 글만 보기 모드
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // 설정 로드 완료 상태
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

    // 설정 복원 진행 중 상태 (중복 API 호출 방지)
    const [isRestoringSettings, setIsRestoringSettings] = useState(true);

    // 초기 로드 완료 상태 (사용자의 필터 변경과 구분)
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

    // 로딩 상태를 ref로 관리하여 useCallback 의존성 문제 해결
    const loadingRef = useRef(false);

    // HTML 엔티티 디코딩 함수
    const decodeHtmlEntities = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
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



    // 초기 데이터 로드
    const loadInitialData = useCallback(async (searchQuery?: string, isInitialLoad = false) => {
        // 이미 로딩 중인 경우 중복 호출 방지
        if (loadingRef.current) {
            console.log('🚫 Already loading, skipping duplicate call', { searchQuery, isInitialLoad });
            return;
        }

        console.log('🚀 loadInitialData called', {
            searchQuery,
            isInitialLoad,
            siteParam,
            sortBy,
            topPeriod,
            timestamp: new Date().toISOString(),
            stack: new Error().stack?.split('\n')[1]?.trim()
        });

        try {
            loadingRef.current = true;
            setLoading(true);
            setShowTopLoadingBar(true);
            setError(null);

            const postsResult = await ApiService.getPopularPosts(
                1,
                10,
                undefined, // 첫 조회 시에는 maxNo 없음
                siteParam || undefined, // site 파라미터 전달
                searchQuery, // keyword 파라미터 전달
                sortBy, // sortBy 파라미터 전달
                topPeriod // topPeriod 파라미터 전달
            );

            setPosts(postsResult.data);
            setCurrentPage(postsResult.page);
            setTotalCount(postsResult.totalCount);
            setHasMore(postsResult.hasNextPage);

            // 조회된 데이터 중 가장 큰 no 값을 maxNo로 저장
            if (postsResult.data.length > 0) {
                const currentMaxNo = Math.max(...postsResult.data.map(post => post.no));
                setMaxNo(currentMaxNo);
            }

            // 초기 로드 완료 표시
            if (isInitialLoad && !initialLoadCompleted) {
                setInitialLoadCompleted(true);
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            setError('데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setShowTopLoadingBar(false);
        }
    }, [siteParam, sortBy, topPeriod, initialLoadCompleted]); // sortBy, topPeriod 의존성 추가


    // 더 많은 포스트 로드
    const loadMorePosts = useCallback(async () => {
        if (loading || !hasMore) {
            return;
        }

        try {
            setLoading(true);
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                setShowTopLoadingBar(true);
            }

            const result = await ApiService.getPopularPosts(
                currentPage + 1,
                10,
                maxNo, // 중복 방지를 위해 maxNo 전달
                siteParam || undefined, // site 파라미터 전달
                searchKeywordRef.current || undefined, // keyword 파라미터 전달
                sortBy, // sortBy 파라미터 전달
                topPeriod // topPeriod 파라미터 전달
            );

            setPosts(prev => [...prev, ...result.data]);
            setCurrentPage(result.page);
            setHasMore(result.hasNextPage);

            // 추가 조회된 데이터 중 가장 큰 no 값으로 maxNo 업데이트
            if (result.data.length > 0) {
                const newMaxNo = Math.max(...result.data.map(post => post.no));
                setMaxNo(prev => prev ? Math.max(prev, newMaxNo) : newMaxNo);
            }
        } catch (error) {
            console.error('추가 포스트 로드 실패:', error);
            setError('추가 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setShowTopLoadingBar(false);
        }
    }, [currentPage, loading, hasMore, maxNo, siteParam, sortBy, topPeriod]);

    // 홈 버튼 클릭 시 새글 불러오기, 최상단 스크롤, 검색 필터만 초기화
    const handleHomeClick = () => {
        // 즉시 스크롤 먼저 실행
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 검색 필터 제거
        handleClearSearch();

        // 데이터 로드
        loadInitialData();
    };

    // 검색 실행
    const handleSearch = useCallback((keyword: string) => {
        const trimmedKeyword = keyword.trim();
        setSearchKeyword(trimmedKeyword);
        searchKeywordRef.current = trimmedKeyword;
        setIsSearchMode(!!trimmedKeyword);
        setCurrentPage(1);
        setPosts([]);

        // localStorage에 검색 키워드 저장
        if (trimmedKeyword) {
            StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, trimmedKeyword);
        } else {
            StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');
        }

        loadInitialData(trimmedKeyword || undefined);
    }, [loadInitialData]);

    // 검색 취소
    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
        searchKeywordRef.current = '';
        setIsSearchMode(false);
        setCurrentPage(1);
        setPosts([]);

        // localStorage에서 검색 키워드 제거
        StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');

        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        // 쿼리 파라미터가 변경될 때마다 실행되지만, 초기 설정이 완료된 후에만 실행
        // keywordParam이 있을 때는 초기 로드 useEffect에서 처리하므로 여기서는 실행하지 않음
        if (isSettingsLoaded && !isRestoringSettings && !keywordParam) {
            console.log('🔄 Site param useEffect triggered:', {
                siteParam,
                isSettingsLoaded,
                isRestoringSettings,
                keywordParam,
                timestamp: new Date().toISOString()
            });
            loadInitialData();
        }
    }, [siteParam, isSettingsLoaded, isRestoringSettings, loadInitialData, keywordParam])

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

    // 안 본 글만 보기 토글
    const toggleUnreadOnly = () => {
        const newShowUnreadOnly = !showUnreadOnly;
        setShowUnreadOnly(newShowUnreadOnly);
        StorageUtils.setBoolean(STORAGE_KEYS.SHOW_UNREAD_ONLY, newShowUnreadOnly);
    };

    // 공통 리프레시 함수 - URL로 강제 이동 (검색 초기화 포함)
    const refreshPage = (href: string) => {
        // 사이드바 네비게이션 시 검색 상태 초기화
        StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, '');
        window.location.href = href;
    };

    // 컴포넌트 마운트 시 데이터 로드
    const isInitialLoadRef = useRef<boolean>(false);

    useEffect(() => {
        if (isSettingsLoaded && !isRestoringSettings && !isInitialLoadRef.current) {
            console.log('🎯 Initial load useEffect triggered:', {
                isSettingsLoaded,
                isRestoringSettings,
                isInitialLoadRef: isInitialLoadRef.current,
                keywordParam,
                timestamp: new Date().toISOString()
            });

            const searchKeywordToUse = keywordParam || (isSearchMode ? searchKeywordRef.current : undefined);
            console.log('🔍 Initial load with keyword:', { keywordParam, searchKeywordToUse, isSearchMode });
            loadInitialData(searchKeywordToUse, true); // isInitialLoad = true

            isInitialLoadRef.current = true;
        }
    }, [isSettingsLoaded, isRestoringSettings, loadInitialData, keywordParam, isSearchMode]);

    // 설정 복원 함수
    const restoreSettings = useCallback(() => {
        if (typeof window === 'undefined') return;

        // 다크 모드 설정
        const savedTheme = StorageUtils.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

        // 새창 모드 설정
        const savedNewWindowMode = StorageUtils.getBoolean(STORAGE_KEYS.NEW_WINDOW_MODE, false);

        // 검색 키워드 복원 (URL 파라미터 우선, 그 다음 localStorage)
        const urlKeyword = keywordParam;
        const savedSearchKeyword = urlKeyword || StorageUtils.getItem(STORAGE_KEYS.SEARCH_KEYWORD);

        // 읽은 글 목록 복원
        const savedReadPosts = StorageUtils.getItem(STORAGE_KEYS.READ_POSTS);

        // 안 본 글만 보기 설정 복원
        const savedShowUnreadOnly = StorageUtils.getBoolean(STORAGE_KEYS.SHOW_UNREAD_ONLY, false);

        // 상태 일괄 업데이트
        setIsDarkMode(shouldUseDarkMode);
        if (shouldUseDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setIsNewWindowMode(savedNewWindowMode);

        if (savedSearchKeyword) {
            setSearchKeyword(savedSearchKeyword);
            searchKeywordRef.current = savedSearchKeyword;
            setIsSearchMode(true);

            // URL 파라미터로 받은 키워드는 localStorage에도 저장
            if (urlKeyword) {
                StorageUtils.setItem(STORAGE_KEYS.SEARCH_KEYWORD, urlKeyword);
            }
        }

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

        setShowUnreadOnly(savedShowUnreadOnly);

        // 페이지 접속 로그 기록
        ApiService.logAccess().then(() => {
            console.log('Access logged successfully');
        }).catch((error) => {
            console.warn('Failed to log access:', error);
        });

        // 설정 복원 완료 표시
        setIsRestoringSettings(false);
        setIsSettingsLoaded(true);
    }, [keywordParam]);

    // 초기 설정 복원
    useEffect(() => {
        restoreSettings();
    }, [restoreSettings]);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSortDropdownOpen && !(event.target as Element).closest('.issue-dropdown')) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortDropdownOpen]);

    // 백엔드에서 필터링된 포스트를 받고, 클라이언트에서 안 본 글 필터링
    const filteredPosts = showUnreadOnly
        ? posts.filter(post => !isPostRead(`${post.site}-${post.no}`))
        : posts;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">

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
                onNavigate={refreshPage}
            />

            <div className="flex flex-col lg:flex-row">
                {/* Desktop Sidebar */}
                <Sidebar onNavigate={refreshPage} />

                {/* Main Content */}
                <main className="flex-1 p-4 max-w-4xl">
                    {/* Trending Communities - Reddit Style */}
                    <TrendingCommunities
                        onPostClick={(postId) => {
                            // 쿼리 파라미터로 상세뷰 열기
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('postId', postId);
                            router.push(`/?${params.toString()}`, { scroll: false });
                        }}
                    />

                    {/* 정렬 드롭다운 - Reddit 스타일 */}
                    <div className="mb-4 relative issue-dropdown">
                        <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {sortBy === 'hot' && '인기순'}
                                {sortBy === 'new' && '최신순'}
                                {sortBy === 'top' && `추천순 (${topPeriod === 'today' ? '오늘' : topPeriod === 'week' ? '이번주' : topPeriod === 'month' ? '이번달' : '전체'})`}
                                {sortBy === 'rising' && '급상승'}
                            </span>
                            <svg
                                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {isSortDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                                {/* 정렬 기준 헤더 */}
                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">정렬 기준</span>
                                </div>

                                <button
                                    onClick={() => {
                                        setSortBy('hot');
                                        setIsSortDropdownOpen(false);
                                        setPosts([]);
                                        setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === 'hot' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    인기순
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('new');
                                        setIsSortDropdownOpen(false);
                                        setPosts([]);
                                        setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === 'new' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    최신순
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('rising');
                                        setIsSortDropdownOpen(false);
                                        setPosts([]);
                                        setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === 'rising' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                    급상승
                                </button>

                                {/* 추천순 - 서브메뉴 포함 */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTopPeriodOpen(!isTopPeriodOpen)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${sortBy === 'top' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span>추천순</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isTopPeriodOpen ? 'rotate-90' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* 추천순 기간 선택 서브메뉴 */}
                                    {isTopPeriodOpen && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                            <button
                                                onClick={() => {
                                                    setSortBy('top');
                                                    setTopPeriod('today');
                                                    setIsSortDropdownOpen(false);
                                                    setIsTopPeriodOpen(false);
                                                    setPosts([]);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${sortBy === 'top' && topPeriod === 'today' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                                            >
                                                오늘
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy('top');
                                                    setTopPeriod('week');
                                                    setIsSortDropdownOpen(false);
                                                    setIsTopPeriodOpen(false);
                                                    setPosts([]);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${sortBy === 'top' && topPeriod === 'week' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                                            >
                                                이번주
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy('top');
                                                    setTopPeriod('month');
                                                    setIsSortDropdownOpen(false);
                                                    setIsTopPeriodOpen(false);
                                                    setPosts([]);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${sortBy === 'top' && topPeriod === 'month' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                                            >
                                                이번달
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortBy('top');
                                                    setTopPeriod('all');
                                                    setIsSortDropdownOpen(false);
                                                    setIsTopPeriodOpen(false);
                                                    setPosts([]);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-8 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${sortBy === 'top' && topPeriod === 'all' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                                            >
                                                전체
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
                    {loading && posts.length === 0 && !searchKeyword && (
                        <div className="flex justify-center items-center py-8">
                            <img src="/cat_in_a_rocket_loading.gif" alt="로딩 중" />
                        </div>
                    )}

                    {/* Loading Search Results */}
                    {loading && posts.length === 0 && isSearchMode && (
                        <div className="flex justify-center items-center py-8">
                            <img src="/cat_in_a_rocket_loading.gif" alt="검색 중" />
                        </div>
                    )}

                    {/* Posts */}
                    <div className="space-y-4">
                        {filteredPosts.map((post, index) => {
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
                                                        <span><span className="hidden sm:inline">Posted by </span>{post.author}</span>
                                                        <span className="mx-1">•</span>
                                                    </>
                                                )}
                                                <span>{formatDate(post.date)}</span>
                                                {post.url && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        <a
                                                            href={post.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-500 hover:text-orange-600 flex items-center"
                                                            onClick={() => markPostAsRead(postId)}
                                                        >
                                                            원본 링크
                                                            <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    </>
                                                )}
                                            </div>

                                            {(post.optimizedImagesList && post.optimizedImagesList.length > 0) ? (
                                                <h2
                                                    className={`text-lg font-semibold mb-2 hover:text-orange-500 cursor-pointer ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                                                        }`}
                                                    onClick={() => {
                                                        markPostAsRead(postId);
                                                        // 쿼리 파라미터로 상세뷰 열기
                                                        const params = new URLSearchParams(searchParams.toString());
                                                        params.set('postId', postId);
                                                        router.push(`/?${params.toString()}`, { scroll: false });
                                                    }}
                                                >
                                                    {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                                                </h2>
                                            ) : post.url ? (
                                                <a
                                                    href={post.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`text-lg font-semibold mb-2 hover:text-orange-500 cursor-pointer block ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                                                        }`}
                                                    onClick={() => markPostAsRead(postId)}
                                                >
                                                    {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                                                    <svg className="inline-block ml-1 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
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
                                                    title={post.title}
                                                />
                                            ) : post.cloudinary_url && (
                                                <div className="mb-3">
                                                    <div className="inline-block bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <img
                                                            src={post.cloudinary_url}
                                                            alt="썸네일"
                                                            className={`max-w-[160px] max-h-[160px] object-cover rounded-lg ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                                                }`}
                                                            loading="lazy"
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
                        })}
                    </div>

                    {/* Loading More Posts */}
                    {loading && posts.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">새로운 포스트를 불러오는 중...</span>
                            </div>
                        </div>
                    )}

                    {/* End of Posts Message */}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                모든 포스트를 확인했습니다! (총 {totalCount}개)
                            </p>
                        </div>
                    )}

                    {/* No Posts Message */}
                    {/* {!loading && posts.length === 0 && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">아직 포스트가 없습니다.</p>
                        </div>
                    )} */}

                </main>
            </div>

            {/* 상세뷰 오버레이 - 쿼리 파라미터로 제어 */}
            {postIdParam && (
                <PostDetailOverlay
                    postId={postIdParam}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                    onClose={() => {
                        // postId 파라미터만 제거하고 나머지는 유지
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('postId');
                        const newUrl = params.toString() ? `/?${params.toString()}` : '/';
                        router.push(newUrl, { scroll: false });
                    }}
                />
            )}

        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}