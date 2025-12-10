'use client';

import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface HourlyVisitorChartProps {
    days?: number;
}

export default function HourlyVisitorChart({ days = 1 }: HourlyVisitorChartProps) {
    const [hourlyData, setHourlyData] = useState<Record<string, { visitors: number; visits: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHourlyData();
    }, [days]);

    const loadHourlyData = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getHourlyVisitorStats(days);
            setHourlyData(data);
        } catch (error) {
            console.error('시간대별 통계 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    시간대별 방문자 통계
                </h2>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    const hours = Object.keys(hourlyData).sort();
    const visitors = hours.map((hour) => hourlyData[hour].visitors);
    const visits = hours.map((hour) => hourlyData[hour].visits);

    const chartData = {
        labels: hours.map((hour) => `${hour}시`),
        datasets: [
            {
                label: '방문자 수 (명)',
                data: visitors,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: '방문 횟수 (회)',
                data: visits,
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgb(107, 114, 128)',
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString();
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgb(107, 114, 128)',
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: 'rgb(107, 114, 128)',
                    font: {
                        size: 11,
                    },
                    callback: function (value: any) {
                        return value.toLocaleString();
                    },
                },
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    };

    const totalVisitors = visitors.reduce((sum, count) => sum + count, 0);
    const totalVisits = visits.reduce((sum, count) => sum + count, 0);
    const peakHourIndex = visitors.indexOf(Math.max(...visitors));
    const peakHour = hours[peakHourIndex];
    const peakVisitors = Math.max(...visitors);

    // 24시 표기법으로 변환 (00:00 ~ 23:00)
    const formatPeakHour = (hour: string) => {
        const hourNum = parseInt(hour);
        return `${hourNum.toString().padStart(2, '0')}:00`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    시간대별 방문자 통계 {days > 1 && `(최근 ${days}일)`}
                </h2>
            </div>

            {/* 요약 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">총 방문자</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {totalVisitors.toLocaleString()}명
                    </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">총 방문 횟수</div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {totalVisits.toLocaleString()}회
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">피크 시간대</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatPeakHour(peakHour)} ({peakVisitors}명)
                    </div>
                </div>
            </div>

            {/* 차트 */}
            <div className="h-80">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
