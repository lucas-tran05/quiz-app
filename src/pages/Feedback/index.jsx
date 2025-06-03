import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { subjects } from '../../config/subjects'
import { sendFeedbackToSheet } from '../../utils/sendAPI'

export default function Feedback() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [subject, setSubject] = useState('')
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                if (parsed && typeof parsed === 'object') {
                    setEmail(parsed.email || '')
                    setName(parsed.name || '')
                }
            } catch (err) {
                console.error('localStorage bị gì á:', err)
            }
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!email || !name || !subject || !feedback) {
            alert('Vui lòng điền đầy đủ thông tin.')
            return
        }

        const data = { email, name, subject, feedback }
        console.log('Gửi feedback:', data)

        sendFeedbackToSheet(data)

        setSubmitted(true)
    }


    if (submitted) {
        return (
            <div class="container mt-5 text-center">
                <h2>Cảm ơn bạn đã gửi phản hồi</h2>
                <p class="mb-4">Chúng tôi sẽ xem xét và cải thiện ngay!</p>
                <button
                    class="btn btn-outline-dark m-2"
                    onClick={() => {
                        localStorage.removeItem('quiz-result');
                        const user = localStorage.getItem('user');
                        if (user) {
                            route(`/config`);
                        } else {
                            route('/');
                        }
                    }}
                >
                    Trang chủ
                </button>
                <button class="btn btn-success m-2" onClick={() => setSubmitted(false)}>Gửi tiếp</button>
                <button class="btn btn-outline-dark m-2" onClick={() => route('/result')}>Trang kết quả</button>
            </div>
        )
    }

    return (
        <div class="container mt-5">
            <h2 class="text-center mb-4">Góp ý câu hỏi sai</h2>
            <p class="text-center mb-4">Nếu bạn phát hiện câu hỏi chưa chính xác, đừng ngần ngại giúp tụi mình cải thiện nha!</p>

            <form class="mb-4 col-12 col-md-6 mx-auto" onSubmit={handleSubmit}>
                <div class="form-floating mb-3">
                    <input
                        type="email"
                        class="form-control"
                        id="inputEmail"
                        placeholder="name@example.com"
                        value={email}
                        onInput={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label for="inputEmail">Email</label>
                </div>

                <div class="form-floating mb-3">
                    <input
                        type="text"
                        class="form-control"
                        id="inputName"
                        placeholder="Tran Van A"
                        value={name}
                        onInput={(e) => setName(e.target.value)}
                        required
                    />
                    <label for="inputName">Họ và tên</label>
                </div>

                <div className="mb-3">
                    <label htmlFor="selectSubject" className="form-label">Môn học</label>
                    <select
                        id="selectSubject"
                        className="form-select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn môn học --</option>
                        {subjects.map(({ value, label, disabled }) => (
                            <option key={value} value={value} disabled={disabled}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div class="form-floating mb-4">
                    <textarea
                        class="form-control"
                        placeholder="Nội dung câu hỏi sai hoặc góp ý..."
                        id="feedbackTextarea"
                        style={{ height: '150px' }}
                        value={feedback}
                        onInput={(e) => setFeedback(e.target.value)}
                        required
                    />
                    <label for="feedbackTextarea">Câu hỏi sai và góp ý</label>
                </div>

                <div class="text-center">
                    <button
                        class="btn btn-outline-dark m-2"
                        onClick={() => {
                            localStorage.removeItem('quiz-result');
                            const user = localStorage.getItem('user');
                            if (user) {
                                route(`/config`);
                            } else {
                                route('/');
                            }
                        }}
                    >
                        Trang chủ
                    </button>
                    <button type="submit" class="btn btn-success m-2">Gửi góp ý</button>
                    <button type="button" class="btn btn-outline-dark m-2" onClick={() => route('/result')}>Trang kết quả</button>
                </div>
            </form>
        </div>
    )
}
