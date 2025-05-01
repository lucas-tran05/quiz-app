export function startTimer(setTimeLeft, handleSubmit) {
    return setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                handleSubmit();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
}
