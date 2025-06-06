// components/exam/ConfirmSubmitModal.jsx
import { h } from 'preact';
import { Modal, Button } from 'antd';

export default function ConfirmSubmitModal({
    open,
    onCancel,
    onSubmit,
    timeSet,
    timeLeft,
    answers,
    questions,
    reviewMarks
}) {
    const formattedTime = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    return (
        <Modal
            title="Xác nhận nộp bài"
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Huỷ
                </Button>,
                <Button
                    key="submit"
                    style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: '#000' }}
                    onClick={onSubmit}
                >
                    Nộp bài
                </Button>
            ]}
            centered
            zIndex={1061}
        >
            <p>
                {timeSet === 9999
                    ? 'Bạn đang làm bài ở chế độ không giới hạn thời gian.'
                    : `Bạn vẫn còn thời gian làm bài (${formattedTime}).`}
            </p>
            <p>Đã trả lời: {answers.filter((a) => a).length}/{questions.length} câu</p>
            <p>Đánh dấu xem lại: {reviewMarks.filter((mark) => mark).length} câu</p>
        </Modal>
    );
}
