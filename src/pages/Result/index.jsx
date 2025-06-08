import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import BackToTop from '../../components/BackToTop';
import { Progress } from 'antd';

const round = (value, decimals) =>
    Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

export default function Result() {
    const [data, setData] = useState(null);
    const [showDetails, setShowDetails] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('quiz-result');
        if (!stored) {
            route('/config');
            return;
        }
        setData(JSON.parse(stored));
    }, []);

    if (!data) return <div>Đang tải kết quả...</div>;

    const { total, correct, questions, subject, answers } = data;

    if (!questions || !answers) {
        route('/config');
        return;
    }

    const score = round((10 / total) * correct, 2);

    const handleReportQuestion = (questionText, options) => {
        const newReport = {
            question: questionText,
            options,
            reportedAt: new Date().toISOString()
        };
        localStorage.setItem('feedback', JSON.stringify([newReport]));
        route('/feedback');
    };

    return (
        <div class="container mt-5">
            <h3 class="text-center mb-4 fw-bold">Kết quả bài thi</h3>

            <div class="text-center mb-4">
                <Progress
                    type="circle"
                    percent={Math.round((score / 10) * 100)}
                    format={() => `${score} / 10`}
                    strokeColor={
                        score >= 8 ? '#52c41a' :
                            score >= 5 ? '#faad14' : '#ff4d4f'
                    }
                />
                <p class="mt-3">Đúng: {correct} / {total} câu</p>
            </div>

            <div class="d-flex justify-content-center gap-3 mt-4 mb-4">
                <button
                    class="btn btn-outline-success"
                    onClick={() => setShowDetails(prev => !prev)}
                >
                    {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
                <button
                    class="btn btn-success"
                    onClick={() => {
                        localStorage.removeItem('quiz-result');
                        const user = localStorage.getItem('user');
                        route(user ? '/config' : '/');
                    }}
                >
                    Làm bài mới
                </button>
            </div>

            {showDetails && (
                <div class="p-3">
                    <h5 class="mb-3">Chi tiết bài làm</h5>
                    {questions.map((q, index) => {
                        const userAnswer = answers[index];
                        const isCorrect = userAnswer === q.ans;

                        return (
                            <div
                                key={index}
                                class={`question mb-3 p-3 rounded 
                                    bg-light border 
                                    ${isCorrect ? 'border-success' : 'border-danger'}`}
                            >
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong style={{ display: 'flex', gap: '8px' }}>
                                        {index + 1}. {q.question}
                                    </strong>
                                    <button
                                        class="btn btn-outline-warning btn-sm ms-2"
                                        onClick={() => handleReportQuestion(q.question, {
                                            a: q.a,
                                            b: q.b,
                                            c: q.c,
                                            d: q.d,
                                            correct: q.ans
                                        })}
                                    >
                                        <i class="bi bi-flag-fill"></i>
                                    </button>
                                </div>

                                <div class="mt-2">
                                    {['a', 'b', 'c', 'd'].map((key) => {
                                        const isCorrect = q.ans === key;
                                        const isUserWrong = userAnswer === key && !isCorrect;

                                        const bgColor = isCorrect
                                            ? 'bg-success-subtle border border-success text-success'
                                            : isUserWrong
                                                ? 'bg-danger-subtle border border-danger text-danger'
                                                : 'bg-light';

                                        return (
                                            <div
                                                key={key}
                                                class={`p-2 rounded d-flex gap-2 align-items-start mb-2 ${bgColor}`}
                                            >
                                                <strong>{key.toUpperCase()}.</strong> {q[key]}
                                            </div>
                                        );
                                    })}
                                </div>


                                {q.explain && (
                                    <div class="mt-2 p-2 bg-light border rounded">
                                        <strong>Giải thích:</strong> {q.explain}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <BackToTop />
        </div>
    );
}
