'use client';

import React, { useEffect } from 'react';

interface AlertProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

const Alert: React.FC<AlertProps> = ({
    isOpen,
    onClose,
    title,
    message,
    confirmText = '확인',
    type = 'info'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

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
            case 'error':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 hover:bg-green-600';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'error':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-orange-500 hover:bg-orange-600';
        }
    };

    // 심플한 디자인 (제목과 타입이 없을 때)
    const isSimple = !title && !type;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {isSimple ? (
                    // 심플한 레이아웃: 메시지와 확인 버튼만
                    <>
                        <div className="p-6">
                            <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap text-center">
                                {message}
                            </p>
                        </div>
                        <div className="flex justify-center p-6 pt-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-2.5 text-sm font-medium text-white bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                autoFocus
                            >
                                {confirmText}
                            </button>
                        </div>
                    </>
                ) : (
                    // 기존 레이아웃: 아이콘, 제목, 메시지
                    <>
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
                        <div className="flex justify-end p-6 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${getButtonColor()}`}
                                autoFocus
                            >
                                {confirmText}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Alert;
