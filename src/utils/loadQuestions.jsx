export async function loadQuestionsFromSubject(subject, questionCount) {
    const module = await import(`../data/${subject}.json`);
    const data = module.default;

    if (!Array.isArray(data)) {
        throw new Error(`Dữ liệu không hợp lệ cho subject "${subject}"`);
    }

    return data;
}
