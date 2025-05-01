import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'

export default function Quiz() {
    const [subject, setSubject] = useState('')
    const [time, setTime] = useState('')
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
                rangeStart: randomMode ? null : Number(rangeStart),
                rangeEnd: randomMode ? null : Number(rangeEnd)
            })
        );
        route(`/exam`)
    }

    const user = JSON.parse(localStorage.getItem('user'))

    if (!user) {
        route('/')
        return null
    }

    return (
        <div class="container mt-5">
            <h1 class="text-center mb-4">Cấu hình bài thi</h1>
            <p class="text-center mb-4">Hãy chọn các tùy chọn cho bài thi của bạn.</p>

            <form class="col-12 col-md-6 mx-auto">
                <div class="mb-3">
                    <label for="selectSubject" class="form-label">Môn học</label>
                    <select
                        id="selectSubject"
                        class="form-select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn môn học --</option>
                        <option value="int1336">Mạng máy tính</option>
                        <option value="bas1122" disabled>Tư tưởng Hồ Chí Minh</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="selectTime" class="form-label">Thời gian làm bài</label>
                    <select
                        id="selectTime"
                        class="form-select"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn thời gian --</option>
                        <option value="30">30 phút</option>
                        <option value="60">60 phút</option>
                        <option value="90">90 phút</option>
                        <option value="120">120 phút</option>
                        <option value="9999">Không giới hạn</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label">Chế độ chọn câu hỏi</label>
                    <div>
                        <div class="form-check form-check-inline">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="questionMode"
                                id="randomMode"
                                value="random"
                                checked={randomMode}
                                onChange={() => setRandomMode(true)}
                            />
                            <label class="form-check-label" htmlFor="randomMode">
                                Random
                            </label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="questionMode"
                                id="rangeMode"
                                value="range"
                                checked={!randomMode}
                                onChange={() => setRandomMode(false)}
                                disabled
                            />
                            <label class="form-check-label" htmlFor="rangeMode">
                                Chọn theo khoảng
                            </label>
                        </div>
                    </div>
                </div>

                {randomMode && (
                    <div class="mb-3">
                        <label for="selectQuestionCount" class="form-label">Số câu hỏi</label>
                        <select
                            id="selectQuestionCount"
                            class="form-select"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn số câu hỏi --</option>
                            <option value="10">10 câu</option>
                            <option value="20">20 câu</option>
                            <option value="30">30 câu</option>
                            <option value="40">40 câu</option>
                            <option value="50">50 câu</option>
                        </select>
                    </div>
                )}

                {!randomMode && (
                    <>
                        <div class="mb-3">
                            <label for="rangeStart" class="form-label">Câu hỏi bắt đầu từ</label>
                            <input
                                type="number"
                                id="rangeStart"
                                class="form-control"
                                value={rangeStart}
                                onChange={(e) => setRangeStart(e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        <div class="mb-3">
                            <label for="rangeEnd" class="form-label">Câu hỏi kết thúc tại</label>
                            <input
                                type="number"
                                id="rangeEnd"
                                class="form-control"
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                    </>
                )}

                <div class="text-center">
                    <button
                        type="button"
                        class="btn btn-success"
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
