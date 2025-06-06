import { route } from 'preact-router';
import { saveAndSendResult } from './saveResult';
import { calculateScore } from './calculateScore';

export const handleSubmitExam = async ({
    questions,
    answers,
    timeSet,
    timeLeft,
    subject,
    setError,
    setShowConfirmModal,
    setShowTimeUpModal,
}) => {
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
            details: scoreResult.details,
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
