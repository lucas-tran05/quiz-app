import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { validateQuizConfig } from '../../utils/validateConfig';
import { loadQuestionsFromSubject } from '../../utils/loadQuestions';
import { selectRandomQuestions } from '../../utils/selectQuestionsRandom';
import { selectQuestionsInRange } from '../../utils/selectQuestionsInRange';
import { handleSubmitExam } from '../../utils/handleSubmitExam';
import QuestionCard from '../../components/exam/QuestionCard';
import ExamInfo from '../../components/exam/ExamInfo';
import ConfirmSubmitModal from '../../components/exam/ConfirmSubmitModal';
import TimeUpModal from '../../components/exam/TimeUpModal';

function QuestionNavigator({ questions, currentQuestionIndex, reviewMarks, answers, setCurrentQuestionIndex, setIsCorrect }) {
    return (
        <div class="d-flex flex-wrap gap-2 justify-content-center">
            {questions.map((_, index) => (
                <button
                    key={index}
                    class={`btn btn-sm rounded-3 ${index === currentQuestionIndex
                        ? 'btn-primary'
                        : index > currentQuestionIndex
                            ? reviewMarks[index]
                                ? 'btn-warning'
                                : answers[index]
                                    ? 'btn-success'
                                    : 'btn-outline-secondary'
                            : 'btn-secondary disabled'
                        }`}
                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '0.8rem' }}
                    onClick={() => {
                        if (index >= currentQuestionIndex) {
                            setCurrentQuestionIndex(index);
                            setIsCorrect(null);
                        }
                    }}
                    disabled={index < currentQuestionIndex}
                >
                    {String(index + 1).padStart(2, '0')}
                </button>
            ))}
        </div>
    );
}

export default function SingleQuestionExamWithNavigator() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
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
    const [lockedAnswers, setLockedAnswers] = useState([]);

    const isMounted = useRef(true);
    const timerRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        initExam();

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            isMounted.current = false;
            clearInterval(timerRef.current);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời khỏi? Bài làm sẽ bị hủy!';
    };

    const initExam = async () => {
        try {
            loadConfigFromLocalStorage();
            const { subject, time, questionCount } = validateQuizConfig();
            const allQuestions = await loadQuestionsFromSubject(subject);

            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
            const timeSetting = config.time || 0;

            const selectedQuestions = config.randomMode
                ? selectRandomQuestions(allQuestions, questionCount)
                : selectQuestionsInRange(allQuestions, config.rangeStart || 0, config.rangeEnd || 0);

            if (!isMounted.current) return;

            setQuestions(selectedQuestions);
            setReviewMarks(new Array(selectedQuestions.length).fill(false));
            setLockedAnswers(new Array(selectedQuestions.length).fill(false));
            setTimeSet(parseInt(timeSetting));
            setTimeLeft(parseInt(timeSetting) * 60);
            if (parseInt(timeSetting) !== 9999) startExamTimer();
            setLoading(false);
        } catch (e) {
            if (isMounted.current) {
                setError(e.message || 'Không thể tải đề thi.');
                setLoading(false);
            }
        }
    };

    const loadConfigFromLocalStorage = () => {
        try {
            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');
            setIsRandomMode(config.randomMode === true);
            setRangeStart(config.rangeStart || 0);
            setRangeEnd(config.rangeEnd || 0);
            setSubject(config.subject || '');

            const user = JSON.parse(localStorage.getItem('user')).value || {};
            setName(user.name || '');
        } catch (err) {
            console.error('Lỗi khi đọc localStorage:', err);
        }
    };

    const startExamTimer = () => {
        if (timeSet === 9999) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setShowTimeUpModal(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswerChange = (index, answer) => {
        setAnswers(prev => {
            const updated = [...prev];
            updated[index] = answer;
            return updated;
        });

        const correct = questions[index].correctAnswer || questions[index].ans;
        setIsCorrect(answer === correct);

        setLockedAnswers(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
        });
    };

    const toggleReviewMark = (index) => {
        setReviewMarks(prev => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };

    const submitExam = async (isTimeUp = false) => {
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
    };

    const handleNextQuestion = () => {
        setIsCorrect(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowConfirmModal(true);
        }
    };

    const renderStatusBar = () => (
        <div class="p-3 bg-light border-top fixed-bottom">
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
                <button class="btn btn-warning" onClick={() => setShowConfirmModal(true)}>
                    Nộp bài
                </button>
            </div>
            <QuestionNavigator
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                reviewMarks={reviewMarks}
                answers={answers}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                setIsCorrect={setIsCorrect}
            />
        </div>
    );

    if (loading) return <div>Đang tải đề thi...</div>;
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = answers[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer || currentQuestion.ans;

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
                            {isCorrect
                                ? 'Đúng rồi! Bạn chọn chính xác.'
                                : <>
                                    Đáp án sai. <br />
                                    <strong>Đáp án đúng:</strong> {correctAnswer}
                                </>
                            }
                        </div>
                    )}
                    <div class="d-flex justify-content-center mt-3 ">
                        <button
                            class="btn btn-outline-primary"
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex >= questions.length - 1 && timeSet !== 9999}
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Nộp bài'}
                        </button>
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
            {timeSet !== 9999 && (
                <TimeUpModal
                    open={showTimeUpModal}
                    answers={answers}
                    questions={questions}
                    onSubmit={() => submitExam(true)}
                />
            )}
        </div>
    );
}
