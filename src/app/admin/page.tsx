'use client';

import { useState, useEffect } from 'react';
import { ApiService, AdminStats, DailyCrawlStats, DailySiteStats, SiteBbsInfo } from '@/lib/api';
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
        communityPosts: 0,
        newsPosts: 0,
        activeSites: 0,
        communitySites: 0,
        newsSites: 0,
        totalVisitors: 0,
        todayVisitors: 0,
        dailyViews: 0,
        systemStatus: '정상'
    });
    const [statsLoading, setStatsLoading] = useState(true);


    // 주간 크롤링 통계 데이터
    const [weeklyCrawlStats, setWeeklyCrawlStats] = useState<DailyCrawlStats[]>([]);
    const [weeklyCrawlStatsLoading, setWeeklyCrawlStatsLoading] = useState(true);

    // 오늘 사이트별 통계 데이터
    const [dailySiteStats, setDailySiteStats] = useState<DailySiteStats[]>([]);
    const [dailySiteStatsLoading, setDailySiteStatsLoading] = useState(true);

    // 최신 크롤링 시간 데이터
    const [latestCrawlTime, setLatestCrawlTime] = useState<string | null>(null);
    const [latestCrawlTimeLoading, setLatestCrawlTimeLoading] = useState(true);


    // 탭 상태 관리
    const [activeTab, setActiveTab] = useState<'dashboard' | 'content'>('dashboard');

    // 컨텐츠 제작 탭 - 주간집계 state
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<{ data: SiteBbsInfo[] } | null>(null);
    const [weeklyDataLoading, setWeeklyDataLoading] = useState(false);
    const [contentText, setContentText] = useState('');

    // 대시보드 통계 데이터 로드
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            setWeeklyCrawlStatsLoading(true);
            setDailySiteStatsLoading(true);
            setLatestCrawlTimeLoading(true);

            // 관리자 통계 API 호출
            const adminStats = await ApiService.getAdminStats();
            const weeklyCrawlStatsData = await ApiService.getWeeklyCrawlStats();
            const dailySiteStatsData = await ApiService.getDailySiteStats();
            const latestCrawlTimeData = await ApiService.getLatestCrawlTime();

            setStats(adminStats);
            setWeeklyCrawlStats(weeklyCrawlStatsData);
            setDailySiteStats(dailySiteStatsData);
            setLatestCrawlTime(latestCrawlTimeData.latestCrawlTime);
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            setStats(prev => ({ ...prev, systemStatus: '오류' }));
        } finally {
            setStatsLoading(false);
            setWeeklyCrawlStatsLoading(false);
            setDailySiteStatsLoading(false);
            setLatestCrawlTimeLoading(false);
        }
    };

    // 방문자 통계만 새로고침하는 함수
    const refreshVisitorStats = async () => {
        try {
            setStatsLoading(true);

            // 관리자 통계 API 호출 (방문자 데이터 포함)
            const adminStats = await ApiService.getAdminStats();
            setStats(adminStats);
        } catch (error) {
            console.error('방문자 통계 새로고침 실패:', error);
        } finally {
            setStatsLoading(false);
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

    // 컨텐츠 제작 탭 활성화 시 초기 데이터 로드
    useEffect(() => {
        if (isLoggedIn && activeTab === 'content' && !weeklyData) {
            handleWeekChange(currentWeek);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, activeTab]);

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

    // 주차 계산 유틸리티
    const getWeeksInMonth = (year: number, month: number): number => {
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        return Math.ceil(daysInMonth / 7);
    };

    const getCurrentWeek = (year: number, month: number): number => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();

        if (year !== currentYear || month !== currentMonth) {
            return 1;
        }

        return Math.ceil(currentDate / 7);
    };

    const isFutureWeek = (year: number, month: number, week: number): boolean => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        if (year > currentYear) return true;
        if (year < currentYear) return false;
        if (month > currentMonth) return true;
        if (month < currentMonth) return false;

        const currentWeek = getCurrentWeek(year, month);
        return week > currentWeek;
    };

    // 월 변경 핸들러
    const handleMonthChange = async (year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
        const newWeek = getCurrentWeek(year, month);
        setCurrentWeek(newWeek);

        // 월이 변경되면 새로운 주차 데이터 로드
        if (weeklyData) {
            await handleWeekChange(newWeek, year, month);
        }
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

    // 주간 데이터를 HTML로 변환
    const generateBlogContentWithParams = (data: { data: SiteBbsInfo[] }, year: number, month: number, week: number, dateStr?: string) => {
        if (!data || !data.data || !Array.isArray(data.data)) return '';

        const overallPosts = data.data.filter((post: SiteBbsInfo) => post?.gubun === '01');
        const sitePosts: { [key: string]: SiteBbsInfo[] } = {};

        data.data.forEach((post: SiteBbsInfo) => {
            if (post?.gubun === '02' && post?.site) {
                if (!sitePosts[post.site]) {
                    sitePosts[post.site] = [];
                }
                sitePosts[post.site].push(post);
            }
        });

        // 요일이 선택된 경우 날짜 형식으로 표시, 아니면 주차로 표시
        let titleText = '';
        if (dateStr) {
            const dateObj = new Date(dateStr);
            const day = dateObj.getDate();
            titleText = `${year}년 ${month}월 ${day}일 커뮤니티 인기글`;
        } else {
            titleText = `${year}년 ${month}월 ${week}주차 커뮤니티 인기글`;
        }

        let html = `<h1>${titleText}</h1>\n\n`;

        // 실시간 인기글 보러가기 링크 추가
        html += `<p style="margin-bottom: 20px;">`;
        html += `⚡ <a href="https://shooq.live" target="_blank" style="color: #f97316; font-weight: bold; text-decoration: none;">Shooq(슉) - 실시간 인기글 보러 가기 →</a>`;
        html += `</p>\n\n`;

        // 전체 통합 랭킹
        html += `<h2>🏆 전체 사이트 통합 랭킹 TOP 20</h2>\n`;
        html += `<ol>\n`;
        overallPosts.slice(0, 20).forEach((post: SiteBbsInfo) => {
            html += `  <li><strong>[${post.site}]</strong> <a href="${post.url}" target="_blank">${post.title}</a> (👍 ${post.likes || 0} | 💬 ${post.reply_num || 0} | 👁 ${post.views || 0})</li>\n`;
        });
        html += `</ol>\n\n`;

        // 실시간 인기글 보러가기 링크 추가
        html += `<p style="margin-bottom: 20px;">`;
        html += `⚡ <a href="https://shooq.live" target="_blank" style="color: #f97316; font-weight: bold; text-decoration: none;">Shooq(슉) - 실시간 인기글 보러 가기 →</a>`;
        html += `</p>\n\n`;

        // 공간 추가
        html += `<div style="margin: 40px 0;"></div>\n\n`;

        // 사이트별 랭킹
        const communityOrder = ['TheQoo', 'Ppomppu', 'Ruliweb', 'Inven', 'MlbPark', 'Clien', 'BobaeDream', 'Humoruniv', '82Cook', 'SlrClub', 'Damoang', 'TodayHumor', 'FMKorea'];

        communityOrder.forEach((site, index) => {
            if (sitePosts[site] && sitePosts[site].length > 0) {
                html += `<h3>📌 ${site} TOP 10</h3>\n`;
                html += `<ol>\n`;
                sitePosts[site].slice(0, 10).forEach((post: SiteBbsInfo) => {
                    html += `  <li><a href="${post.url}" target="_blank">${post.title}</a> (👍 ${post.likes || 0} | 💬 ${post.reply_num || 0} | 👁 ${post.views || 0})</li>\n`;
                });
                html += `</ol>\n\n`;

                // 실시간 인기글 보러가기 링크 추가
                html += `<p style="margin-bottom: 20px;">`;
                html += `⚡ <a href="https://shooq.live" target="_blank" style="color: #f97316; font-weight: bold; text-decoration: none;">Shooq(슉) - 실시간 인기글 보러 가기 →</a>`;
                html += `</p>\n\n`;

                // 마지막 커뮤니티가 아니면 공간 추가
                if (index < communityOrder.length - 1) {
                    html += `<div style="margin: 30px 0;"></div>\n\n`;
                }
            }
        });

        return html;
    };

    // 주차 변경 핸들러
    const handleWeekChange = async (week: number, year?: number, month?: number, dateParam?: string) => {
        const targetYear = year || currentYear;
        const targetMonth = month || currentMonth;

        setCurrentWeek(week);
        setSelectedDate(dateParam || null);
        setWeeklyDataLoading(true);
        try {
            const weekResult = await ApiService.getWeek(
                targetYear.toString(),
                String(targetMonth).padStart(2, '0'),
                week.toString(),
                dateParam
            );
            setWeeklyData(weekResult);

            // HTML 컨텐츠 생성 - dateParam 전달
            const blogHtml = generateBlogContentWithParams(weekResult, targetYear, targetMonth, week, dateParam);
            setContentText(blogHtml);
        } catch (error) {
            console.error('주간 데이터 로드 실패:', error);
        } finally {
            setWeeklyDataLoading(false);
        }
    };

    // 해당 주차의 요일별 날짜 계산
    const getDaysOfWeek = (year: number, month: number, week: number): { day: string; date: string; isToday: boolean; isFuture: boolean }[] => {
        const firstDay = new Date(year, month - 1, 1);
        const weekStart = new Date(firstDay);
        weekStart.setDate(firstDay.getDate() + (week - 1) * 7);

        const days = ['월', '화', '수', '목', '금', '토', '일'];
        const result = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);

            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const checkDate = new Date(currentDate);
            checkDate.setHours(0, 0, 0, 0);

            result.push({
                day: days[i],
                date: dateStr,
                isToday: checkDate.getTime() === today.getTime(),
                isFuture: checkDate > today
            });
        }

        return result;
    };

    // 요일 버튼 클릭 핸들러
    const handleDayClick = async (dateStr: string) => {
        setSelectedDate(dateStr);
        setWeeklyDataLoading(true);
        try {
            const weekResult = await ApiService.getWeek(
                currentYear.toString(),
                String(currentMonth).padStart(2, '0'),
                currentWeek.toString(),
                dateStr
            );
            setWeeklyData(weekResult);

            // HTML 컨텐츠 생성 - dateStr 전달
            const blogHtml = generateBlogContentWithParams(weekResult, currentYear, currentMonth, currentWeek, dateStr);
            setContentText(blogHtml);
        } catch (error) {
            console.error('요일별 데이터 로드 실패:', error);
        } finally {
            setWeeklyDataLoading(false);
        }
    };

    // 주차 버튼 생성
    const renderWeekButtons = () => {
        const weeksInMonth = getWeeksInMonth(currentYear, currentMonth);
        const buttons = [];

        for (let week = 1; week <= weeksInMonth; week++) {
            const isFuture = isFutureWeek(currentYear, currentMonth, week);
            const isCurrent = week === currentWeek;

            buttons.push(
                <button
                    key={week}
                    type="button"
                    onClick={() => !isFuture && handleWeekChange(week)}
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

    // 요일 버튼 렌더링
    const renderDayButtons = () => {
        const daysOfWeek = getDaysOfWeek(currentYear, currentMonth, currentWeek);

        return daysOfWeek.map((dayInfo) => (
            <button
                key={dayInfo.date}
                type="button"
                onClick={() => !dayInfo.isFuture && handleDayClick(dayInfo.date)}
                disabled={dayInfo.isFuture}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate === dayInfo.date
                        ? 'bg-orange-500 text-white cursor-pointer'
                        : dayInfo.isToday
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 cursor-pointer'
                            : dayInfo.isFuture
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer'
                    }`}
            >
                {dayInfo.day} ({dayInfo.date.slice(8, 10)})
            </button>
        ));
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
                            <a
                                href="https://shooq.live"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>실시간 인기글 보기</span>
                            </a>
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
                {/* 탭 메뉴 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'dashboard'
                                    ? `${isDarkMode ? 'text-orange-400' : 'text-orange-600'} border-b-2 border-orange-500`
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
                                    }`}
                            >
                                대시보드
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('content')}
                                className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'content'
                                    ? `${isDarkMode ? 'text-orange-400' : 'text-orange-600'} border-b-2 border-orange-500`
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
                                    }`}
                            >
                                컨텐츠 제작
                            </button>
                        </div>
                        {activeTab === 'dashboard' && (
                            <button
                                type="button"
                                onClick={refreshVisitorStats}
                                disabled={statsLoading}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 disabled:bg-gray-50 disabled:text-gray-400'
                                    } disabled:cursor-not-allowed`}
                                title="방문자 통계 새로고침"
                            >
                                <svg
                                    className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>새로고침</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 대시보드 탭 콘텐츠 */}
                {activeTab === 'dashboard' && (
                    <>
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
                                            <div className="flex flex-col">
                                                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {stats.totalPosts.toLocaleString()}
                                                </p>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>커뮤니티</span>
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                                            {stats.communityPosts.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>뉴스</span>
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                                                            {stats.newsPosts.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
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
                                            <div className="flex flex-col">
                                                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {stats.activeSites}
                                                </p>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>커뮤니티</span>
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                                            {stats.communitySites}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>뉴스</span>
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                                                            {stats.newsSites}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
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
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>방문자</p>
                                        {statsLoading ? (
                                            <div className="animate-pulse">
                                                <div className="h-8 bg-gray-600 rounded w-24 mt-2"></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline space-x-2">
                                                    <span className={`text-2xl font-bold text-orange-500`}>
                                                        {stats.todayVisitors.toLocaleString()}
                                                    </span>
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>오늘</span>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {stats.totalVisitors.toLocaleString()}
                                                    </span>
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>총 방문자</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>오늘 사이트별 현황</h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 크롤링 현황
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>마지막 크롤링 시간</p>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {latestCrawlTimeLoading ? (
                                                    <span className="animate-pulse">로딩중...</span>
                                                ) : latestCrawlTime ? (
                                                    (() => {
                                                        const crawlDate = new Date(latestCrawlTime);
                                                        const year = crawlDate.getFullYear();
                                                        const month = String(crawlDate.getMonth() + 1).padStart(2, '0');
                                                        const day = String(crawlDate.getDate()).padStart(2, '0');
                                                        const hour = String(crawlDate.getHours()).padStart(2, '0');
                                                        const minute = String(crawlDate.getMinutes()).padStart(2, '0');
                                                        const second = String(crawlDate.getSeconds()).padStart(2, '0');

                                                        // 경과 시간 계산
                                                        const now = new Date();
                                                        const diffMs = now.getTime() - crawlDate.getTime();
                                                        const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                                        let timeAgo = '';
                                                        if (diffMinutes < 1) {
                                                            timeAgo = '방금 전';
                                                        } else if (diffMinutes < 60) {
                                                            timeAgo = `${diffMinutes}분 전`;
                                                        } else if (diffHours < 24) {
                                                            timeAgo = `${diffHours}시간 전`;
                                                        } else {
                                                            timeAgo = `${diffDays}일 전`;
                                                        }

                                                        return (
                                                            <>
                                                                <div>{`${year}-${month}-${day} ${hour}:${minute}:${second}`}</div>
                                                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                                                    ({timeAgo})
                                                                </div>
                                                            </>
                                                        );
                                                    })()
                                                ) : (
                                                    '데이터 없음'
                                                )}
                                            </p>
                                        </div>
                                    </div>
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

                    </>
                )}

                {/* 컨텐츠 제작 탭 콘텐츠 */}
                {activeTab === 'content' && (
                    <div>
                        {/* 페이지 타이틀 */}
                        <div className="mb-6">
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                커뮤니티 인기글 주간집계
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                오늘 기준 {currentYear}년 {currentMonth}월 주간별 집계를 확인하세요
                            </p>
                        </div>

                        {/* 월 및 주차 네비게이션 */}
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
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
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {renderWeekButtons()}
                                </div>
                            </div>

                            {/* 요일 선택 탭 */}
                            <div className="mb-4">
                                <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    요일별 조회
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {renderDayButtons()}
                                </div>
                            </div>

                            <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                현재 선택: {currentYear}년 {currentMonth}월 {currentWeek}주차
                                {selectedDate && ` - ${selectedDate}`}
                            </div>
                        </div>

                        {/* 컨텐츠 제작 영역 */}
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    블로그 컨텐츠
                                </h3>
                                {contentText && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const contentElement = document.getElementById('blog-content-preview');
                                            if (contentElement) {
                                                const htmlContent = contentElement.innerHTML;
                                                navigator.clipboard.writeText(htmlContent);
                                                alert('HTML이 클립보드에 복사되었습니다!');
                                            }
                                        }}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        📋 HTML 복사하기
                                    </button>
                                )}
                            </div>

                            {weeklyDataLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                    <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>주간 데이터를 불러오는 중...</p>
                                </div>
                            ) : contentText ? (
                                <div>
                                    <div
                                        id="blog-content-preview"
                                        className={`w-full min-h-[600px] p-6 rounded-lg border ${isDarkMode
                                            ? 'bg-gray-900 border-gray-700 text-gray-300'
                                            : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: contentText }}
                                    />
                                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        총 {weeklyData?.data?.length || 0}개의 게시물 | {contentText.length} 글자
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        주차를 선택하여 블로그 컨텐츠를 생성하세요
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}