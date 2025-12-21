'use client';

import { useState, useEffect } from 'react';
import { ApiService, SiteBbsInfo } from '@/lib/api';

interface ContentCreationTabProps {
    isDarkMode: boolean;
}

export default function ContentCreationTab({ isDarkMode }: ContentCreationTabProps) {
    const [currentYear] = useState(new Date().getFullYear());
    const [currentMonth] = useState(new Date().getMonth() + 1);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<{ data: SiteBbsInfo[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [contentText, setContentText] = useState('');

    const handleWeekChange = async (week: number) => {
        setCurrentWeek(week);
        setLoading(true);
        try {
            const result = await ApiService.getWeek(
                currentYear.toString(),
                currentMonth.toString().padStart(2, '0'),
                week.toString(),
                selectedDate || undefined
            );
            setWeeklyData(result as unknown as { data: SiteBbsInfo[] });
        } catch (error) {
            console.error('주간 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateFilter = async (dateStr: string | null) => {
        setSelectedDate(dateStr);
        setLoading(true);
        try {
            const result = await ApiService.getWeek(
                currentYear.toString(),
                currentMonth.toString().padStart(2, '0'),
                currentWeek.toString(),
                dateStr || undefined
            );
            setWeeklyData(result as unknown as { data: SiteBbsInfo[] });
        } catch (error) {
            console.error('날짜별 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateContentText = () => {
        if (!weeklyData?.data || weeklyData.data.length === 0) {
            alert('데이터가 없습니다.');
            return;
        }

        const text = weeklyData.data.map((post, index) => {
            const title = post.title || '제목 없음';
            const url = post.url || '';
            return `${index + 1}. ${title}\n${url}\n`;
        }).join('\n');

        setContentText(text);
    };

    const copyToClipboard = () => {
        if (!contentText) {
            alert('생성된 컨텐츠가 없습니다.');
            return;
        }

        navigator.clipboard.writeText(contentText).then(() => {
            alert('클립보드에 복사되었습니다!');
        }).catch(() => {
            alert('복사에 실패했습니다.');
        });
    };

    useEffect(() => {
        handleWeekChange(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            {/* 필터 섹션 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    주간 집계 ({currentYear}년 {currentMonth}월)
                </h2>

                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            주차 선택
                        </label>
                        <select
                            value={currentWeek}
                            onChange={(e) => handleWeekChange(Number(e.target.value))}
                            className={`px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value={1}>1주차</option>
                            <option value={2}>2주차</option>
                            <option value={3}>3주차</option>
                            <option value={4}>4주차</option>
                            <option value={5}>5주차</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            날짜 필터
                        </label>
                        <select
                            value={selectedDate || ''}
                            onChange={(e) => handleDateFilter(e.target.value || null)}
                            className={`px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="">전체</option>
                            {Array.from({ length: 7 }, (_, i) => {
                                const weekStart = (currentWeek - 1) * 7 + 1;
                                const day = weekStart + i;
                                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                return <option key={i} value={dateStr}>{day}일</option>;
                            })}
                        </select>
                    </div>

                    <button
                        onClick={generateContentText}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                        컨텐츠 생성
                    </button>

                    <button
                        onClick={copyToClipboard}
                        disabled={!contentText}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                        복사
                    </button>
                </div>

                <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    총 {weeklyData?.data.length || 0}개의 게시물
                </div>
            </div>

            {/* 게시물 목록 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border`}>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">로딩 중...</div>
                    </div>
                ) : !weeklyData?.data || weeklyData.data.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">데이터가 없습니다.</div>
                    </div>
                ) : (
                    <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                        {weeklyData.data.map((post, index) => (
                            <div
                                key={post.no}
                                className={`p-3 rounded-lg ${
                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                } transition`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {index + 1}.
                                    </div>
                                    <div className="flex-1">
                                        <a
                                            href={post.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`font-medium hover:underline ${
                                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                            }`}
                                        >
                                            {post.title || '제목 없음'}
                                        </a>
                                        <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                            {post.site} • {post.author} • {post.date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 생성된 컨텐츠 */}
            {contentText && (
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        생성된 컨텐츠
                    </h3>
                    <textarea
                        value={contentText}
                        onChange={(e) => setContentText(e.target.value)}
                        className={`w-full h-64 px-4 py-2 rounded-lg border font-mono text-sm ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
            )}
        </div>
    );
}
