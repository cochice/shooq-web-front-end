'use client';

import { useState, useEffect } from 'react';
import { ApiService, SiteBbsInfo, PagedResult } from '@/lib/api';
import PostDetailOverlay from '@/components/PostDetailOverlay';

interface ContentManagementTabProps {
    isDarkMode: boolean;
}

export default function ContentManagementTab({ isDarkMode }: ContentManagementTabProps) {
    const [posts, setPosts] = useState<SiteBbsInfo[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [siteFilter, setSiteFilter] = useState<string>('');
    const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
    const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top' | 'rising'>('new');
    const [topPeriod, setTopPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [sites, setSites] = useState<string[]>([]);

    const pageSize = 20;

    const loadPosts = async (pageNum = page) => {
        setLoading(true);
        try {
            const result: PagedResult<SiteBbsInfo> = await ApiService.getPosts(
                pageNum,
                pageSize,
                siteFilter || undefined,
                searchKeyword || undefined,
                undefined,
                undefined,
                sortBy,
                sortBy === 'top' ? topPeriod : undefined
            );
            setPosts(result.data);
            setPage(result.page);
            setTotalCount(result.totalCount);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error('게시물 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSites = async () => {
        try {
            const siteList = await ApiService.getSites();
            setSites(siteList);
        } catch (error) {
            console.error('사이트 목록 로드 실패:', error);
        }
    };

    useEffect(() => {
        loadPosts();
        loadSites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadPosts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, topPeriod, siteFilter]);

    const handleSearch = () => {
        setPage(1);
        loadPosts(1);
    };

    const togglePostSelection = (postNo: number) => {
        setSelectedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postNo)) {
                newSet.delete(postNo);
            } else {
                newSet.add(postNo);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        if (selectedPosts.size === posts.length) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(posts.map(p => p.no)));
        }
    };

    const deleteSelected = async () => {
        if (selectedPosts.size === 0) {
            alert('삭제할 게시물을 선택해주세요.');
            return;
        }

        if (!confirm(`선택한 ${selectedPosts.size}개의 게시물을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const deletePromises = Array.from(selectedPosts).map(no =>
                ApiService.deletePost(no)
            );
            await Promise.all(deletePromises);
            alert('게시물이 삭제되었습니다.');
            setSelectedPosts(new Set());
            loadPosts();
        } catch (error) {
            console.error('게시물 삭제 실패:', error);
            alert('게시물 삭제에 실패했습니다.');
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    };

    return (
        <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            검색어
                        </label>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="제목 또는 내용 검색"
                            className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            사이트
                        </label>
                        <select
                            value={siteFilter}
                            onChange={(e) => setSiteFilter(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="">전체</option>
                            {sites.map(site => (
                                <option key={site} value={site}>{site}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[120px]">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            정렬
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="new">최신순</option>
                            <option value="hot">인기순</option>
                            <option value="top">TOP</option>
                        </select>
                    </div>

                    {sortBy === 'top' && (
                        <div className="min-w-[120px]">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                기간
                            </label>
                            <select
                                value={topPeriod}
                                onChange={(e) => setTopPeriod(e.target.value as typeof topPeriod)}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="today">오늘</option>
                                <option value="week">주간</option>
                                <option value="month">월간</option>
                                <option value="all">전체</option>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        검색
                    </button>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        총 {totalCount.toLocaleString()}개의 게시물
                        {selectedPosts.size > 0 && ` (${selectedPosts.size}개 선택)`}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className={`px-4 py-2 text-sm rounded-lg ${
                                isDarkMode
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {selectedPosts.size === posts.length ? '전체 해제' : '전체 선택'}
                        </button>
                        <button
                            onClick={deleteSelected}
                            disabled={selectedPosts.size === 0}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                        >
                            선택 삭제
                        </button>
                    </div>
                </div>
            </div>

            {/* 게시물 목록 */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border`}>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">로딩 중...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">게시물이 없습니다.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th className="px-6 py-3 w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.size === posts.length && posts.length > 0}
                                            onChange={selectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        제목
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        사이트
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        작성자
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        날짜
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        조회/추천
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {posts.map((post) => (
                                    <tr key={post.no} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedPosts.has(post.no)}
                                                onChange={() => togglePostSelection(post.no)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedPostId(post.no.toString())}
                                                className={`text-left hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                            >
                                                {post.title || '제목 없음'}
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {post.site}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {post.author}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {formatDate(post.date)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {post.views || 0} / {post.likes || 0}
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
                        onClick={() => {
                            const newPage = Math.max(1, page - 1);
                            setPage(newPage);
                            loadPosts(newPage);
                        }}
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
                        onClick={() => {
                            const newPage = Math.min(totalPages, page + 1);
                            setPage(newPage);
                            loadPosts(newPage);
                        }}
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
