'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { ApiService, UserSocialLogin } from '@/lib/api';

interface UserProfile {
    userId: number;
    email?: string;
    nickname: string;
    profileImageUrl?: string;
    birthDate?: string;
    isAdultVerified: boolean;
    status: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [socialLogins, setSocialLogins] = useState<UserSocialLogin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // 로그인 체크
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/');
            return;
        }

        // 다크 모드 설정 복원
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDarkMode(shouldUseDarkMode);
        if (shouldUseDarkMode) {
            document.documentElement.classList.add('dark');
        }

        // 프로필 데이터 로드
        loadProfile();
    }, [router]);

    const loadProfile = async () => {
        try {
            setLoading(true);

            // localStorage에서 사용자 정보 가져오기
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserProfile(user);

                // 사용자 동의 항목 및 소셜 로그인 정보 조회
                try {
                    const logins = await ApiService.getUserSocialLogins(user.userId);
                    setSocialLogins(logins);
                } catch (apiError) {
                    console.error('Failed to load consents or social logins:', apiError);
                    // 동의 항목/소셜 로그인 로드 실패는 치명적이지 않으므로 계속 진행
                }
            } else {
                // localStorage에 정보가 없으면 API에서 조회
                try {
                    const profile = await ApiService.getUserProfile();
                    setUserProfile(profile);
                } catch (apiError) {
                    console.error('Failed to load profile from API:', apiError);
                    setError('프로필 정보를 불러오는데 실패했습니다.');
                }
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('프로필 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatBirthDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return '활성';
            case 'inactive':
                return '비활성';
            case 'suspended':
                return '정지';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    // const getConsentTypeText = (type: string) => {
    //     switch (type) {
    //         case 'terms_of_service':
    //             return '서비스 이용약관';
    //         case 'privacy_policy':
    //             return '개인정보 처리방침';
    //         case 'marketing':
    //             return '마케팅 수신 동의';
    //         case 'age_verification':
    //             return '만 14세 이상 확인';
    //         default:
    //             return type;
    //     }
    // };

    const getProviderIcon = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'naver':
                return '🟢'; // Naver green
            case 'kakao':
                return '🟡'; // Kakao yellow
            case 'google':
                return '🔴'; // Google red
            case 'facebook':
                return '🔵'; // Facebook blue
            default:
                return '🔗';
        }
    };

    const getProviderName = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'naver':
                return '네이버';
            case 'kakao':
                return '카카오';
            case 'google':
                return '구글';
            case 'facebook':
                return '페이스북';
            default:
                return provider;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                    title="프로필"
                    showDarkModeToggle={false}
                    showUserMenu={false}
                />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                    title="프로필"
                    showDarkModeToggle={false}
                    showUserMenu={false}
                />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">{error || '프로필 정보를 불러올 수 없습니다.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                title="프로필"
                showDarkModeToggle={false}
                showUserMenu={false}
            />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 프로필 헤더 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        {/* 프로필 이미지 */}
                        <div className="flex-shrink-0">
                            {userProfile.profileImageUrl ? (
                                <Image
                                    src={userProfile.profileImageUrl}
                                    alt="프로필"
                                    width={96}
                                    height={96}
                                    className="rounded-full object-cover border-4 border-orange-500"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center border-4 border-orange-600">
                                    <span className="text-white font-bold text-4xl">
                                        {userProfile.nickname.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 기본 정보 */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {userProfile.nickname}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userProfile.status)}`}>
                                    {getStatusText(userProfile.status)}
                                </span>
                            </div>
                            {userProfile.email && (
                                <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{userProfile.email}</span>
                                    {userProfile.isEmailVerified && (
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 상세 정보 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">계정 정보</h2>

                    <div className="space-y-4">
                        {/* 이메일 */}
                        {userProfile.email && (
                            <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                                <div className="w-40 flex-shrink-0">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-900 dark:text-white">{userProfile.email}</span>
                                        {userProfile.isEmailVerified && (
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 닉네임 */}
                        <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">닉네임</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{userProfile.nickname}</span>
                            </div>
                        </div>

                        {/* 생년월일 */}
                        <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">생년월일</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{formatBirthDate(userProfile.birthDate)}</span>
                            </div>
                        </div>

                        {/* 성인 인증 */}
                        <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">성인 인증</span>
                            </div>
                            <div className="flex-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userProfile.isAdultVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                                    {userProfile.isAdultVerified ? '인증됨' : '미인증'}
                                </span>
                            </div>
                        </div>

                        {/* 이메일 인증 */}
                        {/* <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일 인증</span>
                            </div>
                            <div className="flex-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userProfile.isEmailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                                    {userProfile.isEmailVerified ? '인증됨' : '미인증'}
                                </span>
                            </div>
                        </div> */}

                        {/* 가입일 */}
                        <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">가입일</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{formatDate(userProfile.createdAt)}</span>
                            </div>
                        </div>

                        {/* 마지막 수정일 */}
                        <div className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">마지막 수정일</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{formatDate(userProfile.updatedAt)}</span>
                            </div>
                        </div>

                        {/* 마지막 로그인 */}
                        <div className="flex items-start">
                            <div className="w-40 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">마지막 로그인</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{formatDate(userProfile.lastLoginAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 소셜 로그인 연결 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">연결된 소셜 계정</h2>

                    {socialLogins.length > 0 ? (
                        <div className="space-y-3">
                            {socialLogins.map((login) => (
                                <div
                                    key={login.socialLoginId}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getProviderIcon(login.provider)}</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {getProviderName(login.provider)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                연결일: {formatDate(login.connectedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">연결됨</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">연결된 소셜 계정이 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 동의 항목 */}
                {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">동의 내역</h2>

                    {userConsents.length > 0 ? (
                        <div className="space-y-4">
                            {userConsents.map((consent) => (
                                <div
                                    key={consent.consentId}
                                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {getConsentTypeText(consent.consentType)}
                                            </h3>
                                            {consent.isRequired && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">
                                                    필수
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <p>버전: {consent.consentVersion}</p>
                                            <p>동의일: {formatDate(consent.agreedAt)}</p>
                                            {consent.isWithdrawn && consent.withdrawnAt && (
                                                <p className="text-red-600 dark:text-red-400">
                                                    철회일: {formatDate(consent.withdrawnAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {consent.isWithdrawn ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                                철회됨
                                            </span>
                                        ) : consent.isAgreed ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                동의함
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                                미동의
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">동의 내역이 없습니다.</p>
                        </div>
                    )}
                </div> */}
            </div>
        </div>
    );
}
