import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as XLSX from 'xlsx'; // Import thư viện xlsx
import exampleTemplate from '../../assets/quiz-template.xlsx?url';

export default function UploadPage() {
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [questions, setQuestions] = useState([]); // Thêm state để lưu câu hỏi
    const [isDownloadEnabled, setIsDownloadEnabled] = useState(false); // Trạng thái enable nút download

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        const fileExtension = uploadedFile?.name.split('.').pop().toLowerCase();

        if (fileExtension !== 'xlsx') {
            setMessage('❌ Vui lòng chọn file Excel (.xlsx).');
            setFile(null);
            return;
        }

        setFile(uploadedFile);
        setMessage(''); // Xóa thông báo lỗi nếu file hợp lệ
    };

    const handleUpload = async () => {
        if (!subjectName || !subjectCode || !file) {
            setMessage('Vui lòng điền đầy đủ thông tin và chọn file.');
            return;
        }

        try {
            // Đọc file Excel
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Lấy sheet đầu tiên
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                // Chuyển đổi sheet thành mảng các đối tượng
                const fileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Kiểm tra dòng đầu tiên có đúng cấu trúc không
                const firstRow = fileData[0]; // Dòng đầu tiên
                const requiredHeaders = ['Question', 'a', 'b', 'c', 'd', 'Ans'];

                const isValidFormat = requiredHeaders.every((header, index) => header === firstRow[index]);

                if (!isValidFormat) {
                    setMessage('❌ Dòng đầu tiên không đúng định dạng. Cần có các cột: Question, a, b, c, d, Ans.');
                    setQuestions([]);
                    return;
                }

                // Chuyển dữ liệu thành câu hỏi
                const questionsData = fileData.slice(1).map((row) => ({
                    question: row[0],
                    a: row[1],
                    b: row[2],
                    c: row[3],
                    d: row[4],
                    ans: row[5],
                }));

                setQuestions(questionsData); // Cập nhật câu hỏi vào state
                setIsDownloadEnabled(true); // Bật nút tải JSON khi chuyển đổi thành công
                setMessage(`✅ Đã chuyển đổi thành công!`);
            };

            reader.readAsBinaryString(file); // Đọc file như một chuỗi nhị phân
        } catch (err) {
            console.error(err);
            setMessage('❌ Lỗi khi xử lý file. Đảm bảo file đúng định dạng.');
        }
    };

    const handleDownloadJson = () => {
        const fileName = `${subjectCode}.json`;

        const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch(exampleTemplate);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'quiz-template.xlsx';
            a.click();

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Lỗi khi tải file mẫu:', err);
            setMessage('❌ Không thể tải file mẫu.');
        }
    };

    return (
        <div class="container-fluid d-flex flex-column justify-content-center">
            <h2 class="text-center mb-4 mt-4">Upload bài trắc nghiệm từ file Excel</h2>

            <div class="col-6 mx-auto p-4">
                <div class="mb-3 d-flex">
                    <div class="me-2 w-50">
                        <label class="form-label">Tên môn học</label>
                        <input class="form-control" value={subjectName} onInput={(e) => setSubjectName(e.target.value)} />
                    </div>
                    <div class="w-50">
                        <label class="form-label">Mã môn học (không dấu cách)</label>
                        <input class="form-control" value={subjectCode} onInput={(e) => setSubjectCode(e.target.value.trim())} />
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Tải lên file Excel</label>
                    <input type="file" accept=".xlsx" class="form-control" onChange={handleFileChange} />
                </div>
                <div class="mb-3">
                    <button class="btn btn-link" type="button" onClick={handleDownloadTemplate}>
                        📄 Tải file mẫu Excel
                    </button>
                </div>
                <div class="text-center">
                    <button class="btn btn-primary" onClick={handleUpload}>
                        Chuyển đổi và hiển thị câu hỏi
                    </button>
                </div>
                {message && <div class="alert alert-info mt-3 text-center">{message}</div>}

                {/* Hiển thị danh sách câu hỏi */}
                {questions.length > 0 && (
                    <div class="mt-4" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        <h5 class="text-center mb-3">📋 Danh sách câu hỏi ({questions.length})</h5>
                        <ul class="list-group">
                            {questions.map((q, idx) => (
                                <li key={idx} class="list-group-item">
                                    <strong>Câu {idx + 1}:</strong> {q.question}
                                    <ul class="mt-2">
                                        <li><strong>A:</strong> {q.a}</li>
                                        <li><strong>B:</strong> {q.b}</li>
                                        <li><strong>C:</strong> {q.c}</li>
                                        <li><strong>D:</strong> {q.d}</li>
                                        <li><strong>Đáp án:</strong> {q.ans || '(chưa có)'}</li>
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Nút tải về JSON */}
                {isDownloadEnabled && (
                    <div class="mt-3 text-center">
                        <button class="btn btn-success" onClick={handleDownloadJson}>
                            Tải về JSON
                        </button>
                        <button class="btn btn-primary ms-2">
                            Post to server
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
