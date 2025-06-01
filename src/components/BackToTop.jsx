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
            class={`btn btn-outline-success position-fixed bottom-0 end-0 m-4 ${isVisible ? 'd-block' : 'd-none'}`}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            🔝
        </button>
    );
};

export default BackToTop;
