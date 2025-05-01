import { route } from 'preact-router'
import { useState } from 'preact/hooks'

export default function Home() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [major, setMajor] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        localStorage.setItem('user', JSON.stringify({ email, name, major }))
        route('/config')
    }

    return (
        <div class="container mt-5">
            <h1 class="text-center mb-4">Chào mừng đến với trang thi!</h1>
            <p class="text-center mb-4">Hãy chuẩn bị cho bài kiểm tra của bạn.</p>

            <form class="mb-4 col-4 mx-auto" onSubmit={handleSubmit}>
                <div class="form-floating mb-3">
                    <input
                        type="email"
                        class="form-control"
                        id="inputEmail"
                        placeholder="name@example.com"
                        value={email}
                        onInput={(e) => setEmail(e.target.value)}
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
                    >
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="An toàn thông tin">An toàn thông tin</option>
                        <option value="Khoa học máy tính">Khoa học máy tính</option>
                        <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                        <option value="Khoa học dữ liệu">Khoa học dữ liệu</option>
                    </select>
                </div>
            </form>

            <div class="text-center">
                <button type="submit" class="btn btn-primary" onClick={handleSubmit}>Bắt đầu</button>
            </div>
        </div>
    )
}
