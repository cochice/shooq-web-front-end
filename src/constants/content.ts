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
    'ㅇㅎ', 'ㅎㅂ', '19금'
] as const;
