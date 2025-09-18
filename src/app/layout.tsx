import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Shooq – 라이브 이슈 | 커뮤니티 인기글",
        template: "%s | Shooq"
    },
    description: "커뮤니티 인기글 모음 사이트 슉(Shooq) - 실시간 인기 게시물과 최신 이슈를 한눈에 모아보는 커뮤니티 플랫폼. 에펨코리아, 유머대학, 더쿠 등 주요 커뮤니티의 HOT 게시물을 실시간으로 확인하세요.",
    keywords: ["커뮤니티 인기글 모음 사이트", "커뮤니티 인기글", "슉", "shooq", "커뮤니티", "실시간", "인기글", "핫이슈", "에펨코리아", "유머대학", "더쿠", "루리웹", "클리앙", "커뮤니티 모음", "인기글 모음"],
    authors: [{ name: "Shooq Team" }],
    creator: "Shooq",
    publisher: "Shooq, Inc.",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://shooq.live'),
    alternates: {
        canonical: '/',
        languages: {
            'ko-KR': '/ko',
            'en-US': '/en',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        url: '/',
        title: 'Shooq – 라이브 이슈 | 커뮤니티 인기글',
        description: '커뮤니티 인기글 모음 사이트 - 실시간 인기 게시물과 최신 이슈를 한눈에 모아보는 커뮤니티 플랫폼',
        siteName: 'Shooq',
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shooq.live'}/shooq.png`,
                width: 1200,
                height: 630,
                alt: 'Shooq - 실시간 커뮤니티 이슈',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shooq – 라이브 이슈 | 커뮤니티 인기글',
        description: '커뮤니티 인기글 모음 사이트 - 실시간 인기 게시물과 최신 이슈를 한눈에 모아보는 커뮤니티 플랫폼',
        creator: '@shooq_official',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://shooq.live'}/shooq.png`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-site-verification',
        yandex: 'your-yandex-verification',
        yahoo: 'your-yahoo-verification',
    },
    other: {
        'naver-site-verification': 'b99230935daf8e920d39f90634e581626192d9c2',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
