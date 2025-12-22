'use client';

import { useState } from 'react';
import Alert from '@/components/Alert';
import Confirm from '@/components/Confirm';
import { useAlert } from '@/hooks/useAlert';
import { useConfirm } from '@/hooks/useConfirm';

export default function TestDialogPage() {
    const { isOpen: alertOpen, alertOptions, showAlert, hideAlert } = useAlert();
    const { isOpen: confirmOpen, confirmOptions, showConfirm, hideConfirm } = useConfirm();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Dialog 테스트 페이지
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Alert 테스트
                    </h2>

                    <button
                        onClick={() => showAlert({
                            message: '심플한 알림 메시지입니다.'
                        })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Simple Alert (제목/타입 없음)
                    </button>

                    <button
                        onClick={() => showAlert({
                            title: '정보',
                            message: '이것은 정보 알림입니다.',
                            type: 'info'
                        })}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Info Alert
                    </button>

                    <button
                        onClick={() => showAlert({
                            title: '성공',
                            message: '작업이 성공적으로 완료되었습니다!',
                            type: 'success'
                        })}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Success Alert
                    </button>

                    <button
                        onClick={() => showAlert({
                            title: '경고',
                            message: '주의가 필요합니다.',
                            type: 'warning'
                        })}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Warning Alert
                    </button>

                    <button
                        onClick={() => showAlert({
                            title: '오류',
                            message: '오류가 발생했습니다.',
                            type: 'error'
                        })}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Error Alert
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Confirm 테스트
                    </h2>

                    <button
                        onClick={() => showConfirm({
                            message: '계속 진행하시겠습니까?',
                            onConfirm: () => {
                                showAlert({
                                    message: '확인했습니다.'
                                });
                            }
                        })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Simple Confirm (제목/타입 없음)
                    </button>

                    <button
                        onClick={() => showConfirm({
                            title: '확인',
                            message: '계속 진행하시겠습니까?',
                            type: 'info',
                            onConfirm: () => {
                                showAlert({
                                    title: '완료',
                                    message: '확인 버튼을 클릭했습니다.',
                                    type: 'success'
                                });
                            }
                        })}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Info Confirm
                    </button>

                    <button
                        onClick={() => showConfirm({
                            title: '삭제 확인',
                            message: '정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
                            type: 'danger',
                            confirmText: '삭제',
                            onConfirm: () => {
                                showAlert({
                                    title: '삭제됨',
                                    message: '항목이 삭제되었습니다.',
                                    type: 'success'
                                });
                            }
                        })}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Danger Confirm
                    </button>
                </div>

                <Alert
                    isOpen={alertOpen}
                    onClose={hideAlert}
                    {...alertOptions}
                />

                <Confirm
                    isOpen={confirmOpen}
                    onCancel={hideConfirm}
                    {...confirmOptions}
                />
            </div>
        </div>
    );
}
