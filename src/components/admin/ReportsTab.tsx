'use client';

import { useState, useEffect } from 'react';
import { ApiService, Report, PagedResult } from '@/lib/api';
import PostDetailOverlay from '@/components/PostDetailOverlay';

interface ReportsTabProps {
    isDarkMode: boolean;
}

export default function ReportsTab({ isDarkMode }: ReportsTabProps) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [processingReportId, setProcessingReportId] = useState<number | null>(null);
    const [reviewNote, setReviewNote] = useState<string>('');

    const pageSize = 20;

    const loadReports = async () => {
        setLoading(true);
        try {
            const result: PagedResult<Report> = await ApiService.getReports(
                page,
                pageSize,
                statusFilter || undefined
            );
            setReports(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('신고 목록 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter]);

    const handleStatusUpdate = async (reportId: number, newStatus: string) => {
        if (!confirm(`이 신고를 "${getStatusLabel(newStatus)}" 상태로 변경하시겠습니까?`)) {
            return;
        }

        try {
            await ApiService.updateReportStatus(reportId, newStatus, reviewNote || undefined);
            alert('신고 상태가 업데이트되었습니다.');
            setReviewNote('');
            setProcessingReportId(null);
            loadReports();
        } catch (error) {
            console.error('신고 상태 업데이트 실패:', error);
            alert('신고 상태 업데이트에 실패했습니다.');
        }
    };

    const getStatusLabel = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': '대기중',
            'in_review': '검토중',
            'approved': '승인',
            'rejected': '거부',
            'dismissed': '기각'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string): string => {
        const colorMap: Record<string, string> = {
            'pending': isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
            'in_review': isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
            'approved': isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
            'rejected': isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
            'dismissed': isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
        };
        return colorMap[status] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
    };

    const getReasonLabel = (reasonCode: string): string => {
        const reasonMap: Record<string, string> = {
            'spam': '스팸',
            'inappropriate': '부적절한 콘텐츠',
            'harassment': '괴롭힘',
            'violence': '폭력',
            'hate_speech': '혐오 발언',
            'misinformation': '허위 정보',
            'copyright': '저작권 침해',
            'other': '기타'
        };
        return reasonMap[reasonCode] || reasonCode;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return (
        <div className="space-y-6">
            {/* 필터 섹션 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            상태 필터
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="">전체</option>
                            <option value="pending">대기중</option>
                            <option value="in_review">검토중</option>
                            <option value="approved">승인</option>
                            <option value="rejected">거부</option>
                            <option value="dismissed">기각</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => loadReports()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            새로고침
                        </button>
                    </div>
                </div>

                <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    총 {totalCount.toLocaleString()}건의 신고
                </div>
            </div>

            {/* 신고 목록 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border`}>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">로딩 중...</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">신고 내역이 없습니다.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        신고 ID
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        콘텐츠
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        신고 사유
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        신고자
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        신고 일시
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        상태
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {reports.map((report) => (
                                    <tr key={report.reportId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            #{report.reportId}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                                                {report.post ? (
                                                    <>
                                                        <button
                                                            onClick={() => setSelectedPostId(report.contentId.toString())}
                                                            className="text-blue-500 hover:underline text-left"
                                                        >
                                                            {report.post.title || '제목 없음'}
                                                        </button>
                                                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            {report.post.site} • {report.post.author}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">콘텐츠 정보 없음</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>
                                                {getReasonLabel(report.reasonCode)}
                                            </div>
                                            {report.description && (
                                                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} max-w-xs truncate`}>
                                                    {report.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {report.reporterNickname || '익명'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {formatDate(report.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                {getStatusLabel(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {processingReportId === report.reportId ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={reviewNote}
                                                        onChange={(e) => setReviewNote(e.target.value)}
                                                        placeholder="검토 노트 (선택사항)"
                                                        className={`w-full px-2 py-1 text-xs rounded border ${
                                                            isDarkMode
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleStatusUpdate(report.reportId, 'approved')}
                                                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                        >
                                                            승인
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(report.reportId, 'rejected')}
                                                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            거부
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setProcessingReportId(null);
                                                                setReviewNote('');
                                                            }}
                                                            className={`px-2 py-1 text-xs rounded ${
                                                                isDarkMode
                                                                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            }`}
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setProcessingReportId(report.reportId)}
                                                    disabled={report.status !== 'pending' && report.status !== 'in_review'}
                                                    className={`px-3 py-1 text-xs rounded ${
                                                        report.status !== 'pending' && report.status !== 'in_review'
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    처리
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-lg ${
                            page === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        이전
                    </button>
                    <span className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded-lg ${
                            page === totalPages
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 게시물 상세 오버레이 */}
            {selectedPostId && (
                <PostDetailOverlay
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => {}}
                />
            )}
        </div>
    );
}
