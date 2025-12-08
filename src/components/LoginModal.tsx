'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNaverLogin = () => {
        router.push('/auth/naver');
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-black/40 p-0 md:p-4"
            onClick={handleBackdropClick}
        >
            {/* 모달 컨테이너 - 모바일은 전체화면, 데스크톱은 팝업 */}
            <div className="relative w-full h-full md:h-auto md:max-w-md md:rounded-2xl bg-white dark:bg-gray-800 overflow-y-auto">
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                    aria-label="닫기"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 모달 콘텐츠 */}
                <div className="p-8 md:p-10">
                    {/* 헤더 */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            로그인
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            계속 진행할 경우 슉라이브(Shooq.live)의 <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">이용약관</a>에 동의하고 <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">개인정보 처리방침</a>을 이해하고 동의한 것으로 간주됩니다.
                        </p>
                    </div>

                    {/* 로그인 버튼들 */}
                    <div className="space-y-3">
                        {/* 네이버로 계속하기 */}
                        <button
                            type="button"
                            onClick={handleNaverLogin}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-full text-white bg-[#03C75A] hover:bg-[#02B351] transition-colors duration-200 font-medium cursor-pointer"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                            </svg>
                            네이버로 계속하기
                        </button>

                        {/* 카카오로 계속하기 (준비 중) */}
                        <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-full text-gray-900 bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-200 font-medium opacity-50 cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                            </svg>
                            카카오로 계속하기
                        </button>

                        {/* Google로 계속하기 (준비 중) */}
                        <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium opacity-50 cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                            Google 계정으로 계속하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
