'use client';

import { useState, useCallback } from 'react';

interface AlertOptions {
    title?: string;
    message: string;
    confirmText?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

export const useAlert = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [alertOptions, setAlertOptions] = useState<AlertOptions>({
        message: '',
        type: 'info'
    });

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertOptions(options);
        setIsOpen(true);
    }, []);

    const hideAlert = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        alertOptions,
        showAlert,
        hideAlert
    };
};
