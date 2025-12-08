'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { ApiService } from '@/lib/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type PeriodType = 'week' | 'month' | 'all';

interface VisitorChartProps {
    isDarkMode?: boolean;
}

export default function VisitorChart({ isDarkMode = false }: VisitorChartProps) {
    const [period, setPeriod] = useState<PeriodType>('week');
    const [visitorData, setVisitorData] = useState<Record<string, { visitors: number; visits: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVisitorData();
    }, [period]);

    const loadVisitorData = async () => {
        try {
            setLoading(true);
            let data: Record<string, { visitors: number; visits: number }> = {};

            switch (period) {
                case 'week':
                    data = await ApiService.getDailyVisitorStatsDetailed(7);
                    break;
                case 'month':
                    data = await ApiService.getWeeklyVisitorStatsDetailed(12);
                    break;
                case 'all':
                    data = await ApiService.getAllTimeVisitorStatsDetailed();
                    break;
            }

            setVisitorData(data);
        } catch (error) {
            console.error('Failed to load visitor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLabel = (dateStr: string): string => {
        const date = new Date(dateStr);

        switch (period) {
            case 'week':
                return `${date.getMonth() + 1}/${date.getDate()}`;
            case 'month':
                return `${date.getMonth() + 1}/${date.getDate()}`;
            case 'all':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            default:
                return dateStr;
        }
    };

    const chartData = {
        labels: Object.keys(visitorData).map(formatLabel),
        datasets: [
            {
                label: '방문자',
                data: Object.values(visitorData).map(v => v.visitors),
                borderColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
                backgroundColor: isDarkMode
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
                pointBorderColor: isDarkMode ? '#1f2937' : '#ffffff',
                pointBorderWidth: 2,
            },
            {
                label: '방문수',
                data: Object.values(visitorData).map(v => v.visits),
                borderColor: isDarkMode ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
                backgroundColor: isDarkMode
                    ? 'rgba(249, 115, 22, 0.1)'
                    : 'rgba(234, 88, 12, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: isDarkMode ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
                pointBorderColor: isDarkMode ? '#1f2937' : '#ffffff',
                pointBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    font: {
                        size: 12,
                        weight: 500,
                    },
                },
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                titleColor: isDarkMode ? '#e5e7eb' : '#111827',
                bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context: { dataset: { label?: string }, parsed: { y: number } }) {
                        const label = context.dataset.label || '';
                        return `${label}: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    font: {
                        size: 11,
                    },
                    maxRotation: 45,
                    minRotation: 0,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    font: {
                        size: 11,
                    },
                    callback: function(value: number | string) {
                        return typeof value === 'number' ? value.toLocaleString() : value;
                    }
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    return (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    방문자 통계
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            period === 'week'
                                ? isDarkMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        주간
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            period === 'month'
                                ? isDarkMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        월간
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            period === 'all'
                                ? isDarkMode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-500 text-white'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        전체
                    </button>
                </div>
            </div>

            <div className="relative h-80">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            데이터 로딩 중...
                        </div>
                    </div>
                ) : Object.keys(visitorData).length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            데이터가 없습니다
                        </div>
                    </div>
                ) : (
                    <Line data={chartData} options={chartOptions} />
                )}
            </div>

            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            총 방문자
                        </div>
                        <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {Object.values(visitorData).reduce((a, b) => a + b.visitors, 0).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            총 방문수
                        </div>
                        <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {Object.values(visitorData).reduce((a, b) => a + b.visits, 0).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            평균 방문자
                        </div>
                        <div className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {Object.keys(visitorData).length > 0
                                ? Math.round(
                                    Object.values(visitorData).reduce((a, b) => a + b.visitors, 0) /
                                    Object.keys(visitorData).length
                                ).toLocaleString()
                                : 0}
                        </div>
                    </div>
                    <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            최대 방문수
                        </div>
                        <div className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {Object.keys(visitorData).length > 0
                                ? Math.max(...Object.values(visitorData).map(v => v.visits)).toLocaleString()
                                : 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
