// localStorage 유틸리티 함수
export const StorageUtils = {
    // 안전한 localStorage 읽기
    getItem: (key: string, defaultValue: string = ''): string => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (error) {
            console.warn(`Failed to read from localStorage key: ${key}`, error);
            return defaultValue;
        }
    },

    // 안전한 localStorage 쓰기
    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Failed to write to localStorage key: ${key}`, error);
        }
    },

    // 불린 값 읽기
    getBoolean: (key: string, defaultValue: boolean = false): boolean => {
        const value = StorageUtils.getItem(key);
        if (value === '') return defaultValue;
        return value === 'true';
    },

    // 불린 값 쓰기
    setBoolean: (key: string, value: boolean): void => {
        StorageUtils.setItem(key, value.toString());
    },

    // Set<string> 읽기
    getStringSet: (key: string): Set<string> => {
        const value = StorageUtils.getItem(key);
        if (!value) return new Set();
        try {
            const array = JSON.parse(value);
            return new Set(Array.isArray(array) ? array : []);
        } catch (error) {
            console.warn(`Failed to parse Set from localStorage key: ${key}`, error);
            return new Set();
        }
    },

    // Set<string> 쓰기
    setStringSet: (key: string, value: Set<string>): void => {
        const array = Array.from(value);
        StorageUtils.setItem(key, JSON.stringify(array));
    }
};
