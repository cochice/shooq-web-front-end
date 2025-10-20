'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiService, SiteBbsInfo } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ADULT_CONTENT_KEYWORDS, STORAGE_KEYS } from '@/constants/content';
import { StorageUtils } from '@/utils/storage';

// 주차 계산 유틸리티 (월요일 기준)
const WeekUtils = {
    // 해당 월의 주차 수 계산 (간단한 방식: 7일 단위)
    getWeeksInMonth: (year: number, month: number): number => {
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();

        // 월의 총 일수를 7로 나누어 주차 수 계산 (더 직관적)
        return Math.ceil(daysInMonth / 7);
    },

    // 현재 주차 계산 (간단한 방식: 날짜 기준)
    getCurrentWeek: (year: number, month: number): number => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();

        // 다른 년월인 경우 첫주 반환 (1주차)
        if (year !== currentYear || month !== currentMonth) {
            return 1;
        }

        // 현재 날짜를 7로 나누어 주차 계산 (1일~7일=1주차, 8일~14일=2주차...)
        return Math.ceil(currentDate / 7);
    },

    // 미래 주차인지 확인 (간단한 방식)
    isFutureWeek: (year: number, month: number, week: number): boolean => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        if (year > currentYear) return true;
        if (year < currentYear) return false;
        if (month > currentMonth) return true;
        if (month < currentMonth) return false;

        const currentWeek = WeekUtils.getCurrentWeek(year, month);
        return week > currentWeek;
    },

    // 해당 주차의 월요일 날짜 계산
    getMondayOfWeek: (year: number, month: number, week: number): Date => {
        const firstDay = new Date(year, month - 1, 1);
        const firstWeekDay = firstDay.getDay();
        const adjustedFirstWeekDay = firstWeekDay === 0 ? 7 : firstWeekDay;
        const daysToFirstMonday = adjustedFirstWeekDay === 1 ? 1 : 8 - adjustedFirstWeekDay + 1;

        const mondayDate = daysToFirstMonday + (week - 1) * 7;
        return new Date(year, month - 1, mondayDate);
    }
};

function WeekContent() {
    const searchParams = useSearchParams();
    const yearParam = searchParams.get('yyyy');
    const monthParam = searchParams.get('mm');
    const weekParam = searchParams.get('w');
    const siteParam = searchParams.get('site');

    // 현재 날짜 기준으로 기본값 설정
    const today = new Date();
    const currentYear = parseInt(yearParam || today.getFullYear().toString());
    const currentMonth = parseInt(monthParam || (today.getMonth() + 1).toString());
    const currentWeek = parseInt(weekParam || WeekUtils.getCurrentWeek(currentYear, currentMonth).toString());

    const [overallPosts, setOverallPosts] = useState<SiteBbsInfo[]>([]);
    const [sitePosts, setSitePosts] = useState<{ [site: string]: SiteBbsInfo[] }>({});
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNewWindowMode, setIsNewWindowMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [readPosts, setReadPosts] = useState<Set<string>>(new Set());
    const [showTopLoadingBar, setShowTopLoadingBar] = useState(false);

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

    // 커뮤니티 순서 정의
    const communityOrder = [
        'TheQoo', 'Ppomppu', 'Ruliweb', 'Inven',
        'MlbPark', 'Clien', 'BobaeDream', 'Humoruniv', '82Cook',
        'SlrClub', 'Damoang', 'TodayHumor', 'FMKorea'
    ];

    // 주간 데이터 로드
    const loadWeeklyData = useCallback(async () => {
        try {
            setLoading(true);
            setShowTopLoadingBar(true);
            setError(null);

            // getWeek API 호출로 주간 데이터 가져오기
            const weekResult = await ApiService.getWeek(
                currentYear.toString(),
                String(currentMonth).padStart(2, '0'),
                currentWeek.toString()
            );

            // gubun 값에 따라 데이터 분류
            const overall: SiteBbsInfo[] = [];
            const sitePostsMap: { [site: string]: SiteBbsInfo[] } = {};

            weekResult.data.forEach((post) => {
                if (post.gubun === '01') {
                    // 전체 커뮤니티 상위 20개
                    overall.push(post);
                } else if (post.gubun === '02') {
                    // 커뮤니티별 데이터
                    if (post.site) {
                        if (!sitePostsMap[post.site]) {
                            sitePostsMap[post.site] = [];
                        }
                        sitePostsMap[post.site].push(post);
                    }
                }
            });

            // 전체 게시글 상위 20개로 제한
            setOverallPosts(overall.slice(0, 20));

            // 사이트별 게시글 정렬 (지정된 순서대로) 및 각 10개로 제한
            const orderedSitePosts: { [site: string]: SiteBbsInfo[] } = {};
            communityOrder.forEach(site => {
                if (sitePostsMap[site]) {
                    orderedSitePosts[site] = sitePostsMap[site].slice(0, 10);
                }
            });

            // 정의된 순서에 없는 사이트들도 추가
            Object.keys(sitePostsMap).forEach(site => {
                if (!communityOrder.includes(site)) {
                    orderedSitePosts[site] = sitePostsMap[site].slice(0, 10);
                }
            });

            setSitePosts(orderedSitePosts);

        } catch (error) {
            console.error('주간 데이터 로드 실패:', error);
            setError('주간 데이터를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } finally {
            setLoading(false);
            setShowTopLoadingBar(false);
        }
    }, [currentYear, currentMonth, currentWeek]);

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

    // 공통 리프레시 함수 - URL로 강제 이동
    const refreshPage = (href: string) => {
        window.location.href = href;
    };

    // 홈 버튼 클릭 시 주간 첫 페이지로 이동
    const handleHomeClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const today = new Date();
        const url = `/week?yyyy=${today.getFullYear()}&mm=${today.getMonth() + 1}&w=${WeekUtils.getCurrentWeek(today.getFullYear(), today.getMonth() + 1)}`;
        window.location.href = url;
    };

    // 설정 복원 함수
    const restoreSettings = useCallback(() => {
        if (typeof window === 'undefined') return;

        // 다크 모드 설정
        const savedTheme = StorageUtils.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

        // 새창 모드 설정
        const savedNewWindowMode = StorageUtils.getBoolean(STORAGE_KEYS.NEW_WINDOW_MODE, false);

        // 읽은 글 목록 복원
        const savedReadPosts = StorageUtils.getItem(STORAGE_KEYS.READ_POSTS);

        // 상태 일괄 업데이트
        setIsDarkMode(shouldUseDarkMode);
        if (shouldUseDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setIsNewWindowMode(savedNewWindowMode);

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

        // 페이지 접속 로그 기록
        ApiService.logAccess().then(() => {
            console.log('Access logged successfully');
        }).catch((error) => {
            console.warn('Failed to log access:', error);
        });
    }, []);

    // 초기 설정 복원
    useEffect(() => {
        restoreSettings();
    }, [restoreSettings]);

    // 데이터 로드
    useEffect(() => {
        loadWeeklyData();
    }, [loadWeeklyData]);

    // 월 변경 핸들러
    const handleMonthChange = (targetYear: number, targetMonth: number) => {
        const today = new Date();
        const isCurrentMonth = targetYear === today.getFullYear() && targetMonth === (today.getMonth() + 1);

        // 현재 월이면 현재 주차, 아니면 마지막 주차
        const targetWeek = isCurrentMonth
            ? WeekUtils.getCurrentWeek(targetYear, targetMonth)
            : WeekUtils.getWeeksInMonth(targetYear, targetMonth);

        const url = `/week?yyyy=${targetYear}&mm=${String(targetMonth).padStart(2, '0')}&w=${targetWeek}`;
        window.location.href = url;
    };

    // 지난달로 이동
    const handlePreviousMonth = () => {
        let prevYear = currentYear;
        let prevMonth = currentMonth - 1;

        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear -= 1;
        }

        handleMonthChange(prevYear, prevMonth);
    };

    // 현재 달로 이동
    const handleCurrentMonth = () => {
        const today = new Date();
        handleMonthChange(today.getFullYear(), today.getMonth() + 1);
    };

    // 현재 월인지 확인
    const isCurrentMonth = () => {
        const today = new Date();
        return currentYear === today.getFullYear() && currentMonth === (today.getMonth() + 1);
    };

    // 주차 버튼 생성
    const renderWeekButtons = () => {
        const weeksInMonth = WeekUtils.getWeeksInMonth(currentYear, currentMonth);
        const buttons = [];

        for (let week = 1; week <= weeksInMonth; week++) {
            const isFuture = WeekUtils.isFutureWeek(currentYear, currentMonth, week);
            const isCurrent = week === currentWeek;
            const url = `/week?yyyy=${currentYear}&mm=${String(currentMonth).padStart(2, '0')}&w=${week}`;

            buttons.push(
                <button
                    key={week}
                    type="button"
                    onClick={() => !isFuture && (window.location.href = url)}
                    disabled={isFuture}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isCurrent
                        ? 'bg-orange-500 text-white cursor-pointer'
                        : isFuture
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                        }`}
                >
                    {week}주차
                </button>
            );
        }

        return buttons;
    };

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
                searchKeyword=""
                onSearchKeywordChange={() => { }}
                onSearch={() => { }}
                onClearSearch={() => { }}
                isSearchMode={false}
                showUnreadOnly={false}
                onToggleUnreadOnly={() => { }}
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
                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            커뮤니티 인기글 주간집계
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            오늘 기준 {currentYear}년 {currentMonth}월 주간별 집계를 확인하세요
                        </p>
                    </div>

                    {/* Month and Week Navigation */}
                    <div className="mb-6">
                        {/* 월 선택 탭 */}
                        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-4" aria-label="Tabs">
                                <button
                                    type="button"
                                    onClick={handlePreviousMonth}
                                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${!isCurrentMonth()
                                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    지난달
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCurrentMonth}
                                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${isCurrentMonth()
                                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    현재
                                </button>
                            </nav>
                        </div>

                        {/* 주차 선택 버튼 */}
                        <div className="flex flex-wrap gap-2">
                            {renderWeekButtons()}
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            현재 선택: {currentYear}년 {currentMonth}월 {currentWeek}주차
                        </div>
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

                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            {/* 모바일에서는 애니메이션 표시 */}
                            <div className="lg:hidden">
                                <img src="/cat_in_a_rocket_loading.gif" alt="로딩 중" />
                            </div>
                            {/* PC에서는 간단한 텍스트 */}
                            <div className="hidden lg:block text-center">
                                <p className="text-gray-500 dark:text-gray-400">주간 데이터를 불러오는 중...</p>
                            </div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* 커뮤니티 전체 주간 집계 (20개) */}
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    커뮤니티 전체 주간 집계 (상위 20개)
                                </h2>
                                <div className="space-y-4">
                                    {overallPosts.map((post, index) => {
                                        const postId = `${post.site}-${post.no}`;
                                        const isRead = isPostRead(postId);
                                        const isAdultContent = hasAdultContent(post.title);

                                        return (
                                            <article key={`overall-${post.no}-${index}`} className={`rounded-lg border transition-colors ${isRead
                                                ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}>
                                                <div className="p-4">
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        <span className="text-orange-500 font-bold mr-2">#{index + 1}</span>
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

                                                    {post.cloudinary_url && (
                                                        <div className="mb-3">
                                                            <img
                                                                src={post.cloudinary_url}
                                                                alt="첨부 이미지"
                                                                className={`max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                                                    }`}
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
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
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* 커뮤니티별 주간 집계 (각 10개씩) */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    커뮤니티별 주간 집계 (각 상위 10개)
                                </h2>
                                <div className="space-y-8">
                                    {Object.entries(sitePosts).map(([site, posts]) => (
                                        <div key={site}>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2"
                                                    style={{
                                                        backgroundColor: getSiteLogo(site).bgColor,
                                                        color: getSiteLogo(site).textColor
                                                    }}
                                                >
                                                    {getSiteLogo(site).letter}
                                                </div>
                                                {site}
                                            </h3>
                                            <div className="space-y-4">
                                                {posts.map((post, index) => {
                                                    const postId = `${post.site}-${post.no}`;
                                                    const isRead = isPostRead(postId);
                                                    const isAdultContent = hasAdultContent(post.title);

                                                    return (
                                                        <article key={`${site}-${post.no}-${index}`} className={`rounded-lg border transition-colors ${isRead
                                                            ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}>
                                                            <div className="p-4">
                                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                    <span className="text-orange-500 font-bold mr-2">#{index + 1}</span>
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

                                                                {post.cloudinary_url && (
                                                                    <div className="mb-3">
                                                                        <img
                                                                            src={post.cloudinary_url}
                                                                            alt="첨부 이미지"
                                                                            className={`max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 ${isAdultContent ? 'blur-md hover:blur-none transition-all duration-300' : ''
                                                                                }`}
                                                                            loading="lazy"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.style.display = 'none';
                                                                            }}
                                                                        />
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
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function WeekPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
                </div>
            </div>
        }>
            <WeekContent />
        </Suspense>
    );
}