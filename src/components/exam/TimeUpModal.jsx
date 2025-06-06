// components/exam/TimeUpModal.jsx
import { Modal, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

export default function TimeUpModal({
    open,
    answers,
    questions,
    onSubmit
}) {
    return (
        <Modal
            title={<span style={{ color: 'white' }}>Hết thời gian làm bài!</span>}
            open={open}
            footer={null}
            closable={false}
            centered
            onCancel={() => {}} // tránh warning
            bodyStyle={{ textAlign: 'center' }}
            className="timeup-modal"
            zIndex={1061}
        >
            <ClockCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
            <p className="fw-bold">Đã hết thời gian làm bài.</p>
            <p>Đã trả lời: {answers.filter(a => a).length}/{questions.length} câu</p>
            <p>Bạn cần nộp bài ngay để xem kết quả.</p>
            <Button
                type="primary"
                danger
                onClick={onSubmit}
                style={{ marginTop: '12px' }}
            >
                Nộp bài ngay
            </Button>
        </Modal>
    );
}
