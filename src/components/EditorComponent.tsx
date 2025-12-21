'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Embed from '@editorjs/embed';
// @ts-ignore
import LinkTool from '@editorjs/link';
/* eslint-enable @typescript-eslint/ban-ts-comment */

interface EditorComponentProps {
    data?: OutputData;
    onChange?: (data: OutputData) => void;
    placeholder?: string;
}

const EditorComponent: React.FC<EditorComponentProps> = ({
    data,
    onChange,
}) => {
    const editorRef = useRef<EditorJS | null>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;

        const applyDarkModeStyles = () => {
            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#e5e7eb' : '#111827';

            const editorElement = document.getElementById('editorjs');
            if (editorElement) {
                // 에디터 본문 텍스트만 스타일 적용 (팝오버/툴박스 제외)
                const contentElements = editorElement.querySelectorAll(
                    '[contentEditable="true"]:not(.ce-popover *):not(.ce-toolbox *), .ce-paragraph:not(.ce-popover *):not(.ce-toolbox *), .ce-header:not(.ce-popover *):not(.ce-toolbox *), .cdx-block:not(.ce-popover *):not(.ce-toolbox *), .ce-block__content:not(.ce-popover *):not(.ce-toolbox *), div[data-placeholder]:not(.ce-popover *):not(.ce-toolbox *), .cdx-list__item:not(.ce-popover *):not(.ce-toolbox *)'
                );
                contentElements.forEach((el) => {
                    (el as HTMLElement).style.setProperty('color', textColor, 'important');
                });
            }

            // 팝오버와 툴박스는 항상 밝은 테마 유지
            const popoverElements = document.querySelectorAll('.ce-popover, .ce-popover__item, .ce-toolbox, .ce-toolbox__button');
            popoverElements.forEach((el) => {
                (el as HTMLElement).style.setProperty('color', '#374151', 'important');
                if (el.classList.contains('ce-popover') || el.classList.contains('ce-toolbox')) {
                    (el as HTMLElement).style.setProperty('background', '#ffffff', 'important');
                }
            });
        };

        const initEditor = async () => {
            if (editorRef.current) {
                return;
            }

            const editor = new EditorJS({
                holder: 'editorjs',
                data,
                onReady: () => {
                    applyDarkModeStyles();

                    // MutationObserver로 동적으로 추가되는 요소 감지
                    const editorElement = document.getElementById('editorjs');
                    if (editorElement) {
                        const observer = new MutationObserver(() => {
                            applyDarkModeStyles();
                        });

                        observer.observe(editorElement, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            attributeFilter: ['class']
                        });

                        // cleanup 함수에서 observer 정리
                        (editorElement as HTMLElement & { _observer?: MutationObserver })._observer = observer;
                    }
                },
                tools: {
                header: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    class: Header as any,
                    config: {
                        placeholder: '제목을 입력하세요',
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2
                    }
                },
                list: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    class: List as any,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    }
                },
                image: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    class: ImageTool as any,
                    config: {
                        uploader: {
                            /**
                             * 파일 업로드 (Base64로 변환하여 클라이언트에서 처리)
                             */
                            uploadByFile(file: File) {
                                return new Promise((resolve, reject) => {
                                    const reader = new FileReader();

                                    reader.onload = (e) => {
                                        resolve({
                                            success: 1,
                                            file: {
                                                url: e.target?.result as string,
                                            }
                                        });
                                    };

                                    reader.onerror = (error) => {
                                        reject(error);
                                    };

                                    reader.readAsDataURL(file);
                                });
                            },

                            /**
                             * URL로 이미지 추가
                             */
                            uploadByUrl(url: string) {
                                return Promise.resolve({
                                    success: 1,
                                    file: {
                                        url: url,
                                    }
                                });
                            }
                        }
                    }
                },
                embed: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    class: Embed as any,
                    config: {
                        services: {
                            youtube: true,
                            vimeo: true,
                            twitter: true,
                            instagram: true,
                        }
                    }
                },
                linkTool: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    class: LinkTool as any,
                    config: {
                        endpoint: '/api/fetch-url', // 백엔드 URL 메타데이터 엔드포인트
                    }
                }
            },
            onChange: async () => {
                if (onChange && editorRef.current) {
                    const savedData = await editorRef.current.save();
                    onChange(savedData);
                }

                // onChange 시에도 텍스트 색상 강제 적용
                applyDarkModeStyles();
            },
            minHeight: 300,
            });

            editorRef.current = editor;
            isInitialized.current = true;
        };

        initEditor();

        return () => {
            // MutationObserver 정리
            const editorElement = document.getElementById('editorjs');
            const elementWithObserver = editorElement as HTMLElement & { _observer?: MutationObserver };
            if (elementWithObserver && elementWithObserver._observer) {
                elementWithObserver._observer.disconnect();
            }

            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
            isInitialized.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="editor-wrapper">
            <div
                id="editorjs"
                className="min-h-[300px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
        </div>
    );
};

export default EditorComponent;
