import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { subjects } from '../../config/subjects'
import { timeOptions } from '../../config/time'
import { questionCountOptions } from '../../config/question'
import Alert from '../../components/alert'

export default function Quiz() {
    const defaultTime = timeOptions.find(opt => opt.isdefault)?.value || ''
    const [subject, setSubject] = useState('')
    const [time, setTime] = useState(defaultTime)
    const [questionCount, setQuestionCount] = useState('')
    const [randomMode, setRandomMode] = useState(true)
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')

    const handleStart = () => {
        localStorage.setItem(
            'quiz-config',
            JSON.stringify({
                subject,
                time,
                questionCount: randomMode ? questionCount : null,
                randomMode,
                rangeStart: randomMode ? null : Number(rangeStart - 1),
                rangeEnd: randomMode ? null : Number(rangeEnd - 1),
                startTime: Date.now()
            })
        )
        route('/exam')
    }

    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
        route('/')
        return null
    }

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Cấu hình bài thi</h1>
            <p className="text-center mb-4">Hãy chọn các tùy chọn cho bài thi của bạn.</p>
            <form className="col-12 col-md-6 mx-auto">
                {/* Chọn môn học */}
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

                {/* Chọn thời gian */}
                <div className="mb-3">
                    <label htmlFor="selectTime" className="form-label">Thời gian làm bài</label>
                    <select
                        id="selectTime"
                        className="form-select"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn thời gian --</option>
                        {timeOptions.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chế độ chọn câu hỏi */}
                <div className="mb-3">
                    <label className="form-label">Chế độ chọn câu hỏi</label>
                    <div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="questionMode"
                                id="randomMode"
                                value="random"
                                checked={randomMode}
                                onChange={() => setRandomMode(true)}
                            />
                            <label className="form-check-label" htmlFor="randomMode">
                                Random
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="questionMode"
                                id="rangeMode"
                                value="range"
                                checked={!randomMode}
                                onChange={() => setRandomMode(false)}
                            />
                            <label className="form-check-label" htmlFor="rangeMode">
                                Chọn theo khoảng
                            </label>
                        </div>
                    </div>
                    <p style="color: red; font-style: italic; font-size: 0.7em; opacity: 0.7;">
                        * Để làm toàn bộ câu hỏi trong bài thi, hãy chọn chế độ "Chọn theo khoảng" và nhập số câu hỏi bắt đầu = 0 và kết thúc = 1000.
                    </p>
                </div>

                {/* Random mode: chọn số câu hỏi */}
                {randomMode && (
                    <div className="mb-3">
                        <label htmlFor="selectQuestionCount" className="form-label">Số câu hỏi</label>
                        <select
                            id="selectQuestionCount"
                            className="form-select"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn số câu hỏi --</option>
                            {questionCountOptions.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Range mode: chọn khoảng câu hỏi */}
                {!randomMode && (
                    <div className="row mb-3">
                        <div className="mb-3 col-6">
                            <label htmlFor="rangeStart" className="form-label">Câu hỏi bắt đầu từ</label>
                            <input
                                type="number"
                                id="rangeStart"
                                className="form-control"
                                value={rangeStart}
                                onChange={(e) => setRangeStart(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                        <div className="mb-3 col-6">
                            <label htmlFor="rangeEnd" className="form-label">Câu hỏi kết thúc tại</label>
                            <input
                                type="number"
                                id="rangeEnd"
                                className="form-control"
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Nút hành động */}
                <div className="text-center mb-3 d-flex justify-content-center gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-success"
                        style={{ width: '100px' }}
                        onClick={() => route('/')}
                    >
                        Home
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleStart}
                        disabled={
                            !subject ||
                            !time ||
                            (randomMode && !questionCount) ||
                            (!randomMode && (!rangeStart || !rangeEnd || Number(rangeStart) > Number(rangeEnd)))
                        }
                    >
                        Bắt đầu thi
                    </button>
                </div>
            </form>
        </div>
    )
}
