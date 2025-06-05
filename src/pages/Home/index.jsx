import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'
import { Form, Input, Button, Select, Typography, message } from 'antd'

const { Title, Paragraph } = Typography
const { Option } = Select

export default function Home() {
    const [form] = Form.useForm()

    useEffect(() => {
        const now = new Date();

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);

                if (!parsed.expiry || now.getTime() > parsed.expiry) {
                    localStorage.removeItem('user');
                    console.log('User data hết hạn hoặc không hợp lệ, đã xoá.');
                    return;
                }

                form.setFieldsValue(parsed.value);
            } catch (err) {
                console.error('Lỗi khi đọc localStorage:', err);
            }
        }
    }, [form]);



    const handleSubmit = (values) => {
        const { email, name, major } = values;

        if (!email || !name || !major) {
            message.warning('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const ttl = 3 * 24 * 60 * 60 * 1000;

        const now = new Date();

        const userWithExpiry = {
            value: { email, name, major },
            expiry: now.getTime() + ttl,
        };

        localStorage.setItem('user', JSON.stringify(userWithExpiry));
        route('/config');
    };


    return (
        <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
            <Typography style={{ textAlign: 'center' }}>
                <Title level={2}>Chào mừng đến với trang thi!</Title>
                <Paragraph>Hãy chuẩn bị cho bài kiểm tra của bạn.</Paragraph>
            </Typography>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Hãy nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                >
                    <Input placeholder="name@example.com" size="large" />
                </Form.Item>

                <Form.Item
                    label="Họ và tên"
                    name="name"
                    rules={[{ required: true, message: 'Hãy nhập họ tên!' },
                    { pattern: /^[\p{L} ]+$/u, message: 'Họ tên chỉ chứa chữ cái và khoảng trắng!' }
                    ]}

                >
                    <Input placeholder="Nguyễn Văn A" size='large' />
                </Form.Item>

                <Form.Item

                    label="Ngành học"
                    name="major"
                    rules={[{ required: true, message: 'Hãy chọn ngành học!' }]}
                >
                    <Select placeholder="-- Chọn ngành học --" size='large'>
                        <Option value="Kĩ thuật">Kĩ thuật</Option>
                        <Option value="Kinh tế">Kinh tế</Option>
                        <Option value="Đa phương tiện">Đa phương tiện</Option>
                        <Option value="Báo chí">Báo chí</Option>
                    </Select>
                </Form.Item>

                <Form.Item style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit">
                        Bắt đầu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
