async function fetchQuestions({ id, mode = "range", count, start, end }) {
    const baseUrl = "https://script.google.com/macros/s/AKfycbxMIMrl0OFlMfAQ95j3tDmOKY2b17HN8PIRSTBZ4HIb8UjPhXXQPZLPKRynUTSah1k_/exec";
    const params = new URLSearchParams({ id, mode });

    if (mode === "random" && count) {
        params.append("count", count);
    }

    if (mode === "range" && start !== undefined && end !== undefined) {
        params.append("start", start);
        params.append("end", end);
    }

    const url = `${baseUrl}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data; // Trả về mảng các câu hỏi
    } catch (err) {
        console.error("Lỗi khi fetch câu hỏi:", err);
        throw err;
    }
}

export default fetchQuestions;
