# Alert & Confirm 컴포넌트 사용 가이드

슉라이브 디자인에 맞춘 커스텀 Alert와 Confirm 다이얼로그 컴포넌트입니다. 다크모드를 지원합니다.

## 컴포넌트

### Alert
사용자에게 정보를 알리는 단일 버튼 다이얼로그

### Confirm
사용자의 확인/취소 선택을 받는 양방향 다이얼로그

## 사용 방법

### 1. Alert 사용 예시

```tsx
import { useState } from 'react';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
    const { isOpen, alertOptions, showAlert, hideAlert } = useAlert();

    const handleClick = () => {
        showAlert({
            title: '성공',
            message: '작업이 완료되었습니다.',
            type: 'success',
            confirmText: '확인'
        });
    };

    return (
        <>
            <button onClick={handleClick}>알림 표시</button>

            <Alert
                isOpen={isOpen}
                onClose={hideAlert}
                {...alertOptions}
            />
        </>
    );
}
```

### 2. Confirm 사용 예시

```tsx
import { useState } from 'react';
import Confirm from '@/components/Confirm';
import { useConfirm } from '@/hooks/useConfirm';

function MyComponent() {
    const { isOpen, confirmOptions, showConfirm, hideConfirm } = useConfirm();

    const handleDelete = () => {
        showConfirm({
            title: '삭제 확인',
            message: '정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
            type: 'danger',
            confirmText: '삭제',
            cancelText: '취소',
            onConfirm: () => {
                // 실제 삭제 로직
                console.log('삭제됨');
            }
        });
    };

    return (
        <>
            <button onClick={handleDelete}>삭제</button>

            <Confirm
                isOpen={isOpen}
                onConfirm={confirmOptions.onConfirm}
                onCancel={hideConfirm}
                {...confirmOptions}
            />
        </>
    );
}
```

### 3. 기존 alert/confirm 대체 예시

**기존 코드:**
```tsx
const handleSubmit = () => {
    if (!selectedReason) {
        alert('신고 사유를 선택해주세요.');
        return;
    }

    if (confirm('정말 신고하시겠습니까?')) {
        // 신고 처리
    }
};
```

**변경 후:**
```tsx
import { useAlert } from '@/hooks/useAlert';
import { useConfirm } from '@/hooks/useConfirm';
import Alert from '@/components/Alert';
import Confirm from '@/components/Confirm';

function ReportComponent() {
    const { isOpen: alertOpen, alertOptions, showAlert, hideAlert } = useAlert();
    const { isOpen: confirmOpen, confirmOptions, showConfirm, hideConfirm } = useConfirm();

    const handleSubmit = () => {
        if (!selectedReason) {
            showAlert({
                title: '알림',
                message: '신고 사유를 선택해주세요.',
                type: 'warning'
            });
            return;
        }

        showConfirm({
            title: '신고 확인',
            message: '정말 신고하시겠습니까?',
            type: 'warning',
            confirmText: '신고',
            cancelText: '취소',
            onConfirm: () => {
                // 신고 처리
            }
        });
    };

    return (
        <>
            <button onClick={handleSubmit}>신고하기</button>

            <Alert
                isOpen={alertOpen}
                onClose={hideAlert}
                {...alertOptions}
            />

            <Confirm
                isOpen={confirmOpen}
                onConfirm={confirmOptions.onConfirm}
                onCancel={hideConfirm}
                {...confirmOptions}
            />
        </>
    );
}
```

## Props

### Alert Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | required | 다이얼로그 표시 여부 |
| onClose | () => void | required | 닫기 콜백 |
| title | string | optional | 제목 (선택사항) |
| message | string | required | 메시지 내용 |
| confirmText | string | '확인' | 확인 버튼 텍스트 |
| type | 'info' \| 'success' \| 'warning' \| 'error' | 'info' | 알림 타입 |

### Confirm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | boolean | required | 다이얼로그 표시 여부 |
| onConfirm | () => void | required | 확인 콜백 |
| onCancel | () => void | required | 취소 콜백 |
| title | string | optional | 제목 (선택사항) |
| message | string | required | 메시지 내용 |
| confirmText | string | '확인' | 확인 버튼 텍스트 |
| cancelText | string | '취소' | 취소 버튼 텍스트 |
| type | 'info' \| 'success' \| 'warning' \| 'danger' | 'info' | 확인 타입 |

## Type 별 스타일

- **info**: 파란색 아이콘, 오렌지 버튼 (기본)
- **success**: 초록색 아이콘, 초록색 버튼
- **warning**: 노란색 아이콘, 노란색 버튼
- **error/danger**: 빨간색 아이콘, 빨간색 버튼

## 기능

- 다크모드 자동 지원
- ESC 키로 닫기
- 배경 클릭으로 닫기
- 애니메이션 효과
- 모바일 반응형
- 여러 줄 메시지 지원 (\\n 사용 가능)
- 자동 포커스

## 주의사항

- 한 번에 여러 개의 다이얼로그를 표시하려면 각각 별도의 hook을 사용하세요
- z-index가 50으로 설정되어 있어 대부분의 요소 위에 표시됩니다
- body scroll을 자동으로 잠그므로 배경 스크롤이 방지됩니다
