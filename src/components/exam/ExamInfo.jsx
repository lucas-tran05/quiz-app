import { Card, Row, Col } from 'antd';
import { subjects } from '../../config/subjects';

export default function ExamInfo({ timeSet, questions, subject }) {
    const subjectName = subjects.find((s) => s.value === subject)?.label || 'Không xác định';

    return (
        <Card title="Thông tin bài thi" style={{ width: '100%', marginBottom: '16px' }} className="qestion">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <strong>Thời gian làm bài:</strong>{' '}
                    {timeSet === 9999 ? 'Không giới hạn' : `${timeSet} phút`}
                </Col>
                <Col xs={24} md={8}>
                    <strong>Số câu hỏi:</strong> {questions.length}
                </Col>
                <Col xs={24} md={8}>
                    <strong>Chủ đề:</strong> {subjectName}
                </Col>
            </Row>
        </Card>
    );
}
