'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, SiteBbsInfo } from '@/lib/api';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FullscreenImageViewer from '@/components/FullscreenImageViewer';
import { getSiteLogo } from '@/constants/content';

interface PostDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [post, setPost] = useState<SiteBbsInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // HTML 엔티티 디코딩 함수
    const decodeHtmlEntities = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // 네비게이션 핸들러
    const handleNavigate = (href: string) => {
        router.push(href);
        setIsSidebarOpen(false);
    };

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

    // 다크 모드 초기화
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
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

    // 다크 모드 토글
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (typeof window !== 'undefined') {
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    };

    // 게시글 데이터 로드
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);

                // id 형식: site-no (예: "Clien-18012345")
                const [site, no] = unwrappedParams.id.split('-');

                if (!site || !no) {
                    setError('잘못된 게시글 ID입니다.');
                    setLoading(false);
                    return;
                }

                // API를 통해 특정 게시글 직접 가져오기
                const foundPost = await ApiService.getPost(parseInt(no));

                if (!foundPost) {
                    setError('게시글을 찾을 수 없습니다.');
                } else {
                    setPost(foundPost);
                }
            } catch (err) {
                console.error('게시글 로드 실패:', err);
                setError('게시글을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [unwrappedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    searchKeyword=""
                    onSearchKeywordChange={() => {}}
                    onSearch={() => {}}
                    onClearSearch={() => {}}
                    isSearchMode={false}
                    showUnreadOnly={false}
                    onToggleUnreadOnly={() => {}}
                    isNewWindowMode={false}
                    onToggleNewWindowMode={() => {}}
                    onHomeClick={() => router.push('/')}
                    showDarkModeToggle={true}
                />
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                    onNavigate={handleNavigate}
                />
                <div className="flex justify-center items-center py-20">
                    <img src="/cat_in_a_rocket_loading.gif" alt="로딩 중" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    searchKeyword=""
                    onSearchKeywordChange={() => {}}
                    onSearch={() => {}}
                    onClearSearch={() => {}}
                    isSearchMode={false}
                    showUnreadOnly={false}
                    onToggleUnreadOnly={() => {}}
                    isNewWindowMode={false}
                    onToggleNewWindowMode={() => {}}
                    onHomeClick={() => router.push('/')}
                    showDarkModeToggle={true}
                />
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                    onNavigate={handleNavigate}
                />
                <div className="max-w-4xl mx-auto p-4">
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{error || '게시글을 찾을 수 없습니다.'}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                searchKeyword=""
                onSearchKeywordChange={() => {}}
                onSearch={() => {}}
                onClearSearch={() => {}}
                isSearchMode={false}
                showUnreadOnly={false}
                onToggleUnreadOnly={() => {}}
                isNewWindowMode={false}
                onToggleNewWindowMode={() => {}}
                onHomeClick={() => router.push('/')}
                showDarkModeToggle={true}
            />

            {/* 모바일 사이드바 */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            <div className="flex flex-col lg:flex-row">
                {/* 데스크탑 사이드바 */}
                <Sidebar onNavigate={handleNavigate} />

                {/* 메인 컨텐츠 */}
                <main className="flex-1 p-4 max-w-4xl">
                {/* 뒤로 가기 버튼 */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="뒤로 가기"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* 메타데이터 */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {post.site && (
                        <>
                            <div
                                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mr-2"
                                style={{
                                    backgroundColor: getSiteLogo(post.site).bgColor,
                                    color: getSiteLogo(post.site).textColor
                                }}
                            >
                                {getSiteLogo(post.site).letter}
                            </div>
                            <span className="font-medium">{post.site}</span>
                            <span className="mx-1">•</span>
                        </>
                    )}
                    {post.author && (
                        <>
                            <span>Posted by {post.author}</span>
                            <span className="mx-1">•</span>
                        </>
                    )}
                    <span>{formatDate(post.date)}</span>
                    {post.url && (
                        <>
                            <span className="mx-1">•</span>
                            <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 hover:text-orange-600 flex items-center"
                            >
                                원본 링크
                                <svg className="inline-block ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </>
                    )}
                </div>

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {post.title ? decodeHtmlEntities(post.title) : '제목 없음'}
                </h1>

                {/* 이미지 표시 */}
                {(post.optimizedImagesList && post.optimizedImagesList.length > 0) && (
                    <div className="mb-6">
                        <div className="space-y-4">
                            {post.optimizedImagesList.map((image, index) => (
                                image.cloudinary_url && (
                                    <div key={index} className="w-full">
                                        <img
                                            src={image.cloudinary_url}
                                            alt={`${post.title} - 이미지 ${index + 1}`}
                                            className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            loading="lazy"
                                            onClick={() => setSelectedImageIndex(index)}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* 게시글 내용 */}
                {post.content && (
                    <div className="mb-6">
                        <div
                            className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                )}

                {/* 통계 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {post.likes !== undefined && post.likes !== null && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.likes}</span>
                        </div>
                    )}
                    {post.reply_num !== undefined && post.reply_num !== null && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.reply_num}</span>
                        </div>
                    )}
                    {post.views !== undefined && post.views !== null && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.views}</span>
                        </div>
                    )}
                </div>

                {/* 전체화면 이미지 뷰어 */}
                {selectedImageIndex !== null && post.optimizedImagesList && (
                    <FullscreenImageViewer
                        images={post.optimizedImagesList}
                        initialIndex={selectedImageIndex}
                        isOpen={selectedImageIndex !== null}
                        onClose={() => setSelectedImageIndex(null)}
                    />
                )}
                </main>
            </div>
        </div>
    );
}
