import { route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import {
    Form,
    Input,
    Select,
    Button,
    Typography,
    message,
    Row,
    Col,
    Modal,
    Space,
} from 'antd';
import { subjects } from '../../config/subjects';
import { sendFeedbackToSheet } from '../../utils/sendAPI';
import { CheckCircleOutlined } from '@ant-design/icons';


const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Feedback() {
    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser).value;
                if (parsed && typeof parsed === 'object') {
                    form.setFieldsValue({
                        email: parsed.email || '',
                        name: parsed.name || '',
                    });
                }
            } catch (err) {
                console.error('localStorage bị gì á:', err);
            }
        }

        const storedSubject = localStorage.getItem('quiz-result');
        if (storedSubject) {
            try {
                const parsed = JSON.parse(storedSubject);
                if (parsed && parsed.subject) {
                    form.setFieldsValue({
                        subject: parsed.subject,
                    });
                }
            } catch (err) {
                console.error('localStorage bị gì á:', err);
            }
        }

        const storedFeedback = localStorage.getItem('feedback');
        if (storedFeedback) {
            try {
                const parsed = JSON.parse(storedFeedback);
                if (Array.isArray(parsed)) {
                    const formattedText = formatFeedbackToString(parsed);
                    form.setFieldsValue({ feedback: formattedText });
                }
            } catch (e) {
                console.error('Lỗi parse feedback:', e);
            }
        }
    }, []);

    const formatFeedbackToString = (feedbackArray) => {
        return feedbackArray.map((item, index) => {
            const q = item.question;
            const opts = item.options;
            return `Câu hỏi có vấn đề: 
${index + 1}. ${q}
A. ${opts.a}
B. ${opts.b}
C. ${opts.c}
D. ${opts.d}

Gợi ý sửa:  
`;
        }).join('\n');
    };

    const handleSubmit = (values) => {
        const { email, name, subject, feedback } = values;

        if (!email || !name || !subject || !feedback) {
            message.error('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        sendFeedbackToSheet({ email, name, subject, feedback });
        setModalVisible(true);
    };

    const handleResetAndRoute = (path) => {
        localStorage.removeItem('feedback');
        setModalVisible(false);
        route(path);
    };

    return (
        <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
            <Typography style={{ textAlign: 'center' }}>
                <Title level={2}>Góp ý câu hỏi sai</Title>
                <Paragraph>Đừng ngại góp ý! Tụi mình trân trọng mọi đóng góp từ bạn</Paragraph>
            </Typography>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                >
                    <Input placeholder="name@example.com" size="large" />
                </Form.Item>

                <Form.Item
                    label="Họ và tên"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input placeholder="Trần Văn A" size="large" />
                </Form.Item>

                <Form.Item
                    label="Môn học"
                    name="subject"
                    rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                >
                    <Select placeholder="-- Chọn môn học --" size="large">
                        {subjects.map(({ value, label, disabled }) => (
                            <Option key={value} value={value} disabled={disabled}>
                                {label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Câu hỏi sai và góp ý"
                    name="feedback"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung góp ý!' }]}
                >
                    <TextArea
                        placeholder="Nội dung câu hỏi sai hoặc góp ý..."
                        rows={5}
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Row gutter={[12, 12]} justify="center">
                        <Col xs={24} sm={5} md="auto">
                            <Button
                                block
                                type="default"
                                onClick={() => {
                                    localStorage.removeItem('feedback');
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
                            </Button>
                        </Col>
                        <Col xs={24} sm={5} md="auto">
                            <Button block type="primary" htmlType="submit">
                                Gửi góp ý
                            </Button>
                        </Col>
                        <Col xs={24} sm={5} md="auto">
                            <Button block onClick={() => route('/result')}>
                                Trang kết quả
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>

            <Modal
                visible={modalVisible}
                centered
                closable={false}
                title={
                    <span>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Cảm ơn bạn đã gửi phản hồi
                    </span>
                }
                onCancel={() => setModalVisible(false)}
                footer={
                    <Space style={{ justifyContent: 'center', width: '100%' }}>
                        <Button
                            onClick={() => {
                                const user = localStorage.getItem('user');
                                const path = user ? '/config' : '/';
                                localStorage.removeItem('quiz-result');
                                localStorage.removeItem('feedback');
                                handleResetAndRoute(path);
                            }}
                        >
                            Trang chủ
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                localStorage.removeItem('feedback');
                                setModalVisible(false);
                            }}
                        >
                            Gửi tiếp
                        </Button>

                        <Button onClick={() => handleResetAndRoute('/result')}>
                            Trang kết quả
                        </Button>
                    </Space>
                }
            >
                <Paragraph>
                    Cảm ơn bạn đã dành thời gian để gửi góp ý. Chúng tôi sẽ xem xét và cải thiện ngay!
                </Paragraph>
                <Paragraph>
                    Nếu bạn có thêm câu hỏi nào khác, đừng ngần ngại gửi tiếp nhé!
                </Paragraph>
            </Modal>

        </div>
    );
}
