'use client';

import { useState, useEffect } from 'react';
import { ApiService, AdminStats, SiteStats, RecentPost } from '@/lib/api';

// localStorage 키
const ADMIN_STORAGE_KEY = 'shooq-admin-login';

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 관리자 페이지는 항상 다크모드
    const isDarkMode = true;
    
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

    // 대시보드 통계 데이터 로드
    const loadStats = async () => {
        try {
            setStatsLoading(true);
            setSiteStatsLoading(true);
            setRecentPostsByCrawlLoading(true);
            setRecentPostsByContentLoading(true);
            
            // 관리자 통계 API 호출
            const adminStats = await ApiService.getAdminStats();
            const siteStatistics = await ApiService.getSiteStats();
            const recentPostsByCrawlData = await ApiService.getRecentPostsByCrawlTime(5);
            const recentPostsByContentData = await ApiService.getRecentPostsByContentTime(5);
            
            setStats(adminStats);
            setSiteStats(siteStatistics);
            setRecentPostsByCrawl(recentPostsByCrawlData);
            setRecentPostsByContent(recentPostsByContentData);
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            setStats(prev => ({ ...prev, systemStatus: '오류' }));
        } finally {
            setStatsLoading(false);
            setSiteStatsLoading(false);
            setRecentPostsByCrawlLoading(false);
            setRecentPostsByContentLoading(false);
        }
    };

    // 컴포넌트 마운트 시 로그인 상태 확인
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 로그인 상태 확인
            const savedLogin = localStorage.getItem(ADMIN_STORAGE_KEY);
            if (savedLogin === 'true') {
                setIsLoggedIn(true);
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                    isDarkMode 
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                    isDarkMode 
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
                            className={`w-full border font-medium py-3 px-4 rounded-lg transition-colors ${
                                isDarkMode
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
                                onClick={goToHome}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isDarkMode
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
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 게시물</p>
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
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>활성 사이트</p>
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
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 방문자</p>
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
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>시스템 상태</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>사이트 관리</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>크롤링 사이트 상태 및 설정</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {siteStatsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                                    siteStats.map((site) => {
                                        const lastPostDate = site.lastPostDate ? new Date(site.lastPostDate) : null;
                                        const formattedDate = lastPostDate ? 
                                            `${lastPostDate.getFullYear()}-${(lastPostDate.getMonth() + 1).toString().padStart(2, '0')}-${lastPostDate.getDate().toString().padStart(2, '0')} ${lastPostDate.getHours().toString().padStart(2, '0')}:${lastPostDate.getMinutes().toString().padStart(2, '0')}` :
                                            '정보 없음';
                                        
                                        return (
                                            <div key={site.site} className="py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{site.site}</span>
                                                    </div>
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>활성</span>
                                                </div>
                                                <div className="ml-6 mt-2 space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 글수:</span>
                                                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{site.postCount.toLocaleString()}개</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>마지막 등록:</span>
                                                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formattedDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6">
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>사이트 데이터가 없습니다</span>
                                    </div>
                                )}
                            </div>
                            <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors">
                                사이트 설정 관리
                            </button>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>컨텐츠 관리</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>최근 등록된 글 목록</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>마지막 크롤링</p>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {recentPostsByCrawlLoading ? (
                                            <span className="animate-pulse">로딩중...</span>
                                        ) : recentPostsByCrawl.length > 0 ? (
                                            (() => {
                                                const firstPost = recentPostsByCrawl[0];
                                                const regDate = firstPost.regDate ? new Date(firstPost.regDate) : null;
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
                                                    <div className="flex justify-between items-start py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                                            const regDate = post.regDate ? new Date(post.regDate) : null;
                                            const formattedRegDate = regDate ? 
                                                `${regDate.getFullYear()}-${(regDate.getMonth() + 1).toString().padStart(2, '0')}-${regDate.getDate().toString().padStart(2, '0')} ${regDate.getHours().toString().padStart(2, '0')}:${regDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';
                                            
                                            return (
                                                <div key={post.no} className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                                    {post.site}
                                                                </span>
                                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    {post.date}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={post.title}>
                                                                {post.title}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2 flex-shrink-0`}>
                                                            {formattedRegDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>크롤링된 글이 없습니다</span>
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
                                                    <div className="flex justify-between items-start py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                                            
                                            const regDate = post.regDate ? new Date(post.regDate) : null;
                                            const formattedRegDate = regDate ? 
                                                `${regDate.getFullYear()}-${(regDate.getMonth() + 1).toString().padStart(2, '0')}-${regDate.getDate().toString().padStart(2, '0')} ${regDate.getHours().toString().padStart(2, '0')}:${regDate.getMinutes().toString().padStart(2, '0')}` :
                                                '정보 없음';
                                            
                                            return (
                                                <div key={post.no} className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                                    {post.site}
                                                                </span>
                                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    컨텐츠: {formattedContentDate}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={post.title}>
                                                                {post.title}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2 flex-shrink-0`}>
                                                            {formattedRegDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>컨텐츠가 없습니다</span>
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