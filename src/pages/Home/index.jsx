import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

export default function Home() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [major, setMajor] = useState('')

    // Lấy dữ liệu từ localStorage nếu đã có
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const { email, name, major } = JSON.parse(storedUser)
                setEmail(email || '')
                setName(name || '')
                setMajor(major || '')
            } catch (err) {
                console.error('Lỗi khi đọc localStorage:', err)
            }
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!email || !name || !major) {
            alert('Vui lòng điền đầy đủ thông tin.')
            return
        }

        localStorage.setItem('user', JSON.stringify({ email, name, major }))
        route('/config')
    }

    return (
        <div class="container mt-5">
            <h1 class="text-center mb-4">Chào mừng đến với trang thi!</h1>
            <p class="text-center mb-4">Hãy chuẩn bị cho bài kiểm tra của bạn.</p>

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

                <div class="mb-3">
                    <label for="majorSelect" class="form-label m-2">Ngành học</label>
                    <select
                        id="majorSelect"
                        class="form-select"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        required
                    >
                        <option value="" disabled>-- Chọn ngành học --</option>
                        <option value="Kĩ thuật">Kĩ thuật</option>
                        <option value="Kinh tế">Kinh tế</option>
                        <option value="Đa phương tiện">Đa phương tiện</option>
                        <option value="Báo chí">Báo chí</option>
                    </select>
                </div>

                <div class="text-center mb-4">
                    <button
                        type="submit"
                        class="btn btn-success"
                        disabled={!email || !name || !major}
                    >
                        Bắt đầu
                    </button>
                </div>

            </form>
        </div>
    )
}
