import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { route } from 'preact-router';
import { validateQuizConfig } from '../../utils/validateConfig';
import { loadQuestionsFromSubject } from '../../utils/loadQuestions';
import { selectRandomQuestions } from '../../utils/selectQuestionsRandom';
import { selectQuestionsInRange } from '../../utils/selectQuestionsInRange';
import { startTimer } from '../../utils/quizTimer';
import { saveAndSendResult } from '../../utils/saveResult';

export default function Exam() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [name, setName] = useState('');
    const [isRandomMode, setIsRandomMode] = useState(true);
    const [rangeStart, setRangeStart] = useState(0);
    const [rangeEnd, setRangeEnd] = useState(0);

    const isMounted = useRef(true);
    const timerRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        
        const init = async () => {
            try {
                // Load configuration from localStorage
                const loadLocalStorage = () => {
                    try {
                        const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
                        // Explicitly set to boolean value to avoid type issues
                        setIsRandomMode(config.randomMode === true);
                        setRangeStart(config.rangeStart || 0);
                        setRangeEnd(config.rangeEnd || 0);
        
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        setName(user.name || '');
                    } catch (err) {
                        console.error('Lỗi khi đọc localStorage:', err);
                    }
                };
                
                loadLocalStorage();
                const { subject, time, questionCount } = validateQuizConfig();

                const allQuestions = await loadQuestionsFromSubject(subject);
                
                const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
                const randomMode = config.randomMode === true;
                const start = config.rangeStart || 0;
                const end = config.rangeEnd || 0;
                
                let selectedQuestions = [];
                if (randomMode) {
                    selectedQuestions = selectRandomQuestions(allQuestions, questionCount);
                } else {
                    selectedQuestions = selectQuestionsInRange(allQuestions, start, end);
                }

                if (!isMounted.current) return;

                setQuestions(selectedQuestions);
                setTimeLeft(parseInt(time) * 60);
                timerRef.current = startTimer(setTimeLeft, handleSubmit);
                setLoading(false);
            } catch (e) {
                if (isMounted.current) {
                    setError(e.message || 'Không thể tải câu hỏi.');
                    setLoading(false);
                }
            }
        };

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Hành động này sẽ huỷ bài làm. Bạn có chắc chắn muốn thoát?';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        init();

        return () => {
            isMounted.current = false;
            clearInterval(timerRef.current);
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

    const handleSubmit = async () => {
        try {
            await saveAndSendResult({ questions, answers });
            localStorage.removeItem('quiz-config');
            route('/result');
        } catch (e) {
            setError(e.message || 'Lỗi khi lưu kết quả.');
        }
    };

    const renderQuestion = (q, index) => (
        <div key={index} id={`question-${index}`} class="mb-4">
            <h6 style={{ fontWeight: 'bold' }}>
                {index + 1}. {q.question}
            </h6>
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
    );

    const renderQuestionNavigator = () => (
        <div class="d-flex flex-wrap gap-2 justify-content-center">
            {questions.map((_, index) => (
                <button
                    key={index}
                    class={`btn btn-sm rounded-3 ${answers[index] ? 'btn-success' : 'btn-outline-secondary'}`}
                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '0.8rem' }}
                    onClick={() => {
                        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    {String(index + 1).padStart(2, '0')}
                </button>
            ))}
        </div>
    );

    const renderStatusBar = () => (
        <div id='status-bar'>
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
                <p class="fw-bold mb-0">{name}</p>
                <div>
                    Thời gian còn lại:
                    <span class="text-danger fw-bold ms-2">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <button class="btn btn-success" onClick={handleSubmit}>Nộp bài</button>
            </div>
            {renderQuestionNavigator()}
        </div>
    );

    if (loading) return <div>Đang tải đề thi...</div>;
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    return (
        <div class="container mt-5">
            <div class="row">
                <div class="col-12">
                    {questions.map(renderQuestion)}
                </div>
                <div style={{ height: '180px' }} />
                <div class="col-12">{renderStatusBar()}</div>
            </div>
        </div>
    );
}