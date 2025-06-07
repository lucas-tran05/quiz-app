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
    message as antMessage
} from 'antd';
import { subjects } from '../../config/subjects';
import { timeOptions } from '../../config/time';
import { questionCountOptions } from '../../config/question';
import RecentResults from '../../components/history/historyCard';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Quiz() {
    const [form] = Form.useForm();

    // Check user mỗi lần vào trang này
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            antMessage.error('Bạn cần đăng nhập để truy cập trang này.');
            route('/');
            return;
        }

        try {
            const parsed = JSON.parse(storedUser);
            const now = Date.now();

            if (!parsed.expiry || now > parsed.expiry) {
                localStorage.removeItem('user');
                antMessage.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                route('/');
                return;
            }
        } catch (err) {
            localStorage.removeItem('user');
            route('/');
        }
    }, []);

    // Hàm checkUser dùng khi submit bắt buộc phải đúng thì submit, sai redirect
    const checkUser = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            antMessage.error('Bạn cần đăng nhập để truy cập trang này.');
            route('/');
            return false;
        }

        try {
            const parsed = JSON.parse(storedUser);
            const now = Date.now();

            if (!parsed.expiry || now > parsed.expiry) {
                localStorage.removeItem('user');
                antMessage.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                route('/');
                return false;
            }

            return true;
        } catch (err) {
            localStorage.removeItem('user');
            route('/');
            return false;
        }
    };

    const handleFinish = (values) => {
        if (!checkUser()) return;

        const {
            subject,
            time,
            questionMode,
            questionCount,
            rangeStart,
            rangeEnd,
            examMode,
        } = values;

        // Validate range
        if (questionMode === 'range' && rangeStart > rangeEnd) {
            message.error('Câu hỏi bắt đầu phải nhỏ hơn hoặc bằng câu hỏi kết thúc.');
            return;
        }

        const config = {
            subject,
            time,
            randomMode: questionMode === 'random',
            questionCount: questionMode === 'random' ? questionCount : null,
            rangeStart: questionMode === 'range' ? rangeStart - 1 : questionMode === 'all' ? 0 : null,
            rangeEnd: questionMode === 'range' ? rangeEnd : questionMode === 'all' ? 1000 : null,
            startTime: Date.now(),
        };

        localStorage.setItem('quiz-config', JSON.stringify(config));

        if (examMode === 'all') {
            route('/exam/');
        } else {
            route('/exam/ver2');
        }
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
                    <Select placeholder="-- Chọn thời gian --" size="large">
                        {timeOptions.map(({ value, label }) => (
                            <Option key={value} value={value}>
                                {label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Chế độ làm bài */}
                <Form.Item
                    label="Chế độ làm bài"
                    name="examMode"
                    initialValue="all"
                    rules={[{ required: true, message: 'Vui lòng chọn chế độ làm bài!' }]}
                >
                    <Radio.Group>
                        <Radio value="all">Hiển thị toàn bộ câu hỏi</Radio>
                        <Radio value="each">Hiển thị từng câu (beta)</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* Chế độ chọn câu hỏi */}
                <Form.Item label="Chế độ chọn câu hỏi" name="questionMode"
                    initialValue="random"
                    rules={[{ required: true, message: 'Vui lòng chọn chế độ câu hỏi!' }]}
                >
                    <Radio.Group>
                        <Radio value="random">Random</Radio>
                        <Radio value="range">Chọn theo khoảng</Radio>
                        <Radio value="all">
                            Toàn bộ câu hỏi
                        </Radio>
                    </Radio.Group>
                </Form.Item>
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
                                    <Select placeholder="-- Chọn số câu hỏi --" size="large">
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
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập câu hỏi bắt đầu!' },
                                                { type: 'number', min: 1, message: 'Tối thiểu 1' },
                                            ]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Câu hỏi kết thúc tại"
                                            name="rangeEnd"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập câu hỏi kết thúc!' },
                                                { type: 'number', max: 1000, message: 'Tối đa 1000' },
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
            {/* <RecentResults /> */}
        </div >
    );
}
