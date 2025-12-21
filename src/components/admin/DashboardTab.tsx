'use client';

import { useState, useEffect } from 'react';
import { ApiService, AdminStats, DailyCrawlStats, DailySiteStats } from '@/lib/api';
import VisitorChart from '@/components/VisitorChart';
import HourlyVisitorChart from '@/components/HourlyVisitorChart';
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

interface DashboardTabProps {
    isDarkMode: boolean;
}

export default function DashboardTab({ isDarkMode }: DashboardTabProps) {
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
    const [weeklyCrawlStats, setWeeklyCrawlStats] = useState<DailyCrawlStats[]>([]);
    const [weeklyCrawlStatsLoading, setWeeklyCrawlStatsLoading] = useState(true);
    const [dailySiteStats, setDailySiteStats] = useState<DailySiteStats[]>([]);
    const [dailySiteStatsLoading, setDailySiteStatsLoading] = useState(true);
    const [latestCrawlTime, setLatestCrawlTime] = useState<string | null>(null);

    const loadStats = async () => {
        setStatsLoading(true);
        try {
            const data = await ApiService.getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadWeeklyCrawlStats = async () => {
        setWeeklyCrawlStatsLoading(true);
        try {
            const data = await ApiService.getWeeklyCrawlStats();
            setWeeklyCrawlStats(data);
        } catch (error) {
            console.error('주간 크롤링 통계 로드 실패:', error);
        } finally {
            setWeeklyCrawlStatsLoading(false);
        }
    };

    const loadDailySiteStats = async () => {
        setDailySiteStatsLoading(true);
        try {
            const data = await ApiService.getDailySiteStats();
            setDailySiteStats(data);
        } catch (error) {
            console.error('오늘 사이트별 통계 로드 실패:', error);
        } finally {
            setDailySiteStatsLoading(false);
        }
    };

    const loadLatestCrawlTime = async () => {
        try {
            const data = await ApiService.getLatestCrawlTime();
            setLatestCrawlTime(data.latestCrawlTime);
        } catch (error) {
            console.error('최신 크롤링 시간 로드 실패:', error);
        }
    };

    useEffect(() => {
        loadStats();
        loadWeeklyCrawlStats();
        loadDailySiteStats();
        loadLatestCrawlTime();
    }, []);

    const formatKoreanDate = (isoString: string): string => {
        const date = new Date(isoString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    };

    return (
        <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>총 게시물</div>
                    <div className={`mt-2 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statsLoading ? '...' : stats.totalPosts.toLocaleString()}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        커뮤니티 {stats.communityPosts.toLocaleString()} / 뉴스 {stats.newsPosts.toLocaleString()}
                    </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>활성 사이트</div>
                    <div className={`mt-2 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statsLoading ? '...' : stats.activeSites}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        커뮤니티 {stats.communitySites} / 뉴스 {stats.newsSites}
                    </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>방문자 수</div>
                    <div className={`mt-2 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statsLoading ? '...' : stats.totalVisitors.toLocaleString()}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        오늘 {stats.todayVisitors.toLocaleString()}명
                    </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>시스템 상태</div>
                    <div className={`mt-2 text-3xl font-bold ${stats.systemStatus === '정상' ? 'text-green-600' : 'text-red-600'}`}>
                        {statsLoading ? '...' : stats.systemStatus}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        일일 조회수 {stats.dailyViews.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        주간 크롤링 통계
                    </h3>
                    {weeklyCrawlStatsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">로딩 중...</div>
                        </div>
                    ) : (
                        <Bar
                            data={{
                                labels: weeklyCrawlStats.map(stat => {
                                    const date = new Date(stat.date);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }),
                                datasets: [{
                                    label: '크롤링 수',
                                    data: weeklyCrawlStats.map(stat => stat.count),
                                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: { display: false },
                                    datalabels: {
                                        anchor: 'end',
                                        align: 'top',
                                        color: isDarkMode ? '#fff' : '#000',
                                        font: { weight: 'bold', size: 11 }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                                        grid: { color: isDarkMode ? '#374151' : '#e5e7eb' }
                                    },
                                    x: {
                                        ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                                        grid: { color: isDarkMode ? '#374151' : '#e5e7eb' }
                                    }
                                }
                            }}
                        />
                    )}
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        오늘 사이트별 크롤링 통계
                    </h3>
                    {dailySiteStatsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">로딩 중...</div>
                        </div>
                    ) : (
                        <Doughnut
                            data={{
                                labels: dailySiteStats.map(stat => stat.site),
                                datasets: [{
                                    data: dailySiteStats.map(stat => stat.count),
                                    backgroundColor: [
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(16, 185, 129, 0.8)',
                                        'rgba(245, 158, 11, 0.8)',
                                        'rgba(239, 68, 68, 0.8)',
                                        'rgba(139, 92, 246, 0.8)',
                                        'rgba(236, 72, 153, 0.8)',
                                    ],
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
                                    },
                                    datalabels: {
                                        color: '#fff',
                                        font: { weight: 'bold', size: 11 },
                                        formatter: (value) => value
                                    }
                                }
                            }}
                        />
                    )}
                    {latestCrawlTime && (
                        <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                            최신 크롤링: {formatKoreanDate(latestCrawlTime)}
                        </div>
                    )}
                </div>
            </div>

            {/* 방문자 차트 */}
            <div className="space-y-6">
                <VisitorChart isDarkMode={isDarkMode} />
                <HourlyVisitorChart />
            </div>
        </div>
    );
}
