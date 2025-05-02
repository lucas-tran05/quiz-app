import { shuffleArray } from './shuffle';

export function selectRandomQuestions(subject, count) {
    const shuffled = shuffleArray(subject);
    return shuffled.slice(0, parseInt(count)); 
}
