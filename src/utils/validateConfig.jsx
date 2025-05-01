import { route } from 'preact-router';

export function validateQuizConfig() {
    const quizSettings = localStorage.getItem('quiz-config');
    if (!quizSettings) {
        route('/config');
        throw new Error('Không tìm thấy cấu hình bài thi.');
    }
    return JSON.parse(quizSettings);
}
