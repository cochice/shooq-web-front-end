'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // 다크모드 설정 불러오기
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }

        // 이미 로그인된 경우 메인으로 리디렉션
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            router.push('/');
        }
    }, [router]);

    const handleNaverLogin = () => {
        router.push('/auth/naver');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* 헤더 */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                                슉라이브
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* 로고 및 타이틀 */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            슉라이브
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            커뮤니티 인기글 모음
                        </p>
                    </div>

                    {/* 로그인 카드 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                로그인
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                소셜 계정으로 간편하게 로그인하세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* 네이버 로그인 버튼 */}
                            <button
                                onClick={handleNaverLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-[#03C75A] hover:bg-[#02B351] transition-colors duration-200 font-medium"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                                </svg>
                                네이버로 로그인
                            </button>

                            {/* 구글 로그인 버튼 (준비 중) */}
                            <button
                                disabled
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium opacity-50 cursor-not-allowed"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                구글로 로그인 (준비 중)
                            </button>

                            {/* 카카오 로그인 버튼 (준비 중) */}
                            <button
                                disabled
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-gray-900 bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-200 font-medium opacity-50 cursor-not-allowed"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                                </svg>
                                카카오로 로그인 (준비 중)
                            </button>
                        </div>

                        {/* 구분선 */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    또는
                                </span>
                            </div>
                        </div>

                        {/* 비회원으로 계속하기 */}
                        <Link
                            href="/"
                            className="block w-full text-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                        >
                            비회원으로 계속하기
                        </Link>
                    </div>

                    {/* 추가 정보 */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>
                            로그인하시면{' '}
                            <a
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-500 hover:underline"
                            >
                                이용약관
                            </a>
                            {' '}및{' '}
                            <a
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-500 hover:underline"
                            >
                                개인정보처리방침
                            </a>
                            에 동의하게 됩니다.
                        </p>
                    </div>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        © 2024 슉라이브. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
