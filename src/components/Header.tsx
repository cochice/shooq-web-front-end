'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';

interface HeaderProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    isSidebarOpen?: boolean;
    onToggleSidebar?: () => void;
    title?: string;
    searchKeyword?: string;
    onSearchKeywordChange?: (value: string) => void;
    onSearch?: (keyword: string) => void;
    onClearSearch?: () => void;
    isSearchMode?: boolean;
    showUnreadOnly?: boolean;
    onToggleUnreadOnly?: () => void;
    isNewWindowMode?: boolean;
    onToggleNewWindowMode?: () => void;
    onHomeClick?: () => void;
    showDarkModeToggle?: boolean;
    showUserMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    onToggleDarkMode,
    isSidebarOpen,
    onToggleSidebar,
    title,
    searchKeyword = '',
    onSearchKeywordChange,
    onSearch,
    onClearSearch,
    isSearchMode = false,
    showUnreadOnly = false,
    onToggleUnreadOnly,
    isNewWindowMode = false,
    onToggleNewWindowMode,
    onHomeClick, // eslint-disable-line @typescript-eslint/no-unused-vars
    showDarkModeToggle = true,
    showUserMenu = false
}) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<{ nickname?: string; profileImageUrl?: string } | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 로그인 상태 체크 함수
    const checkLoginStatus = () => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!token);
        if (user) {
            try {
                setUserInfo(JSON.parse(user));
            } catch (e) {
                console.error('Failed to parse user info:', e);
                setUserInfo(null);
            }
        } else {
            setUserInfo(null);
        }
    };

    useEffect(() => {
        checkLoginStatus();

        // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시 동기화)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'access_token' || e.key === 'user') {
                checkLoginStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // 커스텀 이벤트 리스너 추가 (같은 탭에서 로그인 시 업데이트)
        const handleLoginEvent = () => {
            checkLoginStatus();
        };

        window.addEventListener('loginStateChanged', handleLoginEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('loginStateChanged', handleLoginEvent);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setIsUserMenuOpen(false);
        router.push('/');
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="flex">
                {/* Left sidebar area - Logo */}
                <div className="w-80 flex-shrink-0 px-4 py-3 hidden lg:flex items-center">
                    <Link
                        href="/" prefetch={false} onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/';   // 완전 새로고침. 
                        }}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <Image
                            src="/shooq_cat_logo.png"
                            alt="Shooq Logo"
                            width={40}
                            height={40}
                        />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Shooq Live</span>
                    </Link>
                </div>

                {/* Main content area */}
                <div className="flex-1 px-4 py-3">
                    <div className="max-w-4xl relative flex items-center justify-start space-x-4">
                        {/* Mobile Hamburger Menu and Logo */}
                        <div className="lg:hidden flex items-center space-x-4">
                            {onToggleSidebar && (
                                <button
                                    type="button"
                                    onClick={onToggleSidebar}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                    aria-label={isSidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
                                >
                                    {isSidebarOpen ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            )}

                            <Link
                                href="/" prefetch={false} onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '/';   // 완전 새로고침
                                }}
                                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                                <Image
                                    src="/shooq_cat_logo.png"
                                    alt="Shooq Logo"
                                    width={40}
                                    height={40}
                                />
                                <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">Shooq</span>
                            </Link>
                        </div>

                        {/* Search bar or title */}
                        {onSearch ? (
                            <div className="flex-1 max-w-lg ml-2 sm:ml-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => onSearchKeywordChange?.(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                onSearch(e.currentTarget.value);
                                            }
                                        }}
                                        placeholder="Shooq 검색"
                                        className="w-full px-4 py-2 pr-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {isSearchMode && onClearSearch && (
                                        <button
                                            type="button"
                                            onClick={onClearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title="검색 취소"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : title ? (
                            <div className="hidden lg:block">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            </div>
                        ) : null}

                        <div className="absolute right-4 flex items-center space-x-2 sm:space-x-4">
                            {/* Create Post Button (로그인 시에만 표시) */}
                            {isLoggedIn && (
                                <Link
                                    href="/post/new"
                                    className="p-2 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
                                    aria-label="새 글 작성"
                                    title="새 글 작성"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </Link>
                            )}

                            {/* Unread Only Mode Toggle - Hidden */}
                            {onToggleUnreadOnly && false && (
                                <button
                                    type="button"
                                    onClick={onToggleUnreadOnly}
                                    className={`p-2 text-gray-600 dark:text-gray-300 rounded-full ${showUnreadOnly ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}`}
                                    aria-label="안 본 글만 보기 토글"
                                    title={showUnreadOnly ? "안 본 글만 보기: 켜짐" : "안 본 글만 보기: 꺼짐"}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {showUnreadOnly && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            )}

                            {/* New Window Mode Toggle - Hidden */}
                            {onToggleNewWindowMode && false && (
                                <button
                                    type="button"
                                    onClick={onToggleNewWindowMode}
                                    className={`p-2 text-gray-600 dark:text-gray-300 rounded-full ${isNewWindowMode ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' : ''}`}
                                    aria-label="새창 모드 토글"
                                    title={isNewWindowMode ? "새창 모드: 켜짐 (링크를 새창에서 열기)" : "새창 모드: 꺼짐 (링크를 현재창에서 열기)"}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    {isNewWindowMode && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                                    )}
                                </button>
                            )}

                            {/* 전체 보기 버튼 (main 페이지에서만) */}
                            {title && title !== '프로필' && (
                                <Link
                                    href="/hot"
                                    className="px-4 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                                >
                                    전체 보기
                                </Link>
                            )}

                            {/* User Menu / Login Button */}
                            {showUserMenu && (
                                <>
                                    {isLoggedIn ? (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                aria-label="사용자 메뉴"
                                            >
                                                {userInfo?.profileImageUrl ? (
                                                    <Image
                                                        src={userInfo?.profileImageUrl}
                                                        alt="프로필"
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {userInfo?.nickname?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="hidden sm:block text-sm font-medium">
                                                    {userInfo?.nickname || '사용자'}
                                                </span>
                                            </button>

                                            {isUserMenuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    ></div>
                                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                                                        {/* 사용자 정보 */}
                                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center space-x-3">
                                                                {userInfo?.profileImageUrl ? (
                                                                    <Image
                                                                        src={userInfo?.profileImageUrl}
                                                                        alt="프로필"
                                                                        width={40}
                                                                        height={40}
                                                                        className="rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                                                                        <span className="text-white font-bold">
                                                                            {userInfo?.nickname?.charAt(0).toUpperCase() || 'U'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {userInfo?.nickname || '사용자'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        로그인됨
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 메뉴 항목 */}
                                                        <div className="py-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsUserMenuOpen(false);
                                                                    router.push('/profile');
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span>프로필</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleLogout}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                                </svg>
                                                                <span>로그아웃</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleLoginClick}
                                            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors cursor-pointer"
                                        >
                                            로그인
                                        </button>
                                    )}
                                </>
                            )}

                            {/* Dark Mode Toggle */}
                            {showDarkModeToggle && (
                                <button
                                    type="button"
                                    onClick={onToggleDarkMode}
                                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="다크 모드 토글"
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
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 로그인 모달 */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </header>
    );
};

export default Header;