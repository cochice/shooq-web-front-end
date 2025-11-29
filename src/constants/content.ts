// localStorage 키 상수
export const STORAGE_KEYS = {
    THEME: 'shooq-theme',
    NEW_WINDOW_MODE: 'shooq-newWindowMode',
    SEARCH_KEYWORD: 'shooq-searchKeyword',
    SORT_TYPE: 'shooq-sortType',
    READ_POSTS: 'shooq-readPosts',
    SHOW_UNREAD_ONLY: 'shooq-showUnreadOnly'
} as const;

// 성인 콘텐츠 감지 키워드 (추후 확장 가능)
export const ADULT_CONTENT_KEYWORDS = [
    'ㅇㅎ', 'ㅎㅂ', '19금', '후방', '약후방', '에로', '꼴리면', '약후'
] as const;

// 사이트 로고 정보 타입
export interface SiteLogoInfo {
    letter: string;
    bgColor: string;
    textColor: string;
}

// 사이트별 로고 문자 및 색상 정보
export const SITE_LOGOS: Record<string, SiteLogoInfo> = {
    'FMKorea': { letter: 'F', bgColor: 'rgb(62, 97, 197)', textColor: 'white' },
    'Humoruniv': { letter: 'H', bgColor: 'rgb(219, 23, 55)', textColor: 'white' },
    'TheQoo': { letter: 'T', bgColor: 'rgb(42, 65, 95)', textColor: 'white' },
    'NaverNews': { letter: 'N', bgColor: 'rgb(40, 181, 78)', textColor: 'white' },
    'Ppomppu': { letter: 'P', bgColor: 'rgb(199, 199, 199)', textColor: 'rgb(75, 85, 99)' },
    'GoogleNews': { letter: 'G', bgColor: 'rgb(53, 112, 255)', textColor: 'white' },
    'Clien': { letter: 'C', bgColor: 'rgb(25, 36, 125)', textColor: 'white' },
    'TodayHumor': { letter: 'T', bgColor: 'rgb(255, 255, 255)', textColor: 'rgb(75, 85, 99)' },
    'SLRClub': { letter: 'S', bgColor: 'rgb(66, 116, 175)', textColor: 'white' },
    'SlrClub': { letter: 'S', bgColor: 'rgb(66, 116, 175)', textColor: 'white' },
    'Ruliweb': { letter: 'R', bgColor: 'rgb(255, 102, 0)', textColor: 'white' },
    '82Cook': { letter: '8', bgColor: 'rgb(230, 230, 230)', textColor: 'rgb(75, 85, 99)' },
    'MlbPark': { letter: 'M', bgColor: 'rgb(65, 106, 220)', textColor: 'white' },
    'BobaeDream': { letter: 'B', bgColor: 'rgb(16, 90, 174)', textColor: 'white' },
    'Inven': { letter: 'I', bgColor: 'rgb(240, 255, 255)', textColor: 'rgb(239, 68, 68)' },
    'Damoang': { letter: 'D', bgColor: 'rgb(138, 43, 226)', textColor: 'white' },
    'YouTube': { letter: 'Y', bgColor: 'rgb(255, 0, 0)', textColor: 'white' },
} as const;

// 사이트 로고 가져오기 헬퍼 함수
export const getSiteLogo = (site?: string): SiteLogoInfo => {
    if (!site) return { letter: '?', bgColor: 'rgb(107, 114, 128)', textColor: 'white' };
    return SITE_LOGOS[site] || { letter: '?', bgColor: 'rgb(107, 114, 128)', textColor: 'white' };
};

// Sidebar용 사이트 목록 (코드, 이름, 로고 정보 포함)
export interface SiteInfo extends SiteLogoInfo {
    code: string;
    name: string;
}

export const SITE_CATEGORIES = {
    news: [
        { code: 'NaverNews', name: 'NaverNews', ...SITE_LOGOS['NaverNews'] },
        { code: 'GoogleNews', name: 'GoogleNews', ...SITE_LOGOS['GoogleNews'] }
    ] as SiteInfo[],
    community: [
        { code: 'Humoruniv', name: 'Humoruniv', ...SITE_LOGOS['Humoruniv'] },
        { code: 'TheQoo', name: 'TheQoo', ...SITE_LOGOS['TheQoo'] },
        { code: 'Ppomppu', name: 'Ppomppu', ...SITE_LOGOS['Ppomppu'] },
        { code: 'Clien', name: 'Clien', ...SITE_LOGOS['Clien'] },
        { code: 'TodayHumor', name: 'TodayHumor', ...SITE_LOGOS['TodayHumor'] },
        { code: 'SlrClub', name: 'SlrClub', ...SITE_LOGOS['SlrClub'] },
        { code: 'Ruliweb', name: 'Ruliweb', ...SITE_LOGOS['Ruliweb'] },
        { code: '82Cook', name: '82Cook', ...SITE_LOGOS['82Cook'] },
        { code: 'BobaeDream', name: 'BobaeDream', ...SITE_LOGOS['BobaeDream'] },
        { code: 'Inven', name: 'Inven', ...SITE_LOGOS['Inven'] },
        { code: 'Damoang', name: 'Damoang', ...SITE_LOGOS['Damoang'] },
        { code: 'FMKorea', name: 'FMKorea', ...SITE_LOGOS['FMKorea'] },
        { code: 'MlbPark', name: 'MlbPark', ...SITE_LOGOS['MlbPark'] },
        { code: 'YouTube', name: 'YouTube', ...SITE_LOGOS['YouTube'] },
    ] as SiteInfo[]
} as const;
