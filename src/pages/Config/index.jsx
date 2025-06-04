import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import {
    Form,
    Select,
    InputNumber,
    Radio,
    Button,
    Typography,
    message,
    Row,
    Col,
} from 'antd';
import { subjects } from '../../config/subjects';
import { timeOptions } from '../../config/time';
import { questionCountOptions } from '../../config/question';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Quiz() {
    const [form] = Form.useForm();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            route('/');
        }
    }, []);

    const handleFinish = (values) => {
        const {
            subject,
            time,
            questionMode,
            questionCount,
            rangeStart,
            rangeEnd,
        } = values;

        if (questionMode === 'range' && rangeStart > rangeEnd) {
            message.error('Câu hỏi bắt đầu phải nhỏ hơn hoặc bằng câu hỏi kết thúc.');
            return;
        }

        const config = {
            subject,
            time,
            randomMode: questionMode === 'random',
            questionCount: questionMode === 'random' ? questionCount : null,
            rangeStart: questionMode === 'range' ? rangeStart - 1 : null,
            rangeEnd: questionMode === 'range' ? rangeEnd - 1 : null,
            startTime: Date.now(),
        };

        localStorage.setItem('quiz-config', JSON.stringify(config));
        route('/exam');
    };

    return (
        <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
            <Typography style={{ textAlign: 'center' }}>
                <Title level={2}>Cấu hình bài thi</Title>
                <Paragraph>Hãy chọn các tùy chọn cho bài thi của bạn.</Paragraph>
            </Typography>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    time: timeOptions.find((opt) => opt.isdefault)?.value || '',
                    questionMode: 'random',
                }}
            >
                {/* Chọn môn học */}
                <Form.Item
                    label="Môn học"
                    name="subject"
                    rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                >
                    <Select
                        showSearch
                        placeholder="-- Chọn môn học --"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option?.children.toLowerCase().includes(input.toLowerCase())
                        }
                        size="large"
                    >
                        {subjects.map(({ value, label, disabled }) => (
                            <Option key={value} value={value} disabled={disabled}>
                                {label}
                            </Option>
                        ))}
                    </Select>

                </Form.Item>

                {/* Chọn thời gian */}
                <Form.Item
                    label="Thời gian làm bài"
                    name="time"
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                >
                    <Select placeholder="-- Chọn thời gian --" size='large'>
                        {timeOptions.map(({ value, label }) => (
                            <Option key={value} value={value}>
                                {label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Chế độ chọn câu hỏi */}
                <Form.Item label="Chế độ chọn câu hỏi" name="questionMode">
                    <Radio.Group>
                        <Radio value="random">Random</Radio>
                        <Radio value="range">Chọn theo khoảng</Radio>
                        <Radio value="all" disabled>
                            Toàn bộ câu hỏi
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                <Typography.Paragraph style={{ margin: 0, color: '#888', fontSize: '0.9em' }}>
                    Để làm toàn bộ câu hỏi trong bài thi, hãy chọn chế độ "Chọn theo khoảng" và nhập số câu hỏi bắt đầu = 0 và kết thúc = 1000.
                </Typography.Paragraph>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.questionMode !== curr.questionMode}>
                    {({ getFieldValue }) => {
                        const mode = getFieldValue('questionMode');
                        if (mode === 'random') {
                            return (
                                <Form.Item
                                    label="Số câu hỏi"
                                    name="questionCount"
                                    rules={[{ required: true, message: 'Vui lòng chọn số câu hỏi!' }]}
                                >
                                    <Select placeholder="-- Chọn số câu hỏi --" size='large'>
                                        {questionCountOptions.map(({ value, label }) => (
                                            <Option key={value} value={value}>
                                                {label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            );
                        } else if (mode === 'range') {
                            return (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Câu hỏi bắt đầu từ"
                                            name="rangeStart"
                                            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi bắt đầu!' },
                                            { type: 'number', min: 1, message: 'Câu hỏi bắt đầu phải lớn hơn hoặc bằng 1!' }
                                            ]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Câu hỏi kết thúc tại"
                                            name="rangeEnd"
                                            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi kết thúc!' },
                                            { type: 'number', min: 1, message: 'Câu hỏi kết thúc phải lớn hơn hoặc bằng 1!' }
                                            ]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                            );
                        }
                        return null;
                    }}
                </Form.Item>

                {/* Nút hành động */}
                <Form.Item style={{ textAlign: 'center' }}>
                    <Button type="default" onClick={() => route('/')} style={{ marginRight: 8 }}>
                        Home
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Bắt đầu thi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
