import * as XLSX from 'xlsx';

export async function parseExcelToQuestions(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }); // giữ ô trống là ''

    return rows.map((row) => ({
        question: String(row['Question'] || '').trim(),
        a: String(row['a'] || '').trim(),
        b: String(row['b'] || '').trim(),
        c: String(row['c'] || '').trim(),
        d: String(row['d'] || '').trim(),
        ans: (row['Ans'] || '').toString().trim().toLowerCase()  // hoặc giữ là '' nếu không có
    }));
}
