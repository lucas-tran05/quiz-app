const KEY = import.meta.env.VITE_SECRET_KEY || 'b23dcat034';
const API_URL = 'https://script.google.com/macros/s/AKfycbzJ4qGLNT8kHvsuh_EqiYGLW2cWydOOPHyDkn5GWTU53mL68Hn6-VyIh5mexXp9EQ0p/exec'

async function sendResultToSheet(result) {
    const formData = new FormData();
    formData.append('email', result.email);
    formData.append('fullname', result.fullname);
    formData.append('major', result.major);
    formData.append('subject', result.subject);
    formData.append('totalQuestions', result.total);
    formData.append('score', (Math.round((result.correct / result.total) * 10 * 100) / 100).toString().replace('.', ','));
    formData.append('mode', result.mode);
    formData.append('range', result.range || '');
    formData.append('time', result.time || '');
    formData.append('startTime', result.startTime || '');
    formData.append('endTime', result.endTime || '');
    formData.append('secret', KEY);
    formData.append('type', 'result');

    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
        .then(() => {
            // console.log('Kết quả bài thi được gửi thành công!');
            let results = JSON.parse(localStorage.getItem('result')) || [];
            results.push(result);
            localStorage.setItem('result', JSON.stringify(results));
        })
        .catch(err => {
            console.error('Lỗi gửi:', err);
        });
}

async function sendFeedbackToSheet(feedbackData) {
    const formData = new FormData();
    formData.append('email', feedbackData.email);
    formData.append('name', feedbackData.name);
    formData.append('subject', feedbackData.subject);
    formData.append('feedback', feedbackData.feedback);
    formData.append('secret', KEY);
    formData.append('type', 'feedback');

    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
        .then(() => {
            console.log('Feedback đã được gửi thành công!');
        })
        .catch(err => {
            console.error('Lỗi gửi feedback:', err);
        });
}

// ✅ sendAPI.jsx
export { sendResultToSheet, sendFeedbackToSheet };
