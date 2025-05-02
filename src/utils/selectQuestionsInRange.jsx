function selectQuestionsInRange(array, a, b) {
    const start = Math.max(0, a); 
    const end = Math.min(array.length, b);
    return array.slice(start, end); 
}

export {selectQuestionsInRange };
