'use client';

import React, { useState } from 'react';
import { ApiService } from '@/lib/api';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentType: 'Post' | 'Comment';
    contentId: number;
    contentTitle?: string;
}

const REPORT_REASONS = [
    { code: 'Harassment', label: '괴롭힘' },
    { code: 'Violence', label: '폭력적인 위협' },
    { code: 'Hate', label: '혐오' },
    { code: 'MinorAbuse', label: '미성년자 학대 또는 성적 대상화' },
    { code: 'PersonalInfo', label: '개인정보 공유' },
    { code: 'IntimateMedia', label: '합의되지 않은 친밀한 미디어' },
    { code: 'ProhibitedTransaction', label: '금지된 거래 행위' },
    { code: 'Impersonation', label: '사칭' },
    { code: 'ManipulatedContent', label: '조작된 콘텐츠' },
    { code: 'Copyright', label: '저작권 침해' },
    { code: 'Trademark', label: '등록 상표 침해' },
    { code: 'SelfHarm', label: '자해 또는 자살' },
    { code: 'Spam', label: '스팸' },
    { code: 'ContributorViolation', label: '기여자 프로그램 위반' },
    { code: 'Abuse', label: '남용' },
    { code: 'AdultContent', label: '성인용 콘텐츠' },
    { code: 'IllegalContent', label: '불법 콘텐츠' },
    { code: 'Misinformation', label: '잘못된 정보' },
    { code: 'Other', label: '기타' }
];

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    contentType,
    contentId,
    contentTitle
}) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isOpen: alertOpen, alertOptions, showAlert, hideAlert } = useAlert();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) {
            showAlert({
                title: '경고',
                message: '신고 사유를 선택해주세요.',
                type: 'warning'
            });
            return;
        }

        if (selectedReason === 'Other' && !description.trim()) {
            showAlert({
                title: '경고',
                message: '기타 사유를 입력해주세요.',
                type: 'warning'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await ApiService.submitReport(
                contentType,
                contentId,
                selectedReason,
                description.trim() || undefined
            );

            showAlert({
                title: '완료',
                message: result.message || '신고가 접수되었습니다.',
                type: 'success'
            });
            onClose();
            setSelectedReason('');
            setDescription('');
        } catch (error) {
            console.error('Report submission error:', error);
            showAlert({
                title: '오류',
                message: '신고 중 오류가 발생했습니다.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReasonClick = (code: string) => {
        setSelectedReason(code);
    };

    return (
        <>
            <Alert
                isOpen={alertOpen}
                onClose={hideAlert}
                {...alertOptions}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        신고 제출
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        회원님을 비롯한 다른 이용자를 위해 이용 수칙을 위반하는 콘텐츠를 신고해 주셔서 감사합니다. 문제에 대해 알려 주시면 검토를 실시하겠습니다.
                    </p>

                    {contentTitle && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {contentTitle}
                            </p>
                        </div>
                    )}

                    {/* Reason Buttons */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            신고 사유 선택
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.code}
                                    type="button"
                                    onClick={() => handleReasonClick(reason.code)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedReason === reason.code
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            상세 설명 {selectedReason === 'Other' && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={selectedReason !== 'Other' && !selectedReason}
                            placeholder={selectedReason === 'Other' ? '신고 사유를 자세히 입력해주세요.' : '추가 설명이 필요하면 입력해주세요. (선택사항)'}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 ${selectedReason !== 'Other' && !selectedReason
                                    ? 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? '제출 중...' : '제출'}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default ReportModal;
