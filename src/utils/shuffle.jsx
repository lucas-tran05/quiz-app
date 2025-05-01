function shuffleArray(array) {
    const result = [...array]; // Tạo bản sao để không làm thay đổi mảng gốc
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Vị trí ngẫu nhiên từ 0 đến i
        [result[i], result[j]] = [result[j], result[i]]; // Hoán đổi
    }
    return result;
}

export { shuffleArray };