import { useEffect, useState } from 'preact/hooks';
import { List, Card, Typography, Tag } from 'antd';

const { Title, Text } = Typography;

export default function RecentResults() {
    const [results, setResults] = useState([]);

    useEffect(() => {
        const raw = localStorage.getItem('result');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                const sorted = parsed.sort((a, b) => b.endTime - a.endTime).slice(0, 5);
                setResults(sorted);
            } catch (err) {
                console.error('❌ Lỗi khi parse localStorage:', err);
            }
        }
    }, []);

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}p ${sec}s`;
    };

    if (results.length === 0) {
        return <Text type="secondary">🫥 Không có kết quả nào gần đây...</Text>;
    }

    return (
        <div style={{ padding: '16px' }}>
            <Title level={3}>📊 5 kết quả gần nhất</Title>

            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={results}
                renderItem={(r) => (
                    <List.Item>
                        <Card title={r.fullname} bordered={true}>
                            <p><Text strong>Môn:</Text> {r.subject}</p>
                            <p>
                                <Text strong>Chế độ:</Text>
                                <Tag color={r.mode === 'Random' ? 'geekblue' : 'green'}>{r.mode}</Tag>
                                {r.range && <Tag>{r.range}</Tag>}
                            </p>
                            <p><Text strong>Kết quả:</Text> {r.correct} / {r.total}</p>
                            <p><Text strong>Thời gian làm bài:</Text> {formatTime(r.endTime - r.startTime)}</p>
                            <p>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    🕓 {new Date(r.endTime).toLocaleString()}
                                </Text>
                            </p>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}
