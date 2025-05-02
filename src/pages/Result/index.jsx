import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';

const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

export default function Result() {
    const [data, setData] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('quiz-result');
        if (!stored) {
            route('/config');
            return;
        }
        setData(JSON.parse(stored));
    }, []);

    if (!data) return <div>Đang tải kết quả...</div>;

    const { total, correct, answers, questions } = data;

    if (!questions || !answers) {
        route('/config');
        return;
    }
    const score = round((10 / total) * correct, 2);

    let scoreClass = 'text-success'; // Mặc định màu xanh
    if (score < 5) {
        scoreClass = 'text-danger'; // đỏ
    } else if (score < 8) {
        scoreClass = 'text-warning'; // vàng
    }

    return (
        <div class="container mt-5">
            <h3 class="text-center mb-4 fw-bold">Kết quả bài thi</h3>

            <div class="text-center mb-4">
                <h4>Điểm số: <span class={scoreClass}>{score} / 10</span></h4>
                <p>Đúng: {correct} / {total} câu</p>
            </div>

            {/* Nút chức năng canh giữa */}
            <div class="d-flex justify-content-center gap-3 mt-4 mb-4">
                {!showDetails ? (
                    <button class="btn btn-primary" onClick={() => setShowDetails(true)}>
                        Xem chi tiết
                    </button>
                ) : (
                    <button class="btn btn-primary " onClick={() => setShowDetails(false)}>
                        Ẩn chi tiết
                    </button>
                )}
                <button
                    class="btn btn-success"
                    onClick={() => {
                        localStorage.removeItem('quiz-result');
                        const user = localStorage.getItem('user');
                        if (user) {
                            route(`/config`);
                        } else {
                            route('/');
                        }
                    }}
                >
                    Làm bài mới
                </button>
            </div>

            {/* Hiển thị chi tiết bài làm nếu được bật */}
            {showDetails && (
                <div class="p-3">
                    <h5 class="mb-3">Chi tiết bài làm</h5>
                    {questions.map((q, index) => {
                        const userAnswer = answers[index];
                        const isCorrect = userAnswer === q.ans;

                        return (
                            <div key={index} class={`mb-3 p-3 rounded ${isCorrect ? 'bg-light border border-success' : 'bg-light border border-danger'}`}>
                                <div><strong>{index + 1}. {q.question}</strong></div>
                                <div class="mt-2">
                                    {['a', 'b', 'c', 'd'].map((key) => (
                                        <div
                                            key={key}
                                            class={`p-1 rounded 
                                                ${q.ans === key ? 'bg-success text-white' : ''} 
                                                ${userAnswer === key && q.ans !== key ? 'bg-danger text-white' : ''}`}
                                        >
                                            <strong>{key.toUpperCase()}.</strong> {q[key]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
