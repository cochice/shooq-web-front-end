'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NaverCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processNaverCallback = async () => {
            try {
                // URL에서 인증 코드와 상태값 가져오기
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');

                // 에러가 있는 경우
                if (errorParam) {
                    setError(errorDescription || '네이버 로그인 중 오류가 발생했습니다.');
                    setIsProcessing(false);
                    return;
                }

                // 필수 파라미터 확인
                if (!code || !state) {
                    setError('인증 정보가 올바르지 않습니다.');
                    setIsProcessing(false);
                    return;
                }

                // 저장된 state 값과 비교 (CSRF 방지)
                const savedState = sessionStorage.getItem('naver_oauth_state');
                if (savedState !== state) {
                    setError('인증 상태가 일치하지 않습니다. 다시 시도해주세요.');
                    setIsProcessing(false);
                    return;
                }

                // 백엔드 API로 인증 코드 전송
                const backendUrl = process.env.NEXT_PUBLIC_API_URL;

                if (!backendUrl) {
                    throw new Error('백엔드 API URL이 설정되지 않았습니다.');
                }

                // 필수 동의 항목 (LoginModal에서 표시된 내용과 동일)
                const consents = [
                    {
                        consentType: 'terms_of_service',
                        consentVersion: '1.0',
                        isRequired: true,
                        isAgreed: true
                    },
                    {
                        consentType: 'privacy_policy',
                        consentVersion: '1.0',
                        isRequired: true,
                        isAgreed: true
                    }
                ];

                const response = await fetch(`${backendUrl}/api/auth/naver/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code,
                        state,
                        consents
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '로그인 처리 중 오류가 발생했습니다.');
                }

                const data = await response.json();

                // 응답 데이터 확인
                console.log('Login response:', data);

                // 토큰 저장 (data.data 안에 있음)
                if (data.data?.accessToken) {
                    localStorage.setItem('access_token', data.data.accessToken);
                    if (data.data.refreshToken) {
                        localStorage.setItem('refresh_token', data.data.refreshToken);
                    }
                }

                // 사용자 정보 저장 (data.data.user 안에 있음)
                if (data.data?.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                }

                // state 값 정리
                sessionStorage.removeItem('naver_oauth_state');

                // 로그인 상태 변경 이벤트 발생 (헤더 업데이트용)
                window.dispatchEvent(new Event('loginStateChanged'));

                // 메인 페이지로 리디렉션
                router.push('/');
            } catch (err) {
                console.error('Naver OAuth Error:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
                setIsProcessing(false);
            }
        };

        processNaverCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                네이버 로그인 처리 중...
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                잠시만 기다려주세요.
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <div className="text-red-600 dark:text-red-400 mb-4">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                로그인 실패
                            </h2>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                메인으로 돌아가기
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
