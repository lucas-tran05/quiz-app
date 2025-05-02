export async function loadQuestionsFromSubject(subject) {
    const module = await import(`../config/data/${subject}.json`);
    const data = module.default;

    if (!Array.isArray(data)) {
        throw new Error(`Dữ liệu không hợp lệ cho subject "${subject}"`);
    }

    return data;
}
