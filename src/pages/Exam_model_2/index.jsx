import { h } from 'preact';
import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import QuestionCard from '../../components/exam/QuestionCard';
import ExamInfo from '../../components/exam/ExamInfo';
import ConfirmSubmitModal from '../../components/exam/ConfirmSubmitModal';
import TimeUpModal from '../../components/exam/TimeUpModal';
import { validateQuizConfig } from '../../utils/validateConfig';
import { handleSubmitExam } from '../../utils/handleSubmitExam';
import fetchQuestions from '../../utils/fetchQuestions';
import { Spin, Progress, Flex, Tag } from 'antd';

export default function SingleQuestionExamWithNavigator() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [reviewMarks, setReviewMarks] = useState([]);
    const [lockedAnswers, setLockedAnswers] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeSet, setTimeSet] = useState(0);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);


    const timerRef = useRef(null);
    const isMounted = useRef(true);

    const startExamTimer = useCallback((minutes) => {
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        if (minutes === 9999) {
            return;
        }
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (isMounted.current) {
                        setShowTimeUpModal(true);
                        setTimeLeft(0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handleBeforeUnload = useCallback((e) => {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi? Bài làm sẽ bị hủy!';
        localStorage.removeItem('quiz-config');
    }, []);

    const handleAnswerChange = useCallback((index, answer) => {
        setAnswers(prev => {
            const updated = [...prev];
            updated[index] = answer;
            return updated;
        });
        const correct = questions[index]?.correctAnswer || questions[index]?.ans;
        setIsCorrect(answer === correct);
        setLockedAnswers(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
        });
    }, [questions]);

    const toggleReviewMark = useCallback((index) => {
        setReviewMarks(prev => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    }, []);

    const submitExam = useCallback(async (isTimeUp = false) => {
        if (!questions.length || !answers.length) {
            setError('Dữ liệu bài thi chưa sẵn sàng.');
            return;
        }
        try {
            await handleSubmitExam({
                questions,
                answers,
                timeSet,
                timeLeft,
                subject,
                setError,
                setShowConfirmModal,
                setShowTimeUpModal,
            });
        } catch (e) {
            setError(e.message || 'Không thể nộp bài.');
        }
    }, [questions, answers, timeSet, timeLeft, subject]);

    const handleNextQuestion = useCallback(() => {
        setIsCorrect(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowConfirmModal(true);
        }
    }, [currentQuestionIndex, questions.length]);

    const initExam = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
            const user = JSON.parse(localStorage.getItem('user')).value || {};

            const { subject: configSubject, randomMode, rangeStart, rangeEnd } = config;
            const { name: userName } = user;
            setName(userName || '');
            setSubject(configSubject || '');

            const { subject: validatedSubject, time, questionCount } = validateQuizConfig();
            if (!validatedSubject) throw new Error('Chưa có môn học được chọn.');

            const fetchParams = randomMode
                ? { id: validatedSubject, mode: 'random', count: questionCount }
                : { id: validatedSubject, mode: 'range', start: Number(rangeStart), end: Number(rangeEnd) };

            const fetchedQuestions = await fetchQuestions(fetchParams);
            if (!isMounted.current) return;
            setQuestions(fetchedQuestions);
            setReviewMarks(new Array(fetchedQuestions.length).fill(false));
            setLockedAnswers(new Array(fetchedQuestions.length).fill(false));
            setAnswers(new Array(fetchedQuestions.length).fill(null));

            const parsedTime = parseInt(time, 10);
            const finalTime = isNaN(parsedTime) || parsedTime <= 0 ? 9999 : parsedTime;
            setTimeSet(finalTime);
            startExamTimer(finalTime);

        } catch (e) {
            if (isMounted.current) setError(e.message || 'Không thể tải đề thi.');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [startExamTimer]);

    useEffect(() => {
        isMounted.current = true;
        initExam();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            isMounted.current = false;
            clearInterval(timerRef.current);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [initExam, handleBeforeUnload]);

    const answeredCount = answers.filter(ans => ans !== null && ans !== undefined).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);


    const renderStatusBar = () => (
        <div id="status-bar" class="p-3 bg-light border-top fixed-bottom" style={{ zIndex: 1000 }}>
            <div class="d-flex flex-wrap justify-content-around align-items-center mb-3 gap-3">
                <p class="fw-bold mb-0">{name}</p>
                <div>
                    Thời gian:
                    <span class={`fw-bold ms-2 ${timeLeft < 300 && timeSet !== 9999 ? 'text-danger' : ''}`}>
                        {timeSet === 9999
                            ? 'Không giới hạn'
                            : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
                    </span>
                </div>
                <button class="btn btn-warning" onClick={() => setShowConfirmModal(true)}>Nộp bài ngay</button>
            </div>
            <Flex gap={16} justify="center" align="center" class="mt-3">
                <p class="fw-bold m-0">Tiến độ: {answeredCount}/{questions.length}</p>
                <Progress
                    percent={progressPercent}
                    status={progressPercent === 100 ? 'success' : 'active'}
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#52c41a',
                    }}
                    showInfo={true}
                    style={{ width: '90%', maxWidth: '70%' }}
                />
            </Flex>

        </div>
    );

    if (loading) return (
        <div class="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <Spin size="large" tip="Đang tải câu hỏi..." style={{ color: '#007bff' }} />
        </div>
    );
    if (error) return <div class="alert alert-danger">{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = answers[currentQuestionIndex];
    const correctAnswer = currentQuestion?.correctAnswer || currentQuestion?.ans;

    return (
        <div class="container mt-5 mb-5 pb-5">
            <ExamInfo timeSet={timeSet} questions={questions} subject={subject} />
            <div class="row">
                <div class="col-12">
                    <QuestionCard
                        key={currentQuestionIndex}
                        index={currentQuestionIndex}
                        question={currentQuestion}
                        answer={userAnswer}
                        reviewMark={reviewMarks[currentQuestionIndex]}
                        onToggleReview={toggleReviewMark}
                        onAnswerChange={handleAnswerChange}
                        isCorrect={isCorrect}
                        locked={lockedAnswers[currentQuestionIndex]}
                        canMarkReview={false}
                    />

                    {isCorrect !== null && (
                        <div class={`alert mt-3 ${isCorrect ? 'alert-success' : 'alert-danger'}`}>
                            {isCorrect ? (
                                'Đúng rồi! Bạn chọn chính xác.'
                            ) : (
                                <>
                                    Đáp án sai. <br />
                                    {correctAnswer && (
                                        <>
                                            <strong>Đáp án đúng:</strong> {correctAnswer} <br />
                                        </>
                                    )}
                                    {currentQuestion?.explain && (
                                        <>
                                            <strong>Giải thích:</strong> {currentQuestion.explain}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div class="d-flex justify-content-center mt-3">
                        {currentQuestionIndex < questions.length - 1 && (
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleNextQuestion}
                                disabled={currentQuestionIndex >= questions.length - 1 && !showConfirmModal && timeSet !== 9999}
                            >
                                Câu tiếp theo
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ height: '180px' }} />
                <div class="col-12 fixed-bottom">{renderStatusBar()}</div>
            </div>

            <ConfirmSubmitModal
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                onSubmit={() => submitExam(false)}
                timeSet={timeSet}
                timeLeft={timeLeft}
                answers={answers}
                questions={questions}
                reviewMarks={reviewMarks}
            />

            {timeSet !== 9999 && questions.length > 0 && answers.length > 0 && (
                <TimeUpModal
                    open={showTimeUpModal}
                    onSubmit={() => submitExam(true)}
                    questions={questions}
                    answers={answers}
                />
            )}
        </div>
    );
}