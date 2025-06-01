import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(window.scrollY > 300);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button
            type="button"
            class={`btn btn-warning rounded-circle position-fixed bottom-0 end-0 m-4 d-flex justify-content-center align-items-center ${isVisible ? 'd-block' : 'd-none'}`}
            style={{ width: '50px', height: '50px' }}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <i class="bi bi-arrow-up"></i>
        </button>

    );
};

export default BackToTop;
