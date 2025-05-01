function selectQuestionsInRange(array, a, b) {
    const start = Math.max(0, a - 1); 
    const end = Math.min(array.length, b);
    return array.slice(start, end); 
}

export {selectQuestionsInRange };
