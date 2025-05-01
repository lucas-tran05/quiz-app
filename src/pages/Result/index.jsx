import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';

// Helper function to round the score
const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

export default function Result() {
    const [data, setData] = useState(null);

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

    // Check if questions or answers are undefined
    if (!questions || !answers) {
        route('/config');
        return;
    }

    return (
        <div class="container mt-5">
            <h3 class="text-center mb-4">Kết quả bài thi</h3>

            <div class="text-center mb-4">
                <h4>Điểm số: <span class="text-success">{round(10 / total * correct, 2)} / 10</span></h4>
                <p>Đúng: {correct} / {total} câu</p>
            </div>

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

            <div class="text-center mt-4 mb-4">
                <button
                    class="btn btn-primary"
                    onClick={() => {
                        localStorage.removeItem('quiz-result');
                        localStorage.removeItem('quiz-config');
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

        </div>
    );
}
