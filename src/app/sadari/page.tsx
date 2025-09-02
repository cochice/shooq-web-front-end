"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Plus, X, Users, Gift } from 'lucide-react';

const LadderGame = () => {
    const [participants, setParticipants] = useState(['름', '온', '다']);
    const [results, setResults] = useState(['1등', '2등', '3등']);
    const [newParticipant, setNewParticipant] = useState('');
    const [newResult, setNewResult] = useState('');
    const [ladder, setLadder] = useState<boolean[][]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentPath, setCurrentPath] = useState<Array<{ row: number, col: number, isHorizontal?: boolean }>>([]);
    const [selectedParticipant] = useState<number | null>(null);
    const [finalResult, setFinalResult] = useState<string | null>(null);
    const [gameResults, setGameResults] = useState<Record<string, string>>({});

    const ladderHeight = 12; // 사다리 높이 (가로선 개수)

    // 사다리 생성
    const generateLadder = useCallback(() => {
        const newLadder: boolean[][] = [];
        const participantCount = participants.length;

        for (let row = 0; row < ladderHeight; row++) {
            const currentRow: boolean[] = [];
            let hasConnection = false;

            for (let col = 0; col < participantCount - 1; col++) {
                // 이전 연결과 겹치지 않도록 체크
                const prevConnection: boolean = col > 0 ? currentRow[col - 1] : false;
                const shouldConnect = !prevConnection && Math.random() > 0.6;
                currentRow.push(shouldConnect);
                if (shouldConnect) hasConnection = true;
            }

            // 각 행마다 최소 하나의 연결은 보장
            if (!hasConnection && participantCount > 1) {
                const randomCol = Math.floor(Math.random() * (participantCount - 1));
                currentRow[randomCol] = true;
            }

            newLadder.push(currentRow);
        }

        setLadder(newLadder);
        setGameResults({});
        setFinalResult(null);
        setCurrentPath([]);
    }, [participants.length]);

    // 컴포넌트 마운트 시 사다리 생성
    useEffect(() => {
        generateLadder();
    }, [generateLadder]);

    // 경로 따라가기
    const followPath = async (startIndex: number) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setCurrentPath([]);
        setFinalResult(null);

        let currentColumn = startIndex;
        const path: Array<{ row: number, col: number, isHorizontal?: boolean }> = [{ row: -1, col: currentColumn }];

        // 사다리를 따라 내려가기
        for (let row = 0; row < ladderHeight; row++) {
            // 현재 위치에서 왼쪽 연결 체크
            if (currentColumn > 0 && ladder[row][currentColumn - 1]) {
                currentColumn = currentColumn - 1;
                path.push({ row, col: currentColumn + 0.5, isHorizontal: true });
                path.push({ row, col: currentColumn });
            }
            // 현재 위치에서 오른쪽 연결 체크
            else if (currentColumn < participants.length - 1 && ladder[row][currentColumn]) {
                path.push({ row, col: currentColumn + 0.5, isHorizontal: true });
                currentColumn = currentColumn + 1;
                path.push({ row, col: currentColumn });
            } else {
                path.push({ row, col: currentColumn });
            }
        }

        path.push({ row: ladderHeight, col: currentColumn });

        // 애니메이션으로 경로 표시
        for (let i = 0; i < path.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setCurrentPath(prev => [...prev, path[i]]);
        }

        // 결과 표시
        setTimeout(() => {
            const result = results[currentColumn];
            setFinalResult(result);
            setGameResults(prev => ({
                ...prev,
                [participants[startIndex]]: result
            }));
            setIsAnimating(false);
        }, 300);
    };

    // 참가자 추가
    const addParticipant = () => {
        if (newParticipant.trim() && participants.length < 8) {
            setParticipants([...participants, newParticipant.trim()]);
            setResults([...results, `결과${results.length + 1}`]);
            setNewParticipant('');
        }
    };

    // 참가자 삭제
    const removeParticipant = (index: number) => {
        if (participants.length > 2) {
            setParticipants(participants.filter((_, i) => i !== index));
            setResults(results.filter((_, i) => i !== index));
        }
    };

    // 결과 수정
    const updateResult = (index: number, value: string) => {
        const newResults = [...results];
        newResults[index] = value;
        setResults(newResults);
    };

    // 결과 추가
    const addResult = () => {
        if (newResult.trim() && results.length < 8) {
            setResults([...results, newResult.trim()]);
            setParticipants([...participants, `참가자${participants.length + 1}`]);
            setNewResult('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🪜 사다리타기</h1>
                    <p className="text-gray-600">참가자와 결과를 설정하고 사다리를 타보세요!</p>
                </div>

                {/* 컨트롤 패널 */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* 참가자 설정 */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="flex items-center font-semibold text-blue-800 mb-3">
                            <Users className="w-5 h-5 mr-2" />
                            참가자 설정
                        </h3>
                        <div className="space-y-2 mb-3">
                            {participants.map((participant, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={participant}
                                        onChange={(e) => {
                                            const newParticipants = [...participants];
                                            newParticipants[index] = e.target.value;
                                            setParticipants(newParticipants);
                                        }}
                                        className="flex-1 px-4 py-3 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {participants.length > 2 && (
                                        <button
                                            onClick={() => removeParticipant(index)}
                                            className="text-red-500 hover:bg-red-100 p-1 rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="새 참가자"
                                value={newParticipant}
                                onChange={(e) => setNewParticipant(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                                className="flex-1 px-4 py-3 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                            />
                            <button
                                onClick={addParticipant}
                                disabled={participants.length >= 8}
                                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 결과 설정 */}
                    <div className="bg-green-50 rounded-xl p-4">
                        <h3 className="flex items-center font-semibold text-green-800 mb-3">
                            <Gift className="w-5 h-5 mr-2" />
                            결과 설정
                        </h3>
                        <div className="space-y-2 mb-3">
                            {results.map((result, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={result}
                                    onChange={(e) => updateResult(index, e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="새 결과"
                                value={newResult}
                                onChange={(e) => setNewResult(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addResult()}
                                className="flex-1 px-4 py-3 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                            />
                            <button
                                onClick={addResult}
                                disabled={results.length >= 8}
                                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 게임 컨트롤 */}
                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={generateLadder}
                        disabled={isAnimating}
                        className="flex items-center bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        사다리 새로 만들기
                    </button>
                </div>

                {/* 사다리 게임 */}
                <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto">
                    <div className="flex justify-center">
                        <div className="relative" style={{ minWidth: `${participants.length * 100}px` }}>
                            {/* 참가자 이름 */}
                            <div className="flex justify-between mb-4">
                                {participants.map((participant, index) => (
                                    <button
                                        key={index}
                                        onClick={() => followPath(index)}
                                        disabled={isAnimating}
                                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${selectedParticipant === index
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-white text-blue-700 border-2 border-blue-500 hover:bg-blue-50 shadow-md'
                                            } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                                    >
                                        {participant}
                                    </button>
                                ))}
                            </div>

                            {/* 사다리 */}
                            <div className="relative mb-4">
                                <svg
                                    width={participants.length * 100}
                                    height={ladderHeight * 40 + 40}
                                    className="border rounded-lg bg-white"
                                >
                                    {/* 세로선 */}
                                    {participants.map((_, index) => (
                                        <line
                                            key={`vertical-${index}`}
                                            x1={index * 100 + 50}
                                            y1="20"
                                            x2={index * 100 + 50}
                                            y2={ladderHeight * 40 + 20}
                                            stroke="#6b7280"
                                            strokeWidth="3"
                                        />
                                    ))}

                                    {/* 가로선 */}
                                    {ladder.map((row, rowIndex) =>
                                        row.map((hasConnection, colIndex) =>
                                            hasConnection ? (
                                                <line
                                                    key={`horizontal-${rowIndex}-${colIndex}`}
                                                    x1={colIndex * 100 + 50}
                                                    y1={rowIndex * 40 + 40}
                                                    x2={(colIndex + 1) * 100 + 50}
                                                    y2={rowIndex * 40 + 40}
                                                    stroke="#6b7280"
                                                    strokeWidth="3"
                                                />
                                            ) : null
                                        )
                                    )}

                                    {/* 애니메이션 경로 */}
                                    {currentPath.map((point, index) => (
                                        <circle
                                            key={`path-${index}`}
                                            cx={point.col * 100 + 50}
                                            cy={(point.row + 1) * 40 + 20}
                                            r="8"
                                            fill="#ef4444"
                                            className="animate-pulse"
                                        />
                                    ))}
                                </svg>
                            </div>

                            {/* 결과 */}
                            <div className="flex justify-between">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`px-6 py-3 rounded-lg font-bold text-lg ${finalResult === result
                                            ? 'bg-green-500 text-white animate-bounce shadow-lg'
                                            : 'bg-gray-100 text-gray-800 border-2 border-gray-300 shadow-md'
                                            }`}
                                    >
                                        {result}
                                    </div>
                                ))}
                            </div>

                            {/* 결과 알림 */}
                            {finalResult && (
                                <div className="mt-6 text-center">
                                    <div className="inline-block bg-green-100 border-2 border-green-400 text-green-700 px-8 py-4 rounded-xl shadow-lg">
                                        <strong className="text-2xl">결과: {finalResult}!</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 게임 히스토리 */}
                {Object.keys(gameResults).length > 0 && (
                    <div className="mt-8 bg-yellow-50 rounded-xl p-6">
                        <h3 className="font-semibold text-yellow-800 mb-4">🏆 게임 결과</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(gameResults).map(([participant, result]) => (
                                <div key={participant} className="bg-white rounded-lg p-4 text-center border shadow-sm">
                                    <div className="font-bold text-lg text-gray-800">{participant}</div>
                                    <div className="text-lg text-gray-500 my-1">→</div>
                                    <div className="font-bold text-lg text-yellow-600">{result}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 사용법 */}
                <div className="mt-8 bg-gray-100 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">📖 사용법</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>참가자와 결과를 원하는 대로 설정하세요</li>
                        <li>&quot;사다리 새로 만들기&quot; 버튼으로 새로운 사다리를 생성하세요</li>
                        <li>참가자 이름을 클릭하면 사다리를 따라 결과까지 이동합니다</li>
                        <li>빨간 점을 따라 경로를 확인하고 최종 결과를 확인하세요</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default LadderGame;