import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { validateQuizConfig } from '../../utils/validateConfig';
import { loadQuestionsFromSubject } from '../../utils/loadQuestions';
import { startTimer } from '../../utils/quizTimer';
import { saveAndSendResult } from '../../utils/saveResult';

export default function Exam() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [name, setName] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const { name } = JSON.parse(storedUser);
                setName(name || '');
            } catch (err) {
                console.error('Lỗi khi đọc localStorage:', err);
            }
        }
        let timer;
        try {
            const { subject, time, questionCount } = validateQuizConfig();

            loadQuestionsFromSubject(subject, questionCount)
                .then((qs) => {
                    setQuestions(qs);
                    setTimeLeft(parseInt(time) * 60);
                    setLoading(false);
                    timer = startTimer(setTimeLeft, handleSubmit);
                })
                .catch(() => {
                    setError('Không thể tải câu hỏi từ file.');
                    setLoading(false);
                });
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Hành động này sẽ huỷ bài làm. Bạn có chắc chắn muốn thoát?';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(timer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers((prev) => {
            const updated = [...prev];
            updated[questionIndex] = answer;
            return updated;
        });
    };

    const handleSubmit = () => {
        try {
            saveAndSendResult({ questions, answers });
            localStorage.removeItem('quiz-config');
            route('/result');
        } catch (e) {
            setError(e.message);
        }
    };

    if (loading) return <div>Đang tải đề thi...</div>;
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    return (
        <div class="container mt-5">
            <div class="row">
                {/* Cột câu hỏi */}
                <div class="col-12">
                    {questions.map((q, index) => (
                        <div key={index} id={`question-${index}`} class="mb-4">
                            {/* Hiển thị số thứ tự câu hỏi */}
                            <h6 style={{ fontWeight: 'bold' }}>
                                {index + 1}. {q.question}
                            </h6>

                            {/* Hiển thị các lựa chọn đáp án */}
                            {['a', 'b', 'c', 'd'].map((key) => (
                                <div class="form-check" key={key}>
                                    <input
                                        type="radio"
                                        id={`${key}-${index}`}
                                        name={`answer-${index}`}
                                        class="form-check-input"
                                        onChange={() => handleAnswerChange(index, key)}
                                        checked={answers[index] === key}
                                    />
                                    <label htmlFor={`${key}-${index}`} class="form-check-label">
                                        {q[key]}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}

                </div>
                <div style={{ height: '180px' }} />

                {/* Cột trạng thái */}
                <div class="col-12">
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '0px',
                            right: '0px',
                            zIndex: 10,
                            background: 'white',
                            padding: '16px',
                            borderRadius: '8px',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                            width: '100%',
                            maxHeight: '180px',
                            overflowY: 'auto',
                        }}
                    >

                        <div
                            class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3"
                        >
                            <p class="fw-bold mb-0">{name}</p>
                            {/* Thời gian */}
                            <div>
                                Thời gian còn lại:
                                <span class="text-danger fw-bold ms-2">
                                    {`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                                </span>
                            </div>
                            {/* Nút nộp bài */}
                            <div>
                                <button class="btn btn-success" onClick={handleSubmit}>
                                    Nộp bài
                                </button>
                            </div>
                        </div>

                        {/* Danh sách câu hỏi */}
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px', 
                                justifyContent: 'center',
                            }}
                        >
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    class={`btn btn-sm rounded-3 ${answers[index] ? 'btn-success' : 'btn-outline-secondary'}`}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        padding: 0,
                                        fontSize: '0.8rem'
                                    }}
                                    onClick={() => {
                                        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
