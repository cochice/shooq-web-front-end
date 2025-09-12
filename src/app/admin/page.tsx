'use client';

import { useState, useEffect } from 'react';
import { ApiService, AdminStats, SiteStats, RecentPost, DailyCrawlStats, DailySiteStats } from '@/lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartDataLabels
);

// localStorage 키
const ADMIN_STORAGE_KEY = 'shooq-admin-login';

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    // 다크 모드 상태 관리
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 대시보드 통계 데이터
    const [stats, setStats] = useState<AdminStats>({
        totalPosts: 0,
        activeSites: 0,
        totalVisitors: 0,
        dailyViews: 0,
        systemStatus: '정상'
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // 사이트별 통계 데이터
    const [siteStats, setSiteStats] = useState<SiteStats[]>([]);
    const [siteStatsLoading, setSiteStatsLoading] = useState(true);

    // 크롤링 시간 기준 최근 글 데이터
    const [recentPostsByCrawl, setRecentPostsByCrawl] = useState<RecentPost[]>([]);
    const [recentPostsByCrawlLoading, setRecentPostsByCrawlLoading] = useState(true);

    // 컨텐츠 시간 기준 최근 글 데이터
    const [recentPostsByContent, setRecentPostsByContent] = useState<RecentPost[]>([]);
    const [recentPostsByContentLoading, setRecentPostsByContentLoading] = useState(true);

    // 주간 크롤링 통계 데이터
    const [weeklyCrawlStats, setWeeklyCrawlStats] = useState<DailyCrawlStats[]>([]);
    const [weeklyCrawlStatsLoading, setWeeklyCrawlStatsLoading] = useState(true);

    // 오늘 사이트별 통계 데이터
    const [dailySiteStats, setDailySiteStats] = useState<DailySiteStats[]>([]);
    const [dailySiteStatsLoading, setDailySiteStatsLoading] = useState(true);

    // 사이트 관리 펼치기/접기 상태
    const [showAllSites, setShowAllSites] = useState(false);

    // 대시보드 통계 데이터 로드
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            setSiteStatsLoading(true);
            setRecentPostsByCrawlLoading(true);
            setRecentPostsByContentLoading(true);
            setWeeklyCrawlStatsLoading(true);
            setDailySiteStatsLoading(true);

            // 관리자 통계 API 호출
            const adminStats = await ApiService.getAdminStats();
            const siteStatistics = await ApiService.getSiteStats();
            const recentPostsByCrawlData = await ApiService.getRecentPostsByCrawlTime(5);
            const recentPostsByContentData = await ApiService.getRecentPostsByContentTime(5);
            const weeklyCrawlStatsData = await ApiService.getWeeklyCrawlStats();
            const dailySiteStatsData = await ApiService.getDailySiteStats();

            setStats(adminStats);
            setSiteStats(siteStatistics);
            setRecentPostsByCrawl(recentPostsByCrawlData);
            setRecentPostsByContent(recentPostsByContentData);
            setWeeklyCrawlStats(weeklyCrawlStatsData);
            setDailySiteStats(dailySiteStatsData);
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            setStats(prev => ({ ...prev, systemStatus: '오류' }));
        } finally {
            setStatsLoading(false);
            setSiteStatsLoading(false);
            setRecentPostsByCrawlLoading(false);
            setRecentPostsByContentLoading(false);
            setWeeklyCrawlStatsLoading(false);
            setDailySiteStatsLoading(false);
        }
    };

    // 차트 데이터 생성
    const createChartData = () => {
        // 최근 7일간의 날짜 생성
        const dates: string[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD 형식
        }

        // 각 날짜별 크롤링 개수 매핑
        const counts = dates.map(date => {
            const stat = weeklyCrawlStats.find(s => s.date === date);
            return stat ? stat.count : 0;
        });

        // 날짜를 MM/DD 형식으로 변환
        const labels = dates.map(date => {
            const d = new Date(date);
            return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
        });

        return {
            labels,
            datasets: [
                {
                    label: '크롤링 개수',
                    data: counts,
                    backgroundColor: isDarkMode ? 'rgba(251, 146, 60, 0.6)' : 'rgba(249, 115, 22, 0.6)',
                    borderColor: isDarkMode ? 'rgba(251, 146, 60, 1)' : 'rgba(249, 115, 22, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
                },
            },
            title: {
                display: true,
                text: '일주일간 크롤링 통계',
                color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            datalabels: {
                anchor: 'end' as const,
                align: 'top' as const,
                color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
                font: {
                    size: 12,
                    weight: 'bold' as const,
                },
                formatter: (value: number) => {
                    return value > 0 ? value : '';
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                    stepSize: 1,
                },
                grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                },
            },
            x: {
                ticks: {
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                },
                grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                },
            },
        },
    };

    // 사이트별 도넛 차트 데이터 생성
    const createSiteChartData = () => {
        const colors = [
            'rgba(249, 115, 22, 0.8)',   // 오렌지
            'rgba(59, 130, 246, 0.8)',   // 블루
            'rgba(34, 197, 94, 0.8)',    // 그린
            'rgba(239, 68, 68, 0.8)',    // 레드
            'rgba(168, 85, 247, 0.8)',   // 퍼플
            'rgba(245, 158, 11, 0.8)',   // 앰버
            'rgba(20, 184, 166, 0.8)',   // 틸
            'rgba(236, 72, 153, 0.8)',   // 핑크
        ];

        const borderColors = [
            'rgba(249, 115, 22, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(20, 184, 166, 1)',
            'rgba(236, 72, 153, 1)',
        ];

        const labels = dailySiteStats.map(stat => stat.site);
        const data = dailySiteStats.map(stat => stat.count);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 2,
                },
            ],
        };
    };

    const siteChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
                    padding: 15,
                },
            },
            title: {
                display: true,
                text: '오늘 사이트별 크롤링 현황',
                color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
            datalabels: {
                anchor: 'center' as const,
                align: 'center' as const,
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
                formatter: (value: unknown, context: unknown) => {
                    const numValue = Number(value);
                    const ctx = context as { dataset: { data: number[] } };
                    const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = total > 0 ? Math.round((numValue / total) * 100) : 0;
                    return numValue > 0 ? `${numValue}\n(${percentage}%)` : '';
                },
            },
        },
        maintainAspectRatio: false,
    };

    // 컴포넌트 마운트 시 로그인 상태 확인 및 다크 모드 설정
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 로그인 상태 확인
            const savedLogin = localStorage.getItem(ADMIN_STORAGE_KEY);
            if (savedLogin === 'true') {
                setIsLoggedIn(true);
            }

            // 다크 모드 설정 - 시스템 설정 또는 메인 페이지와 동일한 테마 사용
            const savedTheme = localStorage.getItem('shooq-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

            setIsDarkMode(shouldUseDarkMode);
            if (shouldUseDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // 로그인 후 통계 데이터 로드
    useEffect(() => {
        if (isLoggedIn) {
            loadStats();
        }
    }, [isLoggedIn]);

    // 로그인 처리
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');

        // 간단한 하드코딩된 인증 (실제로는 백엔드 API 호출)
        if (loginForm.username === 'admin' && loginForm.password === 'tmtmfh9!@Admin') {
            localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
            setIsLoggedIn(true);
        } else {
            setLoginError('잘못된 사용자명 또는 비밀번호입니다.');
        }

        setLoading(false);
    };

    // 로그아웃 처리
    const handleLogout = () => {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setIsLoggedIn(false);
        setLoginForm({ username: '', password: '' });
    };

    // 홈으로 이동
    const goToHome = () => {
        window.location.href = '/';
    };

    // 다크 모드 토글
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (typeof window !== 'undefined') {
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('shooq-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('shooq-theme', 'light');
            }
        }
    };

    // 로그인 화면
    if (!isLoggedIn) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">S</span>
                        </div>
                        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>shooq 관리자</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>관리자 로그인이 필요합니다</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                사용자명
                            </label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                placeholder="관리자 사용자명을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                비밀번호
                            </label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>

                        <button
                            type="button"
                            onClick={goToHome}
                            className={`w-full border font-medium py-3 px-4 rounded-lg transition-colors ${isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            홈으로 돌아가기
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 관리자 대시보드
    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-40`}>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>shooq 관리자</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="다크 모드 토글"
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
                            <button
                                onClick={goToHome}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                홈으로
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>총 게시물</p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-600 rounded w-20 mt-2"></div>
                                    </div>
                                ) : (
                                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {stats.totalPosts.toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>활성 사이트</p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-600 rounded w-16 mt-2"></div>
                                    </div>
                                ) : (
                                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {stats.activeSites}
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>총 방문자</p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-600 rounded w-24 mt-2"></div>
                                    </div>
                                ) : (
                                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {stats.totalVisitors.toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>시스템 상태</p>
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-600 rounded w-16 mt-2"></div>
                                    </div>
                                ) : (
                                    <p className={`text-3xl font-bold ${stats.systemStatus === '정상' ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.systemStatus}
                                    </p>
                                )}
                            </div>
                            <div className={`w-12 h-12 ${stats.systemStatus === '정상' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center`}>
                                <svg className={`w-6 h-6 ${stats.systemStatus === '정상' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 크롤링 통계 차트 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* 일주일간 크롤링 통계 (막대 차트) */}
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>주간 크롤링 통계</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>최근 7일간 일별 크롤링 개수</p>
                        </div>
                        <div className="p-6">
                            {weeklyCrawlStatsLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>차트 데이터를 불러오는 중...</span>
                                </div>
                            ) : weeklyCrawlStats.length > 0 ? (
                                <div className="h-96">
                                    <Bar data={createChartData()} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>크롤링 통계 데이터가 없습니다</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오늘 사이트별 통계 (도넛 차트) */}
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>오늘 사이트별 현황</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 크롤링 현황
                            </p>
                        </div>
                        <div className="p-6">
                            {dailySiteStatsLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>차트 데이터를 불러오는 중...</span>
                                </div>
                            ) : dailySiteStats.length > 0 ? (
                                <div className="h-96">
                                    <Doughnut data={createSiteChartData()} options={siteChartOptions} />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>오늘 크롤링된 데이터가 없습니다</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>사이트 관리</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>크롤링 사이트 상태 및 설정</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {siteStatsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="flex items-center justify-between py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                        <div className="h-4 bg-gray-400 rounded w-24"></div>
                                                    </div>
                                                    <div className="h-4 bg-gray-400 rounded w-16"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : siteStats.length > 0 ? (
                                    <>
                                        {(showAllSites ? siteStats : siteStats.slice(0, 6)).map((site) => {
                                            const lastPostDate = site.lastPostDate ? new Date(site.lastPostDate) : null;
                                            const formattedDate = lastPostDate ?
                                                `${lastPostDate.getFullYear()}-${(lastPostDate.getMonth() + 1).toString().padStart(2, '0')}-${lastPostDate.getDate().toString().padStart(2, '0')} ${lastPostDate.getHours().toString().padStart(2, '0')}:${lastPostDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';

                                            return (
                                                <div key={site.site} className="py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{site.site}</span>
                                                        </div>
                                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>활성</span>
                                                    </div>
                                                    <div className="ml-6 mt-2 space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>전체 글수:</span>
                                                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{site.postCount.toLocaleString()}개</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>오늘 수집:</span>
                                                            <span className={`font-medium ${site.todayCount > 0 ? 'text-orange-500' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                                                                {site.todayCount.toLocaleString()}개
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>마지막 등록:</span>
                                                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formattedDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {siteStats.length > 6 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllSites(!showAllSites)}
                                                className={`w-full py-3 px-4 text-sm font-medium rounded-lg border-2 border-dashed transition-colors ${isDarkMode
                                                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                                                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center space-x-2">
                                                    {showAllSites ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                            <span>접기 ({siteStats.length - 6}개 숨기기)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                            <span>더보기 ({siteStats.length - 6}개 더 보기)</span>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>사이트 데이터가 없습니다</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>컨텐츠 관리</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>최근 등록된 글 목록</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>마지막 크롤링</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {recentPostsByCrawlLoading ? (
                                            <span className="animate-pulse">로딩중...</span>
                                        ) : recentPostsByCrawl.length > 0 ? (
                                            (() => {
                                                const firstPost = recentPostsByCrawl[0];
                                                const regDate = firstPost.reg_date ? new Date(firstPost.reg_date) : null;
                                                if (!regDate) return '정보 없음';

                                                const now = new Date();
                                                const diffMs = now.getTime() - regDate.getTime();
                                                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                                if (diffMinutes < 60) {
                                                    return `${diffMinutes}분 전`;
                                                } else if (diffHours < 24) {
                                                    return `${diffHours}시간 전`;
                                                } else {
                                                    return `${diffDays}일 전`;
                                                }
                                            })()
                                        ) : (
                                            '정보 없음'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* 크롤링 시간 기준 섹션 */}
                            <div>
                                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>크롤링 시간 기준</h4>
                                <div className="space-y-3">
                                    {recentPostsByCrawlLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="flex justify-between items-start py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                        <div className="space-y-2 flex-1">
                                                            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                                                            <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                                                        </div>
                                                        <div className="h-3 bg-gray-400 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : recentPostsByCrawl.length > 0 ? (
                                        recentPostsByCrawl.map((post) => {
                                            const regDate = post.reg_date ? new Date(post.reg_date) : null;
                                            const formattedRegDate = regDate ?
                                                `${regDate.getFullYear()}-${(regDate.getMonth() + 1).toString().padStart(2, '0')}-${regDate.getDate().toString().padStart(2, '0')} ${regDate.getHours().toString().padStart(2, '0')}:${regDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';

                                            return (
                                                <div key={post.no} className="py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-800'}`}>
                                                                    {post.site}
                                                                </span>
                                                                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                    {post.date}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={post.title}>
                                                                {post.title}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-2 flex-shrink-0`}>
                                                            {formattedRegDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>크롤링된 글이 없습니다</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 구분선 */}
                            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

                            {/* 컨텐츠 시간 기준 섹션 */}
                            <div>
                                <h4 className={`text-md font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>컨텐츠 시간 기준</h4>
                                <div className="space-y-3">
                                    {recentPostsByContentLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="flex justify-between items-start py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                        <div className="space-y-2 flex-1">
                                                            <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                                                            <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                                                        </div>
                                                        <div className="h-3 bg-gray-400 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : recentPostsByContent.length > 0 ? (
                                        recentPostsByContent.map((post) => {
                                            const contentDate = post.date ? new Date(post.date) : null;
                                            const formattedContentDate = contentDate ?
                                                `${contentDate.getFullYear()}-${(contentDate.getMonth() + 1).toString().padStart(2, '0')}-${contentDate.getDate().toString().padStart(2, '0')} ${contentDate.getHours().toString().padStart(2, '0')}:${contentDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';

                                            const regDate = post.reg_date ? new Date(post.reg_date) : null;
                                            const formattedRegDate = regDate ?
                                                `${regDate.getFullYear()}-${(regDate.getMonth() + 1).toString().padStart(2, '0')}-${regDate.getDate().toString().padStart(2, '0')} ${regDate.getHours().toString().padStart(2, '0')}:${regDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';

                                            return (
                                                <div key={post.no} className="py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-800'}`}>
                                                                    {post.site}
                                                                </span>
                                                                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                    컨텐츠: {formattedContentDate}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={post.title}>
                                                                {post.title}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-2 flex-shrink-0`}>
                                                            {formattedRegDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>컨텐츠가 없습니다</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}