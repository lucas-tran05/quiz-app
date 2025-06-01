export default function Alert({ message, type = 'info', index = 'left' }) {
    return (
    <div className={`alert alert-${type}`} role="alert" style={{ textAlign: index }}>
        {message}
    </div>
    );
}