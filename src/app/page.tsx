'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService, SiteBbsInfo } from '@/lib/api';

// localStorage 키 상수
const STORAGE_KEYS = {
    THEME: 'shooq-theme',
    NEW_WINDOW_MODE: 'shooq-newWindowMode',
    SELECTED_SITES: 'shooq-selectedSites',
    SEARCH_KEYWORD: 'shooq-searchKeyword',
    SORT_TYPE: 'shooq-sortType',
    READ_POSTS: 'shooq-readPosts',
    SHOW_UNREAD_ONLY: 'shooq-showUnreadOnly'
} as const;

// 정렬 타입 상수
const SORT_TYPES = {
    DATE: 'latest',
    VIEWS: 'views',
    LIKES: 'popular',
    REPLY_NUM: 'comments'
} as const;

type SortType = typeof SORT_TYPES[keyof typeof SORT_TYPES];

// 정렬 옵션 정보
const SORT_OPTIONS = [
    { key: SORT_TYPES.DATE, label: '최신글', icon: 'clock' },
    { key: SORT_TYPES.VIEWS, label: '조회순', icon: 'eye' },
    { key: SORT_TYPES.LIKES, label: '인기순', icon: 'heart' },
    { key: SORT_TYPES.REPLY_NUM, label: '댓글순', icon: 'chat' }
] as const;

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
    const searchKeywordRef = useRef('');

    // 정렬 상태 (기본값: 최신글)
    const [sortType, setSortType] = useState<SortType>(SORT_TYPES.DATE);

    // 사이드바 호버 상태
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isMobileSidebarHovered, setIsMobileSidebarHovered] = useState(false);

    // 읽은 글 관리
    const [readPosts, setReadPosts] = useState<Set<string>>(new Set());

    // 정렬 드롭다운 상태
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    // 로딩바 상태
    const [showTopLoadingBar, setShowTopLoadingBar] = useState(false);

    // 안 본 글만 보기 모드
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // HTML 엔티티 디코딩 함수
    const decodeHtmlEntities = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // 아이콘 렌더링 함수
    const renderSortIcon = (iconType: string) => {
        switch (iconType) {
            case 'clock':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'eye':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                );
            case 'heart':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
            case 'chat':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            default:
                return null;
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
            'SlrClub': 'rgb(66, 116, 175)',   // Blue
            'Ruliweb': 'rgb(255, 102, 0)',    // Orange
            '82Cook': 'rgb(230, 230, 230)',
            'MlbPark': 'rgb(65, 106, 220)',
            'BobaeDream': 'rgb(16, 90, 174)',
            'Inven': 'rgb(240, 255, 255)',
        } as const;
        return siteColors[site as keyof typeof siteColors] || 'rgb(107, 114, 128)'; // Default gray
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
        } as const;

        return logoData[site as keyof typeof logoData] || { letter: '?', bgColor: 'rgb(107, 114, 128)', textColor: 'white' };
    };

    // 사이트 분류 함수
    const categorizeSites = (sitesList: string[]) => {
        const newsSites = ['NaverNews', 'GoogleNews'];
        const communitySites = sitesList.filter(site => !newsSites.includes(site));

        return {
            news: sitesList.filter(site => newsSites.includes(site)),
            community: communitySites
        };
    };

    // 초기 데이터 로드
    const loadInitialData = useCallback(async (filterSites?: string[], searchQuery?: string) => {
        try {
            setLoading(true);
            setShowTopLoadingBar(true);
            setError(null);

            const sitesArray = filterSites || (selectedSites.size > 0 ? Array.from(selectedSites) : undefined);

            const sortByValue = sortType;
            const [postsResult, sitesResult] = await Promise.all([
                ApiService.getPosts(
                    1,
                    10,
                    undefined,
                    sitesArray,
                    sortByValue,
                    searchQuery
                ),
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
            setShowTopLoadingBar(false);
        }
    }, [selectedSites, sortType]);


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
            const sitesArray = selectedSites.size > 0 ? Array.from(selectedSites) : undefined;
            const sortByValue = sortType;
            const result = await ApiService.getPosts(
                currentPage + 1,
                10,
                undefined,
                sitesArray,
                sortByValue,
                isSearchMode ? searchKeywordRef.current : undefined
            );

            setPosts(prev => [...prev, ...result.data]);
            setCurrentPage(result.page);
            setHasMore(result.hasNextPage);
        } catch (error) {
            console.error('추가 포스트 로드 실패:', error);
            setError('추가 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setShowTopLoadingBar(false);
        }
    }, [currentPage, loading, hasMore, selectedSites, isSearchMode, sortType]);

    // 홈 버튼 클릭 시 새글 불러오기, 최상단 스크롤, 사이트/검색 필터만 초기화
    const handleHomeClick = () => {
        console.log('Home button clicked');
        // 즉시 스크롤 먼저 실행
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 사이트 필터와 검색 필터만 제거 (안본글/새창/다크모드는 유지)
        clearAllFilters(); // 사이트 필터 제거
        handleClearSearch(); // 검색 필터 제거

        // 데이터 로드는 약간 지연 후 실행
        //setTimeout(() => {
        loadInitialData();
        //}, 100);
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

        loadInitialData(undefined, trimmedKeyword || undefined);
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

    // 정렬 방식 변경 시 데이터 리로드
    useEffect(() => {
        setPosts([]);
        setCurrentPage(1);
        loadInitialData();
    }, [sortType, loadInitialData]);

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

    // 정렬 방식 변경
    const changeSortType = (newSortType: SortType) => {
        setSortType(newSortType);
        StorageUtils.setItem(STORAGE_KEYS.SORT_TYPE, newSortType);
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
    }, [selectedSites, sites.length, isSearchMode, loadInitialData]);

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
                searchKeywordRef.current = savedSearchKeyword;
                setIsSearchMode(true);
            }

            // 정렬 상태 복원
            const savedSortType = StorageUtils.getItem(STORAGE_KEYS.SORT_TYPE, SORT_TYPES.DATE);
            if (Object.values(SORT_TYPES).includes(savedSortType as SortType)) {
                setSortType(savedSortType as SortType);
            }

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

            // 안 본 글만 보기 설정 복원 (기본값: false)
            const savedShowUnreadOnly = StorageUtils.getBoolean(STORAGE_KEYS.SHOW_UNREAD_ONLY, false);
            setShowUnreadOnly(savedShowUnreadOnly);

            console.log('Settings loaded:', {
                theme: savedTheme || (prefersDark ? 'dark (system)' : 'light (system)'),
                newWindowMode: savedNewWindowMode,
                searchKeyword: savedSearchKeyword,
                selectedSites: Array.from(savedSelectedSites),
                sortType: savedSortType,
                showUnreadOnly: savedShowUnreadOnly
            });

            // 페이지 접속 로그 기록
            ApiService.logAccess().then(() => {
                console.log('Access logged successfully');
            }).catch((error) => {
                console.warn('Failed to log access:', error);
            });
        }
    }, []);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSortDropdownOpen && !(event.target as Element).closest('.sort-dropdown')) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortDropdownOpen]);

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

    // 백엔드에서 필터링된 포스트를 받고, 클라이언트에서 안 본 글 필터링
    const filteredPosts = showUnreadOnly
        ? posts.filter(post => !isPostRead(`${post.site}-${post.no}`))
        : posts;

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
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="flex">
                    {/* Left sidebar area - Logo */}
                    <div className="w-80 flex-shrink-0 px-4 py-3 hidden lg:flex items-center">
                        <button
                            type="button"
                            onClick={handleHomeClick}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">shooq</span>
                        </button>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 px-4 py-3">
                        <div className="max-w-4xl relative flex items-center justify-start space-x-4">
                            {/* Mobile Logo and Hamburger Menu */}
                            <div className="lg:hidden flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={handleHomeClick}
                                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">shooq</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                            </div>

                            <div className="flex-1 max-w-lg ml-2 sm:ml-4">
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
                                        placeholder="shooq 검색"
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

                            <div className="absolute right-4 flex items-center space-x-2 sm:space-x-4">
                                {/* Unread Only Mode Toggle */}
                                <button
                                    type="button"
                                    onClick={toggleUnreadOnly}
                                    className={`p-2 text-gray-600 dark:text-gray-300 rounded-full ${showUnreadOnly ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}`}
                                    aria-label="안 본 글만 보기 토글"
                                    title={showUnreadOnly ? "안 본 글만 보기: 켜짐" : "안 본 글만 보기: 꺼짐"}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {showUnreadOnly && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>

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
                </div>
            </header>

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


                        {/* 정렬 방식 선택 - 모바일 */}
                        <div className="relative mb-4 sort-dropdown">
                            <button
                                type="button"
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="w-full flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-800 font-medium py-3 px-3 rounded-lg transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    {renderSortIcon(SORT_OPTIONS.find(option => option.key === sortType)?.icon || 'clock')}
                                    <span>{SORT_OPTIONS.find(option => option.key === sortType)?.label || '최신글'}</span>
                                </div>
                                <svg className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isSortDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                    {SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => {
                                                changeSortType(option.key);
                                                setIsSortDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center space-x-3 py-3 px-3 text-left hover:bg-gray-700 transition-colors ${sortType === option.key ? 'text-orange-400 bg-gray-700' : 'text-gray-300'
                                                } ${option.key === SORT_OPTIONS[0].key ? 'rounded-t-lg' : ''} ${option.key === SORT_OPTIONS[SORT_OPTIONS.length - 1].key ? 'rounded-b-lg' : ''}`}
                                        >
                                            {renderSortIcon(option.icon)}
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 경계선 */}
                        <div className="border-b border-gray-700 mb-4"></div>

                        <div
                            className={`flex-1 overflow-y-auto ${!isMobileSidebarHovered ? '[&::-webkit-scrollbar]:hidden' : '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent'}`}
                            onMouseEnter={() => setIsMobileSidebarHovered(true)}
                            onMouseLeave={() => setIsMobileSidebarHovered(false)}
                            style={{
                                scrollbarWidth: isMobileSidebarHovered ? 'thin' : 'none',
                                scrollbarColor: isMobileSidebarHovered ? 'rgb(107, 114, 128) transparent' : 'transparent transparent',
                            } as React.CSSProperties}
                        >
                            {sites.length > 0 ? (
                                (() => {
                                    const { news, community } = categorizeSites(sites);
                                    return (
                                        <div className="space-y-6 pr-2">
                                            {/* 뉴스 섹션 */}
                                            {news.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-medium text-gray-400 text-sm uppercase tracking-wide">뉴스 ({news.length}개)</h3>
                                                        {selectedSites.size > 0 && news.some(site => selectedSites.has(site)) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSet = new Set(selectedSites);
                                                                    news.forEach(site => newSet.delete(site));
                                                                    setSelectedSites(newSet);
                                                                }}
                                                                className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                                                            >
                                                                뉴스 해제
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {news.map((site) => {
                                                            const isSelected = selectedSites.has(site);
                                                            return (
                                                                <div key={site} className="flex items-center justify-between py-3 px-3 hover:bg-gray-800 rounded-lg transition-colors">
                                                                    <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleSiteFilter(site)}>
                                                                        <div
                                                                            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                                            style={{
                                                                                backgroundColor: getSiteLogo(site).bgColor,
                                                                                color: getSiteLogo(site).textColor
                                                                            }}
                                                                        >
                                                                            {getSiteLogo(site).letter}
                                                                        </div>
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
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 커뮤니티 섹션 */}
                                            {community.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-medium text-gray-400 text-sm uppercase tracking-wide">커뮤니티 ({community.length}개)</h3>
                                                        {selectedSites.size > 0 && community.some(site => selectedSites.has(site)) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSet = new Set(selectedSites);
                                                                    community.forEach(site => newSet.delete(site));
                                                                    setSelectedSites(newSet);
                                                                }}
                                                                className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                                                            >
                                                                커뮤니티 해제
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {community.map((site) => {
                                                            const isSelected = selectedSites.has(site);
                                                            return (
                                                                <div key={site} className="flex items-center justify-between py-3 px-3 hover:bg-gray-800 rounded-lg transition-colors">
                                                                    <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleSiteFilter(site)}>
                                                                        <div
                                                                            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                                            style={{
                                                                                backgroundColor: getSiteLogo(site).bgColor,
                                                                                color: getSiteLogo(site).textColor
                                                                            }}
                                                                        >
                                                                            {getSiteLogo(site).letter}
                                                                        </div>
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
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 전체 해제 버튼 */}
                                            {selectedSites.size > 0 && (
                                                <div className="pt-2 border-t border-gray-700">
                                                    <button
                                                        type="button"
                                                        onClick={clearAllFilters}
                                                        className="w-full text-xs text-orange-400 hover:text-orange-300 px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                                                    >
                                                        전체 해제
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-8rem)] flex flex-col">

                            {/* 정렬 방식 선택 - 데스크탑 */}
                            <div className="relative mb-4 sort-dropdown">
                                <button
                                    type="button"
                                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    className="w-full flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold py-3 px-2 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        {renderSortIcon(SORT_OPTIONS.find(option => option.key === sortType)?.icon || 'clock')}
                                        <span>{SORT_OPTIONS.find(option => option.key === sortType)?.label || '최신글'}</span>
                                    </div>
                                    <svg className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isSortDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.key}
                                                type="button"
                                                onClick={() => {
                                                    changeSortType(option.key);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center space-x-3 py-3 px-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${sortType === option.key ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'text-gray-700 dark:text-gray-300'
                                                    } ${option.key === SORT_OPTIONS[0].key ? 'rounded-t-lg' : ''} ${option.key === SORT_OPTIONS[SORT_OPTIONS.length - 1].key ? 'rounded-b-lg' : ''}`}
                                            >
                                                {renderSortIcon(option.icon)}
                                                <span>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 경계선 */}
                            <div className="border-b border-gray-100 dark:border-gray-700 mb-4"></div>
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
                                {sites.length > 0 ? (
                                    (() => {
                                        const { news, community } = categorizeSites(sites);
                                        return (
                                            <div className="space-y-6 pr-2">
                                                {/* 뉴스 섹션 */}
                                                {news.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">뉴스 ({news.length}개)</h3>
                                                            {selectedSites.size > 0 && news.some(site => selectedSites.has(site)) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSet = new Set(selectedSites);
                                                                        news.forEach(site => newSet.delete(site));
                                                                        setSelectedSites(newSet);
                                                                    }}
                                                                    className="text-xs text-orange-500 hover:text-orange-600 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                                                                >
                                                                    뉴스 해제
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {news.map((site) => {
                                                                const isSelected = selectedSites.has(site);
                                                                return (
                                                                    <div key={site} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                                        <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleSiteFilter(site)}>
                                                                            <div
                                                                                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                                                style={{
                                                                                    backgroundColor: getSiteLogo(site).bgColor,
                                                                                    color: getSiteLogo(site).textColor
                                                                                }}
                                                                            >
                                                                                {getSiteLogo(site).letter}
                                                                            </div>
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
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 커뮤니티 섹션 */}
                                                {community.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">커뮤니티 ({community.length}개)</h3>
                                                            {selectedSites.size > 0 && community.some(site => selectedSites.has(site)) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSet = new Set(selectedSites);
                                                                        community.forEach(site => newSet.delete(site));
                                                                        setSelectedSites(newSet);
                                                                    }}
                                                                    className="text-xs text-orange-500 hover:text-orange-600 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                                                                >
                                                                    커뮤니티 해제
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {community.map((site) => {
                                                                const isSelected = selectedSites.has(site);
                                                                return (
                                                                    <div key={site} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                                        <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleSiteFilter(site)}>
                                                                            <div
                                                                                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                                                style={{
                                                                                    backgroundColor: getSiteLogo(site).bgColor,
                                                                                    color: getSiteLogo(site).textColor
                                                                                }}
                                                                            >
                                                                                {getSiteLogo(site).letter}
                                                                            </div>
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
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 전체 해제 버튼 */}
                                                {selectedSites.size > 0 && (
                                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                        <button
                                                            type="button"
                                                            onClick={clearAllFilters}
                                                            className="w-full text-xs text-orange-500 hover:text-orange-600 px-3 py-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                                                        >
                                                            전체 해제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
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
                            {/* PC에서는 상단 로딩바를 사용하므로 로딩 애니메이션 숨김 */}
                            <div className="lg:hidden">
                                <img src="/cat_in_a_rocket_loading.gif" alt="로딩 중" />
                            </div>
                            {/* PC에서만 표시되는 간단한 텍스트 */}
                            <div className="hidden lg:block text-center">
                                <p className="text-gray-500 dark:text-gray-400">데이터를 불러오는 중...</p>
                            </div>
                        </div>
                    )}

                    {/* Loading Search Results */}
                    {loading && posts.length === 0 && isSearchMode && (
                        <div className="flex justify-center items-center py-8">
                            {/* 모바일에서는 기존 애니메이션 사용 */}
                            <div className="lg:hidden">
                                <img src="/cat_in_a_rocket_loading.gif" alt="검색 중" />
                            </div>
                            {/* PC에서는 간단한 텍스트 */}
                            <div className="hidden lg:block text-center">
                                <p className="text-gray-500 dark:text-gray-400">검색 중...</p>
                            </div>
                        </div>
                    )}

                    {/* Posts */}
                    <div className="space-y-4">
                        {filteredPosts.map((post, index) => {
                            const postId = `${post.site}-${post.no}`;
                            const isRead = isPostRead(postId);

                            return (
                                <article key={`post-${post.no}-${index}`} className={`rounded-lg border transition-colors ${isRead
                                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}>
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

                                        {post.content && (
                                            <p className={`text-sm mb-3 ${isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {post.url ? (
                                                    <a
                                                        href={post.url}
                                                        target={isNewWindowMode ? "_blank" : "_self"}
                                                        rel={isNewWindowMode ? "noopener noreferrer" : undefined}
                                                        className="hover:text-orange-500 cursor-pointer"
                                                        onClick={() => markPostAsRead(postId)}
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
                                            {post.replyNum && (
                                                <div className="flex items-center space-x-1 px-2 py-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="hidden sm:inline">{post.replyNum} 답글</span>
                                                    <span className="sm:hidden">{post.replyNum}</span>
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
                        })}
                    </div>

                    {/* Loading More Posts */}
                    {loading && posts.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            {/* 모바일에서는 스피너와 텍스트 표시 */}
                            <div className="lg:hidden flex items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">새로운 포스트를 불러오는 중...</span>
                            </div>
                            {/* PC에서는 상단 로딩바가 있으므로 간단한 텍스트만 */}
                            <div className="hidden lg:block text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">추가 게시물 로딩 중...</p>
                            </div>
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
                    {/* {!loading && posts.length === 0 && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">아직 포스트가 없습니다.</p>
                        </div>
                    )} */}

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

        </div>
    );
}