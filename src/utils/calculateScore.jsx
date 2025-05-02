/**
 * Tính điểm dựa trên câu trả lời và câu hỏi
 * @param {Array} questions - Mảng các câu hỏi
 * @param {Array} answers - Mảng các câu trả lời
 * @returns {Object} - Kết quả bài thi với điểm số và thông tin chi tiết
 */
export const calculateScore = (questions, answers) => {
    // Kiểm tra dữ liệu đầu vào
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error('Không có câu hỏi để tính điểm');
        return {
            score: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            unanswered: 0,
            details: []
        };
    }

    // Đảm bảo answers là một mảng
    const validAnswers = Array.isArray(answers) ? answers : [];
    
    // Tính toán điểm
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    
    const details = questions.map((question, index) => {
        const userAnswer = validAnswers[index] || null;
        const isCorrect = userAnswer === question.answer;
        
        if (!userAnswer) {
            unanswered++;
            return {
                question: question.question,
                userAnswer: null,
                correctAnswer: question.answer,
                isCorrect: false
            };
        }
        
        if (isCorrect) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
        
        return {
            question: question.question,
            userAnswer,
            correctAnswer: question.answer,
            isCorrect
        };
    });
    
    // Tính điểm theo thang điểm 10
    const score = questions.length > 0 
        ? (correctAnswers / questions.length) * 10 
        : 0;
    
    return {
        score: parseFloat(score.toFixed(2)),
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers,
        unanswered,
        details
    };
};

/**
 * Lưu kết quả bài thi vào localStorage
 * @param {Object} result - Kết quả bài thi
 */
export const saveQuizResult = (result) => {
    try {
        const resultObject = {
            ...result,
            timestamp: new Date().toISOString(),
        };
        
        // Lưu kết quả hiện tại
        localStorage.setItem('quiz-result', JSON.stringify(resultObject));
        
        // Lưu vào lịch sử kết quả
        const historyKey = 'quiz-history';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history.push(resultObject);
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        return resultObject;
    } catch (error) {
        console.error('Lỗi khi lưu kết quả bài thi:', error);
        throw error;
    }
};