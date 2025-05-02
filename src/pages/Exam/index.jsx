import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { route } from 'preact-router';
import { validateQuizConfig } from '../../utils/validateConfig';
import { loadQuestionsFromSubject } from '../../utils/loadQuestions';
import { selectRandomQuestions } from '../../utils/selectQuestionsRandom';
import { selectQuestionsInRange } from '../../utils/selectQuestionsInRange';
import { saveAndSendResult } from '../../utils/saveResult';
import { calculateScore } from '../../utils/calculateScore'; 
import { subjects } from '../../config/subjects';

export default function Exam() {
    // State variables
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeSet, setTimeSet] = useState(0);
    const [name, setName] = useState('');
    const [isRandomMode, setIsRandomMode] = useState(true);
    const [rangeStart, setRangeStart] = useState(0);
    const [rangeEnd, setRangeEnd] = useState(0);
    const [subject, setSubject] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);

    // Refs
    const isMounted = useRef(true);
    const timerRef = useRef(null);

    // Load config and questions on component mount
    useEffect(() => {
        isMounted.current = true;

        initExam();

        // Prevent accidental page leave
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Hành động này sẽ huỷ bài làm. Bạn có chắc chắn muốn thoát?';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            isMounted.current = false;
            clearInterval(timerRef.current);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Initialize the exam
    const initExam = async () => {
        try {
            loadConfigFromLocalStorage();

            const { subject, time, questionCount } = validateQuizConfig();
            const allQuestions = await loadQuestionsFromSubject(subject);

            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
            const randomMode = config.randomMode === true;
            const start = config.rangeStart || 0;
            const end = config.rangeEnd || 0;
            const timeSetting = config.time || 0;

            setTimeSet(parseInt(timeSetting));
            setTimeLeft(parseInt(timeSetting) * 60);

            let selectedQuestions = [];
            if (randomMode) {
                selectedQuestions = selectRandomQuestions(allQuestions, questionCount);
            } else {
                selectedQuestions = selectQuestionsInRange(allQuestions, start, end);
            }

            if (!isMounted.current) return;

            setQuestions(selectedQuestions);
            startExamTimer();
            setLoading(false);
        } catch (e) {
            if (isMounted.current) {
                setError(e.message || 'Không thể tải câu hỏi.');
                setLoading(false);
            }
        }
    };

    // Load config from localStorage
    const loadConfigFromLocalStorage = () => {
        try {
            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
            setIsRandomMode(config.randomMode === true);
            setRangeStart(config.rangeStart || 0);
            setRangeEnd(config.rangeEnd || 0);
            setSubject(config.subject || '');

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setName(user.name || '');
        } catch (err) {
            console.error('Lỗi khi đọc localStorage:', err);
        }
    };

    // Start the exam timer
    const startExamTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    // Khi hết thời gian, dừng đồng hồ
                    clearInterval(timerRef.current);
                    // Hiển thị modal bắt buộc nộp bài thay vì tự động nộp
                    setShowTimeUpModal(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    // Handle answer selection
    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers((prev) => {
            const updated = [...prev];
            updated[questionIndex] = answer;
            return updated;
        });
    };

    // Submit the exam
    const submitExam = async (isTimeUp = false) => {
        try {
            // Ensure we have valid data to submit
            if (!questions || questions.length === 0) {
                throw new Error('Không có câu hỏi để nộp bài.');
            }

            // Ensure answers array matches questions length, filling with null for unanswered questions
            const safeAnswers = [...(answers || [])];
            while (safeAnswers.length < questions.length) {
                safeAnswers.push(null);
            }

            // Calculate score before submitting
            const scoreResult = calculateScore(questions, safeAnswers);

            const result = {
                questions,
                answers: safeAnswers,
                totalQuestions: questions.length,
                completedTime: timeSet * 60 - timeLeft,
                totalTime: timeSet * 60,
                subject,
                score: scoreResult.score,
                correctAnswers: scoreResult.correctAnswers,
                wrongAnswers: scoreResult.wrongAnswers,
                unanswered: scoreResult.unanswered,
                details: scoreResult.details
            };
            localStorage.setItem('quiz-result', JSON.stringify(result));

            try {
                // Attempt to send result to server
                await saveAndSendResult(result);
            } catch (sendError) {
                console.error('Error sending result to server:', sendError);
                // If server save fails, we already have local backup, so continue
            }

            // Clean up
            localStorage.removeItem('quiz-config');

            // Đảm bảo đóng các modal trước khi chuyển trang
            setShowConfirmModal(false);
            setShowTimeUpModal(false);

            // Navigate to result page
            route('/result');
        } catch (e) {
            console.error('Error submitting exam:', e);
            setError(e.message || 'Lỗi khi lưu kết quả.');

            // If there was an error but we have a backup, still try to navigate to result
            if (localStorage.getItem('quiz-result')) {
                setTimeout(() => route('/result'), 1000);
            }
        }
    };

    // Handle submit button click
    const handleSubmitClick = () => {
        // Show confirmation dialog if submitting early
        setShowConfirmModal(true);
    };

    // Scroll to specific question
    const scrollToQuestion = (index) => {
        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
    };

    // Render a single question
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

    // Render question navigator buttons
    const renderQuestionNavigator = () => (
        <div class="d-flex flex-wrap gap-2 justify-content-center">
            {questions.map((_, index) => (
                <button
                    key={index}
                    class={`btn btn-sm rounded-3 ${answers[index] ? 'btn-success' : 'btn-outline-secondary'}`}
                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '0.8rem' }}
                    onClick={() => scrollToQuestion(index)}
                >
                    {String(index + 1).padStart(2, '0')}
                </button>
            ))}
        </div>
    );

    // Render status bar with timer and submit button
    const renderStatusBar = () => (
        <div id='status-bar' class="p-3 bg-light border-top fixed-bottom">
            <div class="d-flex flex-wrap justify-content-around align-items-center mb-3 gap-3">
                <p class="fw-bold mb-0">{name}</p>
                <div>
                    Thời gian còn lại:
                    <span class={`fw-bold ms-2 ${timeLeft < 300 ? 'text-danger' : ''}`}>
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <button class="btn btn-warning" onClick={handleSubmitClick}>Nộp bài</button>
            </div>
            {renderQuestionNavigator()}
        </div>
    );

    // Render exam information card
    const renderExamInfo = () => {
        const subjectName = subjects.find((s) => s.value === subject)?.label || 'Không xác định';
        return (
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-3 fw-bold">Thông tin bài thi</h5>
                    <div class="row">
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Thời gian làm bài:</strong> {timeSet} phút
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Số câu hỏi:</strong> {questions.length}
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Chủ đề:</strong> {subjectName || 'Không xác định'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render confirmation modal for early submission
    const renderConfirmModal = () => (
        <div class={`modal fade ${showConfirmModal ? 'show' : ''}`}
            style={{ display: showConfirmModal ? 'block' : 'none' }}
            tabIndex="-1"
            role="dialog">
            <div class="modal-dialog modal-dialog-centered" style={{ zIndex: '1061' }} role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Xác nhận nộp bài</h5>
                        <button type="button" class="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                    </div>
                    <div class="modal-body">
                        <p>Bạn vẫn còn thời gian làm bài ({Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}). Bạn có chắc chắn muốn nộp bài ngay bây giờ?</p>
                        <p>Đã trả lời: {answers.filter(a => a).length}/{questions.length} câu</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Huỷ</button>
                        <button type="button" class="btn btn-warning" onClick={() => {
                            setShowConfirmModal(false);
                            submitExam(false);
                        }}>Nộp bài</button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        </div>
    );

    // Render time-up modal for forced submission
    const renderTimeUpModal = () => (
        <div class={`modal fade ${showTimeUpModal ? 'show' : ''}`}
            style={{ 
                display: showTimeUpModal ? 'block' : 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            tabIndex="-1"
            role="dialog"
            data-backdrop="static"
            data-keyboard="false">
            <div class="modal-dialog modal-dialog-centered" style={{ zIndex: '1061' }} role="document">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Hết thời gian làm bài!</h5>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-clock fa-3x text-danger"></i>
                        </div>
                        <p class="text-center fw-bold">Đã hết thời gian làm bài.</p>
                        <p>Đã trả lời: {answers.filter(a => a).length}/{questions.length} câu</p>
                        <p>Bạn cần nộp bài ngay để xem kết quả.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary w-100" onClick={() => submitExam(true)}>
                            Nộp bài ngay
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        </div>
    );

    // Loading and error states
    if (loading) return <div>Đang tải đề thi...</div>;
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    // Main render
    return (
        <div class="container mt-5 mb-5 pb-5">
            {renderExamInfo()}
            <div class="row">
                <div class="col-12">
                    {questions.map(renderQuestion)}
                </div>
                <div style={{ height: '180px' }} />
                <div class="col-12 fixed-bottom">{renderStatusBar()}</div>
            </div>
            {renderConfirmModal()}
            {renderTimeUpModal()}
        </div>
    );
}