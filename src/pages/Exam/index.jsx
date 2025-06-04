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
    const [reviewMarks, setReviewMarks] = useState([]);
    const [subject, setSubject] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);

    const isMounted = useRef(true);
    const timerRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        initExam();

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
            setReviewMarks(new Array(selectedQuestions.length).fill(false));
            if (parseInt(timeSetting) !== 9999) {
                startExamTimer();
            }
            setLoading(false);
        } catch (e) {
            if (isMounted.current) {
                setError(e.message || 'Không thể tải câu hỏi.');
                setLoading(false);
            }
        }
    };

    const toggleReviewMark = (index) => {
        setReviewMarks((prev) => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };

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

    const startExamTimer = () => {
        if (timeSet === 9999) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    setShowTimeUpModal(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers((prev) => {
            const updated = [...prev];
            updated[questionIndex] = answer;
            return updated;
        });
    };

    const submitExam = async (isTimeUp = false) => {
        try {
            if (!questions || questions.length === 0) throw new Error('Không có câu hỏi để nộp bài.');

            const safeAnswers = [...(answers || [])];
            while (safeAnswers.length < questions.length) safeAnswers.push(null);

            const scoreResult = calculateScore(questions, safeAnswers);

            const result = {
                questions,
                answers: safeAnswers,
                totalQuestions: questions.length,
                completedTime: timeSet === 9999 ? null : timeSet * 60 - timeLeft,
                totalTime: timeSet === 9999 ? null : timeSet * 60,
                subject,
                score: scoreResult.score,
                correctAnswers: scoreResult.correctAnswers,
                wrongAnswers: scoreResult.wrongAnswers,
                unanswered: scoreResult.unanswered,
                details: scoreResult.details
            };

            localStorage.setItem('quiz-result', JSON.stringify(result));

            try {
                await saveAndSendResult(result);
            } catch (sendError) {
                console.error('Error sending result to server:', sendError);
            }

            localStorage.removeItem('quiz-config');
            setShowConfirmModal(false);
            setShowTimeUpModal(false);
            route('/result');
        } catch (e) {
            console.error('Error submitting exam:', e);
            setError(e.message || 'Lỗi khi lưu kết quả.');
            if (localStorage.getItem('quiz-result')) {
                setTimeout(() => route('/result'), 1000);
            }
        }
    };

    const handleSubmitClick = () => {
        setShowConfirmModal(true);
    };

    const scrollToQuestion = (index) => {
        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderQuestion = (q, index) => (
        <>
            <div key={index} id={`question-${index}`} className="mb-4 question" >
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
                    <input
                        // style={{ marginTop: '4px' }}
                        type="checkbox"
                        id={`review-${index}`}
                        className="form-check-input"
                        checked={reviewMarks[index] || false}
                        onChange={() => toggleReviewMark(index)}
                    />
                    <h6 style={{ fontWeight: 'bold', textAlign: 'justify', margin: 0 }}>
                        {index + 1}. {q.question}
                    </h6>
                </div>

                {['a', 'b', 'c', 'd'].map((key) => (
                    <div class="form-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} key={key}>
                        <input
                            type="radio"
                            id={`${key}-${index}`}
                            name={`answer-${index}`}
                            class="form-check-input"
                            onChange={() => handleAnswerChange(index, key)}
                            checked={answers[index] === key}
                        />
                        <label htmlFor={`${key}-${index}`} class="form-check-label" style={{ textAlign: 'justify' }}>
                            {q[key]}
                        </label>
                    </div>
                ))}
            </div>
        </>
    );

    const renderQuestionNavigator = () => (
        <div class="d-flex flex-wrap gap-2 justify-content-center">
            {questions.map((_, index) => (
                <button
                    key={index}
                    class={`btn btn-sm rounded-3 ${reviewMarks[index]
                        ? 'btn-warning'
                        : answers[index]
                            ? 'btn-success'
                            : 'btn-outline-secondary'
                        }`}

                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '0.8rem' }}
                    onClick={() => scrollToQuestion(index)}
                >
                    {String(index + 1).padStart(2, '0')}
                </button>
            ))}
        </div>
    );

    const renderStatusBar = () => (
        <div id='status-bar' class="p-3 bg-light border-top fixed-bottom">
            <div class="d-flex flex-wrap justify-content-around align-items-center mb-3 gap-3">
                <p class="fw-bold mb-0">{name}</p>
                <div>
                    Thời gian còn lại:
                    <span class={`fw-bold ms-2 ${timeLeft < 300 && timeSet !== 9999 ? 'text-danger' : ''}`}>
                        {timeSet === 9999
                            ? 'Không giới hạn'
                            : `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                    </span>
                </div>
                <button class="btn btn-warning" onClick={handleSubmitClick}>Nộp bài</button>
            </div>
            {renderQuestionNavigator()}
        </div>
    );

    const renderExamInfo = () => {
        const subjectName = subjects.find((s) => s.value === subject)?.label || 'Không xác định';
        return (
            <div class="card mb-4 question">
                <div class="card-body">
                    <h5 class="card-title mb-3 fw-bold">Thông tin bài thi</h5>
                    <div class="row">
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Thời gian làm bài:</strong> {timeSet === 9999 ? 'Không giới hạn' : `${timeSet} phút`}
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Số câu hỏi:</strong> {questions.length}
                        </div>
                        <div class="col-12 col-md-4 mb-2">
                            <strong>Chủ đề:</strong> {subjectName}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                        <p>
                            {timeSet === 9999
                                ? 'Bạn đang làm bài ở chế độ không giới hạn thời gian.'
                                : `Bạn vẫn còn thời gian làm bài (${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}).`}
                        </p>
                        <p>Đã trả lời: {answers.filter(a => a).length}/{questions.length} câu</p>
                        <p>Đánh dấu xem lại: {reviewMarks.filter(mark => mark).length} câu</p>
                    </div>

                    <div class="modal-footer justify-content-center">
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

    const renderTimeUpModal = () => {
        if (timeSet === 9999) return null;
        return (
            <div class={`modal fade ${showTimeUpModal ? 'show' : ''}`}
                style={{ display: showTimeUpModal ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                tabIndex="-1" role="dialog">
                <div class="modal-dialog modal-dialog-centered" style={{ zIndex: '1061' }} role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Hết thời gian làm bài!</h5>
                        </div>
                        <div class="modal-body">
                            <i class="fas fa-clock fa-3x text-danger mb-3"></i>
                            <p class="fw-bold">Đã hết thời gian làm bài.</p>
                            <p>Đã trả lời: {answers.filter(a => a).length}/{questions.length} câu</p>
                            <p>Bạn cần nộp bài ngay để xem kết quả.</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-danger" onClick={() => submitExam(true)}>
                                Nộp bài ngay
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop fade show"></div>
            </div>
        );
    };

    if (loading) return <div>Đang tải đề thi...</div>;
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

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
