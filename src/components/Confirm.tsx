'use client';

import React, { useEffect } from 'react';

interface ConfirmProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
}

const Confirm: React.FC<ConfirmProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    type = 'info'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'danger':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getConfirmButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 hover:bg-green-600';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'danger':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-orange-500 hover:bg-orange-600';
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={onCancel}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            {title && (
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h2>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${getConfirmButtonColor()}`}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirm;
