import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { validateQuizConfig } from '../../utils/validateConfig';
import QuestionCard from '../../components/exam/QuestionCard';
import ExamInfo from '../../components/exam/ExamInfo';
import { handleSubmitExam } from '../../utils/handleSubmitExam';
import ConfirmSubmitModal from '../../components/exam/ConfirmSubmitModal';
import TimeUpModal from '../../components/exam/TimeUpModal';
import fetchQuestions from '../../utils/fetchQuestions';
import { Spin } from 'antd';

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
            const config = JSON.parse(localStorage.getItem('quiz-config') || '{}');

            const randomMode = config.randomMode === true;
            const start = config.rangeStart || 0;
            const end = config.rangeEnd || 0;
            const timeSetting = config.time || 0;

            setTimeSet(parseInt(timeSetting));
            setTimeLeft(parseInt(timeSetting) * 60);

            const fetchParams = {
                id: subject,
                mode: randomMode ? 'random' : 'range',
            };

            if (randomMode) {
                fetchParams.count = questionCount;
            } else {
                fetchParams.start = start;
                fetchParams.end = end;
            }

            const selectedQuestions = await fetchQuestions(fetchParams);

            if (!isMounted.current) return;

            setQuestions(selectedQuestions);
            setReviewMarks(new Array(selectedQuestions.length).fill(false));
            if (parseInt(timeSetting) !== 9999) {
                startExamTimer();
            }
            setLoading(false);
        } catch (e) {
            if (isMounted.current) {
                setError(e.message || 'Không thể tải câu hỏi từ máy chủ.');
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

            const user = JSON.parse(localStorage.getItem('user')).value || {};
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

    const handleSubmitClick = () => {
        setShowConfirmModal(true);
    };

    const scrollToQuestion = (index) => {
        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
    };

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

    const renderConfirmModal = () => (
        <ConfirmSubmitModal
            open={showConfirmModal}
            onCancel={() => setShowConfirmModal(false)}
            onSubmit={() => {
                setShowConfirmModal(false);
                submitExam(false);
            }}
            timeSet={timeSet}
            timeLeft={timeLeft}
            answers={answers}
            questions={questions}
            reviewMarks={reviewMarks}
        />
    );

    const renderTimeUpModal = () => {
        if (timeSet === 9999) return null;

        return (
            <TimeUpModal
                open={showTimeUpModal}
                answers={answers}
                questions={questions}
                onSubmit={() => submitExam(true)}
            />
        );
    };
    if (loading) return (
        <div class="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <Spin size="large" tip="Đang tải câu hỏi..." style={{ color: '#007bff' }} />
        </div>
    );
    if (error) return <div>{error}</div>;
    if (questions.length === 0) return <div>Không có câu hỏi.</div>;

    return (
        <div class="container mt-5 mb-5 pb-5">
            <ExamInfo timeSet={timeSet} questions={questions} subject={subject} />
            <div class="row">
                <div class="col-12">
                    {questions.map((q, index) => (
                        <QuestionCard
                            key={index}
                            index={index}
                            question={q}
                            answer={answers[index]}
                            reviewMark={reviewMarks[index]}
                            onToggleReview={toggleReviewMark}
                            onAnswerChange={handleAnswerChange}
                            locked={false}
                        />
                    ))}
                </div>
                <div style={{ height: '180px' }} />
                <div class="col-12 fixed-bottom">{renderStatusBar()}</div>
            </div>
            {renderConfirmModal()}
            {renderTimeUpModal()}
        </div>
    );
}