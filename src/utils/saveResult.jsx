import { sendResultToSheet } from './sendResult';

export function saveAndSendResult({ questions, answers }) {
    let correct = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] === q.ans) correct++;
    });

    localStorage.setItem(
        'quiz-result',
        JSON.stringify({ correct, total: questions.length, answers, questions })
    );

    const user = JSON.parse(localStorage.getItem('user'));
    const config = JSON.parse(localStorage.getItem('quiz-config'));
    if (!user || !config) throw new Error('Missing user or quiz config');

    const result = {
        email: user.email,
        fullname: user.name,
        major: user.major,
        correct,
        total: questions.length,
        subject: config.subject,
    };

    sendResultToSheet(result);
    return result;
}
