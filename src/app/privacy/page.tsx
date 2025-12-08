'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
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
                        슉라이브 개인정보 처리방침
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        시행일자: 2025년 1월 1일
                    </p>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <p className="text-gray-700 dark:text-gray-300">
                                슉라이브(이하 "회사")는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                            </p>
                        </section>

                        {/* 제1조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제1조 (개인정보의 처리 목적)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 회원 가입 및 관리</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>회원제 서비스 이용에 따른 본인 확인</li>
                                        <li>개인 식별</li>
                                        <li>회원자격 유지·관리</li>
                                        <li>서비스 부정이용 방지</li>
                                        <li>각종 고지·통지</li>
                                        <li>고충처리</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 서비스 제공</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>맞춤형 콘텐츠 제공</li>
                                        <li>콘텐츠 추천 및 필터링</li>
                                        <li>성인 콘텐츠 차단을 위한 연령 확인</li>
                                        <li>서비스 이용 기록 및 통계 분석</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 마케팅 및 광고 활용 (선택)</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>이벤트 및 광고성 정보 제공 (동의한 경우에 한함)</li>
                                        <li>서비스 이용 통계 분석</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제2조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제2조 (처리하는 개인정보의 항목)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 다음의 개인정보 항목을 처리하고 있습니다.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 필수 수집 항목</h3>
                                    <div className="ml-4 space-y-3">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">A. 이메일 회원가입 시</p>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                                <li>이메일 주소</li>
                                                <li>비밀번호 (암호화 저장)</li>
                                                <li>닉네임</li>
                                                <li>가입일시</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">B. 소셜 로그인 회원가입 시 (네이버, 카카오, 구글)</p>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                                <li>소셜 계정 고유 ID</li>
                                                <li>이메일 주소 (제공 시)</li>
                                                <li>닉네임</li>
                                                <li>프로필 이미지 (선택)</li>
                                                <li>생년월일 (네이버, 카카오 제공 시) - 성인 콘텐츠 필터링용</li>
                                                <li>가입일시</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 자동 수집 항목</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>접속 IP 주소</li>
                                        <li>쿠키</li>
                                        <li>서비스 이용 기록</li>
                                        <li>접속 로그</li>
                                        <li>기기 정보 (OS, 브라우저 종류)</li>
                                        <li>방문 일시</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 선택 수집 항목</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>마케팅 수신 동의 여부 (선택)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제3조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제3조 (개인정보의 처리 및 보유 기간)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 회원 정보</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li><span className="font-medium">보유 기간</span>: 회원 탈퇴 시까지</li>
                                        <li><span className="font-medium">탈퇴 후 처리</span>: 즉시 삭제 (단, 아래 법령에 따른 보관 의무 예외)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 관련 법령에 의한 정보 보유</h3>
                                    <div className="ml-4 space-y-2">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">전자상거래 등에서의 소비자보호에 관한 법률</p>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                                                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                                                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">통신비밀보호법</p>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                                <li>웹사이트 방문 기록(로그 기록): 3개월</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">정보통신망 이용촉진 및 정보보호 등에 관한 법률</p>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                                <li>본인확인에 관한 기록: 6개월</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 휴면 계정 처리</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li><span className="font-medium">1년 이상 미접속 계정</span>: 별도 분리 보관</li>
                                        <li><span className="font-medium">분리 보관 30일 전</span>: 이메일 또는 서비스 내 알림</li>
                                        <li><span className="font-medium">5년 경과</span>: 자동 파기</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제4조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제4조 (개인정보의 제3자 제공)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
                            </p>
                            <ol className="list-decimal list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1 mb-3">
                                <li>이용자가 사전에 동의한 경우</li>
                                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                            </ol>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                현재 제3자 제공 현황: 없음
                            </p>
                        </section>

                        {/* 제5조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제5조 (개인정보 처리의 위탁)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">수탁업체</th>
                                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">위탁업무 내용</th>
                                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">보유 및 이용기간</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Vercel Inc.</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">웹사이트 호스팅 및 운영</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">회원 탈퇴 시 또는 위탁계약 종료 시</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Render Services Inc.</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">백엔드 API 서버 호스팅</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">회원 탈퇴 시 또는 위탁계약 종료 시</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Cloudinary Ltd.</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">이미지/비디오 최적화 및 저장</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">회원 탈퇴 시 또는 위탁계약 종료 시</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mt-4">
                                회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                            </p>
                        </section>

                        {/* 제6조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제6조 (개인정보의 파기)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 파기 절차</h3>
                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                        회원의 개인정보는 목적 달성 후 즉시 파기됩니다. 다만, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">보존 이유</p>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>법령 위반 확인 및 수사협조</li>
                                        <li>서비스 부정이용 방지</li>
                                        <li>법령에 따른 보관 의무</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 파기 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li><span className="font-medium">전자적 파일</span>: 복구 불가능한 방법으로 영구 삭제</li>
                                        <li><span className="font-medium">종이 문서</span>: 분쇄기로 분쇄하거나 소각</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제7조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제7조 (정보주체의 권리·의무 및 행사방법)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 행사 가능한 권리</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>개인정보 열람 요구</li>
                                        <li>개인정보 정정 요구</li>
                                        <li>개인정보 삭제 요구</li>
                                        <li>개인정보 처리정지 요구</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 권리 행사 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>서비스 내 "설정 &gt; 계정 관리" 메뉴</li>
                                        <li>이메일: support@shooq.live</li>
                                        <li>서면, 전화, 이메일을 통한 요청</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 권리 행사 대리인</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        법정대리인이나 위임을 받은 자 등 대리인을 통하여 행사하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 제8조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제8조 (개인정보의 안전성 확보 조치)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적·물리적 조치를 하고 있습니다:
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 기술적 조치</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>개인정보 암호화 (비밀번호 bcrypt 해시, 전송 시 SSL/TLS)</li>
                                        <li>해킹 등에 대비한 기술적 대책</li>
                                        <li>보안프로그램 설치 및 주기적 업데이트</li>
                                        <li>개인정보처리시스템 접근 기록의 보관 및 위조·변조 방지</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 관리적 조치</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>개인정보 취급 담당자의 최소화 및 정기 교육</li>
                                        <li>내부관리계획 수립 및 시행</li>
                                        <li>개인정보 접근 권한의 최소화 및 관리</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 물리적 조치</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>전산실, 자료보관실 등의 접근통제</li>
                                        <li>클라우드 인프라의 물리적 보안 (AWS, Vercel, Render 보안 정책 준수)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제9조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 쿠키의 사용 목적</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>회원과 비회원의 접속 빈도나 방문 시간 등을 분석</li>
                                        <li>이용자의 관심분야를 파악하여 맞춤 서비스 제공</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 쿠키 설치·운영 및 거부 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>이용자는 브라우저 옵션을 통해 쿠키 저장을 거부할 수 있습니다</li>
                                        <li>단, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 쿠키 거부 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
                                        <li>Safari: 환경설정 &gt; 개인정보 &gt; 쿠키 차단</li>
                                        <li>Edge: 설정 &gt; 쿠키 및 사이트 권한</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제10조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제10조 (행태정보의 수집·이용·제공 및 거부)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 다음과 같이 온라인 맞춤형 광고 등을 위한 행태정보를 수집·이용·제공하고 있습니다:
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. 수집하는 행태정보 항목</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>이용자의 서비스 방문 이력</li>
                                        <li>콘텐츠 조회 이력</li>
                                        <li>검색 이력</li>
                                        <li>클릭 이력</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. 수집 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>웹사이트 및 앱 방문 시 자동 수집</li>
                                        <li>쿠키를 통한 수집</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. 거부 방법</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>서비스 내 "설정 &gt; 개인정보" 메뉴에서 조정 가능</li>
                                        <li>브라우저 쿠키 설정에서 차단 가능</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제11조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제11조 (만 14세 미만 아동의 개인정보 처리)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                회사는 만 14세 미만 아동의 회원가입을 받지 않으며, 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
                            </p>
                        </section>

                        {/* 제12조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제12조 (개인정보 보호책임자)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">개인정보 보호책임자</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li><span className="font-medium">이름</span>: [담당자명]</li>
                                        <li><span className="font-medium">직책</span>: 대표</li>
                                        <li><span className="font-medium">이메일</span>: <a href="mailto:privacy@shooq.live" className="text-green-600 dark:text-green-500 hover:underline">privacy@shooq.live</a></li>
                                        <li><span className="font-medium">연락처</span>: [연락처]</li>
                                    </ul>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">※ 개인정보 보호 담당부서로 연결됩니다.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">개인정보 보호 담당부서</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li><span className="font-medium">부서명</span>: 개인정보보호팀</li>
                                        <li><span className="font-medium">이메일</span>: <a href="mailto:privacy@shooq.live" className="text-green-600 dark:text-green-500 hover:underline">privacy@shooq.live</a></li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제13조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제13조 (권익침해 구제방법)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
                            </p>
                            <div className="space-y-3">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">개인정보 침해신고센터</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li>전화: (국번없이) 118</li>
                                        <li>웹사이트: <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">https://privacy.kisa.or.kr</a></li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">개인정보 분쟁조정위원회</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li>전화: (국번없이) 1833-6972</li>
                                        <li>웹사이트: <a href="https://www.kopico.go.kr" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">https://www.kopico.go.kr</a></li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">대검찰청 사이버범죄수사단</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li>전화: (국번없이) 1301</li>
                                        <li>웹사이트: <a href="https://www.spo.go.kr" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">https://www.spo.go.kr</a></li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">경찰청 사이버안전국</p>
                                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <li>전화: (국번없이) 182</li>
                                        <li>웹사이트: <a href="https://ecrm.police.go.kr" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">https://ecrm.police.go.kr</a></li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 제14조 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                제14조 (개인정보 처리방침 변경)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                            </p>
                        </section>

                        {/* 문의처 */}
                        <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">시행일자: 2025년 1월 1일</p>
                            <div className="mt-4">
                                <p className="font-semibold text-gray-900 dark:text-white mb-2">문의처</p>
                                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                                    <li>이메일: <a href="mailto:privacy@shooq.live" className="text-green-600 dark:text-green-500 hover:underline">privacy@shooq.live</a></li>
                                    <li>웹사이트: <a href="https://www.shooq.live" className="text-green-600 dark:text-green-500 hover:underline">https://www.shooq.live</a></li>
                                </ul>
                            </div>
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
