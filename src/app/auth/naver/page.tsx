'use client';

import { useEffect } from 'react';

export default function NaverAuthPage() {
    useEffect(() => {
        // 네이버 OAuth 설정
        const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/naver/callback`;

        // CSRF 방지를 위한 state 값 생성
        const state = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('naver_oauth_state', state);

        // 네이버 로그인 URL 생성
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

        // 네이버 로그인 페이지로 리디렉션
        window.location.href = naverAuthUrl;
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    네이버 로그인으로 이동 중...
                </h2>
            </div>
        </div>
    );
}
