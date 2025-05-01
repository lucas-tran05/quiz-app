import { shuffleArray } from './shuffle';

export async function loadQuestionsFromSubject(subject, questionCount) {
    const module = await import(`../data/${subject}.json`);
    const data = module.default;
    const shuffled = shuffleArray(data);
    return shuffled.slice(0, parseInt(questionCount));
}
