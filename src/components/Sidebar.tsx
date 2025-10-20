'use client';

import React from 'react';

interface SidebarProps {
    isSidebarOpen?: boolean;
    onCloseSidebar?: () => void;
    className?: string;
    onNavigate?: (href: string) => void;
}

/*
커뮤니티 순위
FMKorea, 1
TheQoo, 2
Ppomppu, 3
Ruliweb, 4
Inven, 5
MlbPark, 6
Clien, 7
BobaeDream, 8
Humoruniv, 9
82Cook, 10
SlrClub, 11
Damoang, 12
TodayHumor, 13
*/

// 하드코딩된 사이트 목록
const HARDCODED_SITES = {
    news: [
        { code: 'NaverNews', name: 'NaverNews', letter: 'N', bgColor: 'rgb(40, 181, 78)', textColor: 'white' },
        { code: 'GoogleNews', name: 'GoogleNews', letter: 'G', bgColor: 'rgb(53, 112, 255)', textColor: 'white' }
    ],
    community: [
        { code: 'Humoruniv', name: 'Humoruniv', letter: 'H', bgColor: 'rgb(219, 23, 55)', textColor: 'white' },
        { code: 'TheQoo', name: 'TheQoo', letter: 'T', bgColor: 'rgb(42, 65, 95)', textColor: 'white' },
        { code: 'Ppomppu', name: 'Ppomppu', letter: 'P', bgColor: 'rgb(199, 199, 199)', textColor: 'rgb(75, 85, 99)' },
        { code: 'Clien', name: 'Clien', letter: 'C', bgColor: 'rgb(25, 36, 125)', textColor: 'white' },
        { code: 'TodayHumor', name: 'TodayHumor', letter: 'T', bgColor: 'rgb(255, 255, 255)', textColor: 'rgb(75, 85, 99)' },
        { code: 'SlrClub', name: 'SlrClub', letter: 'S', bgColor: 'rgb(66, 116, 175)', textColor: 'white' },
        { code: 'Ruliweb', name: 'Ruliweb', letter: 'R', bgColor: 'rgb(255, 102, 0)', textColor: 'white' },
        { code: '82Cook', name: '82Cook', letter: '8', bgColor: 'rgb(230, 230, 230)', textColor: 'rgb(75, 85, 99)' },
        { code: 'BobaeDream', name: 'BobaeDream', letter: 'B', bgColor: 'rgb(16, 90, 174)', textColor: 'white' },
        { code: 'Inven', name: 'Inven', letter: 'I', bgColor: 'rgb(240, 255, 255)', textColor: 'rgb(239, 68, 68)' },
        { code: 'Damoang', name: 'Damoang', letter: 'D', bgColor: 'rgb(138, 43, 226)', textColor: 'white' },
        { code: 'FMKorea', name: 'FMKorea', letter: 'F', bgColor: 'rgb(62, 97, 197)', textColor: 'white' },
        { code: 'MlbPark', name: 'MlbPark', letter: 'M', bgColor: 'rgb(65, 106, 220)', textColor: 'white' },
    ]
};

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    onCloseSidebar,
    className = "",
    onNavigate,
}) => {
    const [isSidebarHovered, setIsSidebarHovered] = React.useState(false);

    // 모바일 사이드바인 경우
    if (isSidebarOpen !== undefined) {
        return (
            <>
                {/* Mobile Sidebar Overlay */}
                <div className={`lg:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                    {/* Backdrop with dim effect */}
                    <div
                        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isSidebarOpen ? 'bg-opacity-40' : 'bg-opacity-0'}`}
                        onClick={onCloseSidebar}
                    ></div>

                    {/* Sidebar Content */}
                    <div className={`relative z-41 bg-gray-900 w-80 h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="p-4 h-full flex flex-col">
                            {/* 메뉴 헤더 */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-white">메뉴</h2>
                            </div>

                            {/* 고정된 네비게이션 버튼들 */}
                            <div className="mb-6 space-y-2">
                                {/* 홈 버튼 */}
                                <button
                                    type="button"
                                    className="flex items-center space-x-3 w-full px-3 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => {
                                        onNavigate?.('/');
                                        onCloseSidebar?.();
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">홈</span>
                                </button>

                                {/* 오늘의 핫이슈 버튼 */}
                                <button
                                    type="button"
                                    className="flex items-center space-x-3 w-full px-3 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => {
                                        onNavigate?.('/hot');
                                        onCloseSidebar?.();
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="font-medium">오늘의 핫이슈</span>
                                </button>

                                {/* 주간집계 버튼 */}
                                <button
                                    type="button"
                                    className="flex items-center space-x-3 w-full px-3 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => {
                                        onNavigate?.('/week');
                                        onCloseSidebar?.();
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="font-medium">주간집계</span>
                                </button>

                                {/* 최신 뉴스 버튼 */}
                                <button
                                    type="button"
                                    className="flex items-center space-x-3 w-full px-3 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => {
                                        onNavigate?.('/news');
                                        onCloseSidebar?.();
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    <span className="font-medium">최신 뉴스</span>
                                </button>

                                {/* 구분선 */}
                                <div className="border-t border-gray-700 my-4"></div>
                            </div>

                            {/* 스크롤 가능한 사이트 목록 */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-6 pr-2">
                                    {/* 커뮤니티 섹션 */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-300">커뮤니티 ({HARDCODED_SITES.community.length}개)</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {HARDCODED_SITES.community.map((site) => (
                                                <button
                                                    key={site.code}
                                                    type="button"
                                                    className="flex items-center space-x-3 w-full px-2 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                                                    onClick={() => {
                                                        onNavigate?.(`/hot?site=${site.code}`);
                                                        onCloseSidebar?.();
                                                    }}
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                        style={{
                                                            backgroundColor: site.bgColor,
                                                            color: site.textColor
                                                        }}
                                                    >
                                                        {site.letter}
                                                    </div>
                                                    <span className="text-sm font-medium">{site.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // 데스크탑 사이드바
    return (
        <aside className={`hidden lg:block w-80 flex-shrink-0 space-y-4 p-4 ${className}`}>
            <div className="sticky top-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-8rem)] flex flex-col">
                    {/* 고정된 네비게이션 버튼들 */}
                    <div className="mb-6 space-y-2">
                        {/* 홈 버튼 */}
                        <button
                            type="button"
                            className="flex items-center space-x-3 w-full px-3 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => {
                                onNavigate?.('/');
                                onCloseSidebar?.();
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">홈</span>
                        </button>

                        {/* 오늘의 핫이슈 버튼 */}
                        <button
                            type="button"
                            className="flex items-center space-x-3 w-full px-3 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => {
                                onNavigate?.('/hot');
                                onCloseSidebar?.();
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-medium">오늘의 핫이슈</span>
                        </button>

                        {/* 주간집계 버튼 */}
                        <button
                            type="button"
                            className="flex items-center space-x-3 w-full px-3 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => {
                                onNavigate?.('/week');
                                onCloseSidebar?.();
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="font-medium">주간집계</span>
                        </button>

                        {/* 최신 뉴스 버튼 */}
                        <button
                            type="button"
                            className="flex items-center space-x-3 w-full px-3 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => {
                                onNavigate?.('/news');
                                onCloseSidebar?.();
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <span className="font-medium">최신 뉴스</span>
                        </button>

                        {/* 구분선 */}
                        <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>
                    </div>

                    {/* 스크롤 가능한 사이트 목록 */}
                    <div
                        className={`flex-1 overflow-y-auto ${!isSidebarHovered ? '[&::-webkit-scrollbar]:hidden' : '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent'}`}
                        onMouseEnter={() => setIsSidebarHovered(true)}
                        onMouseLeave={() => setIsSidebarHovered(false)}
                        style={{
                            scrollbarWidth: isSidebarHovered ? 'thin' : 'none',
                            scrollbarColor: isSidebarHovered ? 'rgb(156, 163, 175) transparent' : 'transparent transparent',
                        } as React.CSSProperties}
                    >
                        <div className="space-y-6 pr-2">
                            {/* 커뮤니티 섹션 */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">커뮤니티 ({HARDCODED_SITES.community.length}개)</h3>
                                </div>
                                <div className="space-y-2">
                                    {HARDCODED_SITES.community.map((site) => (
                                        <button
                                            key={site.code}
                                            type="button"
                                            className="flex items-center space-x-3 w-full px-2 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            onClick={() => {
                                                onNavigate?.(`/?site=${site.code}`);
                                                onCloseSidebar?.();
                                            }}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                style={{
                                                    backgroundColor: site.bgColor,
                                                    color: site.textColor
                                                }}
                                            >
                                                {site.letter}
                                            </div>
                                            <span className="text-sm font-medium">{site.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;