const KEY = import.meta.env.VITE_SECRET_KEY || 'b23dcat034';

async function sendResultToSheet(result) {
    console.log('Gửi kết quả:', result);
    console.log('Secret key:', KEY);
    const formData = new FormData();
    formData.append('email', result.email);
    formData.append('fullname', result.fullname);
    formData.append('major', result.major);
    formData.append('subject', result.subject);
    formData.append('totalQuestions', result.total);
    formData.append('score', result.correct / result.total * 10);
    formData.append('secret', KEY);

    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    fetch('https://script.google.com/macros/s/AKfycbzJ4qGLNT8kHvsuh_EqiYGLW2cWydOOPHyDkn5GWTU53mL68Hn6-VyIh5mexXp9EQ0p/exec', {
        method: 'POST',
        mode: 'no-cors',
        // headers: {
        //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        // },
        body: formData
    })
        .then(() => {
            console.log('Gửi thành công!');
        })
        .catch(err => {
            console.error('Lỗi gửi:', err);
        });
}

export { sendResultToSheet };
