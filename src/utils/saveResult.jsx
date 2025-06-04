import { sendResultToSheet } from './sendAPI';

export function saveAndSendResult({ questions, answers }) {
    let correct = 0;
    const user = JSON.parse(localStorage.getItem('user'));
    const config = JSON.parse(localStorage.getItem('quiz-config'));
    const subject = config ? config.subject : null;
    if (!user || !config) throw new Error('Missing user or quiz config');
    questions.forEach((q, idx) => {
        if (answers[idx] === q.ans) correct++;
    });

    localStorage.setItem(
        'quiz-result',
        JSON.stringify({ correct, total: questions.length, questions, subject, answers })
    );


    const result = {
        email: user.email,
        fullname: user.name,
        major: user.major,
        correct,
        total: questions.length,
        subject: subject,
        mode: config.randomMode ? 'Random' : 'Range',
        range: config.randomMode ? null : `${config.rangeStart} - ${config.rangeEnd}`,
        time: config.time,
        startTime: config.startTime,
        endTime: Date.now(),
    };

    sendResultToSheet(result);
    return result;
}
