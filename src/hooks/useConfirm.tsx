'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
    onConfirm: () => void;
}

export const useConfirm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
        message: '',
        type: 'info',
        onConfirm: () => {}
    });

    const showConfirm = useCallback((options: ConfirmOptions) => {
        setConfirmOptions(options);
        setIsOpen(true);
    }, []);

    const hideConfirm = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        confirmOptions,
        showConfirm,
        hideConfirm
    };
};
