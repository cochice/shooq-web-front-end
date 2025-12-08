'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 헤더 */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                                슉라이브
                            </div>
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            홈으로
                        </Link>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        슉라이브 이용약관
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        시행일자: 2025년 1월 1일
                    </p>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        {/* 제1조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제1조 (목적)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                이 약관은 슉라이브(이하 "회사")가 제공하는 커뮤니티 콘텐츠 큐레이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                            </p>
                        </section>

                        {/* 제2조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제2조 (정의)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>"서비스"란 회사가 제공하는 커뮤니티 콘텐츠 수집, 큐레이션, 표시 및 관련 부가 서비스를 말합니다.</li>
                                <li>"이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                                <li>"회원"란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.</li>
                                <li>"콘텐츠"란 서비스 내에서 표시되는 각종 커뮤니티 게시물, 댓글, 이미지, 영상 등을 말합니다.</li>
                            </ol>
                        </section>

                        {/* 제3조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제3조 (약관의 게시와 개정)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기화면에 게시합니다.</li>
                                <li>회사는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                                <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 공지합니다. 다만, 이용자에게 불리한 약관 개정의 경우에는 30일 전부터 공지하고 이메일 등으로 통지합니다.</li>
                            </ol>
                        </section>

                        {/* 제4조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제4조 (서비스의 제공 및 변경)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 다음과 같은 서비스를 제공합니다:
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>국내 주요 커뮤니티 사이트의 인기 게시물 수집 및 표시</li>
                                        <li>콘텐츠 정렬, 필터링 및 검색 기능</li>
                                        <li>사용자 맞춤형 콘텐츠 추천</li>
                                        <li>기타 회사가 정하는 서비스</li>
                                    </ul>
                                </li>
                                <li>회사는 서비스의 내용을 변경할 수 있으며, 변경사항은 서비스 화면에 공지합니다.</li>
                                <li>서비스는 연중무휴 1일 24시간 제공을 원칙으로 합니다. 다만, 시스템 점검, 서버 증설 등의 사유로 서비스가 일시 중단될 수 있습니다.</li>
                            </ol>
                        </section>

                        {/* 제5조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제5조 (회원가입)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의함으로써 회원가입을 신청합니다.</li>
                                <li>회사는 다음 각 호의 경우 회원가입을 거부하거나 사후에 회원자격을 상실시킬 수 있습니다:
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>만 14세 미만인 경우</li>
                                        <li>타인의 명의를 도용한 경우</li>
                                        <li>허위 정보를 기재한 경우</li>
                                        <li>이전에 회원자격을 상실한 적이 있는 경우</li>
                                        <li>기타 회사가 정한 가입요건에 부합하지 않는 경우</li>
                                    </ul>
                                </li>
                                <li>회원가입은 다음의 방법으로 가능합니다:
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>이메일 주소를 이용한 가입</li>
                                        <li>소셜 로그인(네이버, 카카오, 구글) 연동</li>
                                    </ul>
                                </li>
                            </ol>
                        </section>

                        {/* 제6조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제6조 (회원 탈퇴 및 자격 상실)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회원은 언제든지 회사에 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.</li>
                                <li>탈퇴한 회원의 개인정보는 관련 법령에 따라 보관기간 이후 파기됩니다.</li>
                                <li>회사는 다음 각 호의 경우 회원자격을 제한 또는 정지시킬 수 있습니다:
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>가입 신청 시 허위 내용을 등록한 경우</li>
                                        <li>다른 회원의 서비스 이용을 방해하거나 정보를 도용하는 등 질서를 위협하는 경우</li>
                                        <li>법령 또는 본 약관이 금지하는 행위를 한 경우</li>
                                        <li>서비스의 정상적인 운영을 방해한 경우</li>
                                    </ul>
                                </li>
                            </ol>
                        </section>

                        {/* 제7조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제7조 (성인 콘텐츠 필터링)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 이용자의 연령에 따라 성인 콘텐츠 표시 여부를 제한합니다.</li>
                                <li>만 19세 미만의 이용자에게는 성인 콘텐츠가 자동으로 필터링됩니다.</li>
                                <li>연령 확인은 소셜 로그인을 통해 제공받은 생년월일 정보를 기준으로 합니다.</li>
                                <li>회원은 설정 메뉴에서 성인 콘텐츠 필터링 옵션을 조정할 수 있습니다.</li>
                            </ol>
                        </section>

                        {/* 제8조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제8조 (저작권 및 콘텐츠 이용)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>서비스에 표시되는 콘텐츠의 저작권은 원 저작자에게 있습니다.</li>
                                <li>회사는 공개된 커뮤니티 게시물의 링크와 요약 정보를 제공하며, 이는 정당한 공정 이용(Fair Use)에 해당합니다.</li>
                                <li>이용자는 서비스에 표시된 콘텐츠를 무단으로 복제, 배포, 전송, 방송할 수 없습니다.</li>
                                <li>저작권 침해 신고는 support@shooq.live로 접수할 수 있으며, 회사는 즉시 해당 콘텐츠를 검토 및 조치합니다.</li>
                            </ol>
                        </section>

                        {/* 제9조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제9조 (금지 행위)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>허위 정보를 입력하거나 타인의 정보를 도용하는 행위</li>
                                <li>서비스의 정보를 무단으로 수집, 저장, 가공, 재배포하는 행위</li>
                                <li>자동화된 수단(봇, 크롤러 등)을 이용하여 서비스에 접근하는 행위</li>
                                <li>서비스의 운영을 방해하거나 안정성을 해치는 행위</li>
                                <li>음란물, 도박, 불법 의약품 등 법령으로 금지된 내용을 유포하는 행위</li>
                                <li>다른 이용자를 희롱하거나 명예를 훼손하는 행위</li>
                                <li>기타 관계 법령이나 회사의 운영정책에 위배되는 행위</li>
                            </ol>
                        </section>

                        {/* 제10조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제10조 (서비스 이용 제한)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</li>
                                <li>회사는 제1항의 이용제한 시 그 사유와 기간 등을 회원에게 통지합니다.</li>
                            </ol>
                        </section>

                        {/* 제11조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제11조 (책임의 제한)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
                                <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                                <li>회사는 서비스에 표시된 콘텐츠의 정확성, 신뢰성에 대해서는 보증하지 않습니다.</li>
                                <li>회사는 무료로 제공하는 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
                            </ol>
                        </section>

                        {/* 제12조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제12조 (개인정보 보호)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 이용에 대해서는 별도의 "개인정보 처리방침"이 적용됩니다.
                            </p>
                        </section>

                        {/* 제13조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제13조 (광고 게재)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사는 서비스 운영과 관련하여 서비스 화면에 광고를 게재할 수 있습니다.</li>
                                <li>이용자는 광고가 게재된 이메일 수신을 거부할 수 있습니다.</li>
                            </ol>
                        </section>

                        {/* 제14조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제14조 (분쟁 해결)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사와 이용자는 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 하여야 합니다.</li>
                                <li>제1항의 노력에도 불구하고 분쟁이 해결되지 않을 경우, 양 당사자는 민사소송법상의 관할법원에 소를 제기할 수 있습니다.</li>
                            </ol>
                        </section>

                        {/* 제15조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제15조 (준거법 및 재판관할)
                            </h2>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>회사와 이용자 간 제기된 소송은 대한민국 법을 준거법으로 합니다.</li>
                                <li>회사와 이용자 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
                            </ol>
                        </section>

                        {/* 부칙 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                부칙
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                이 약관은 2025년 1월 1일부터 적용됩니다.
                            </p>
                        </section>

                        {/* 문의처 */}
                        <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                문의처
                            </h2>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li>이메일: <a href="mailto:support@shooq.live" className="text-green-600 dark:text-green-500 hover:underline">support@shooq.live</a></li>
                                <li>웹사이트: <a href="https://www.shooq.live" className="text-green-600 dark:text-green-500 hover:underline">https://www.shooq.live</a></li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        © 2024 슉라이브. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
