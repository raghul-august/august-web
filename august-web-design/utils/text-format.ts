export function toUnicodeBold(str: string): string {
    return Array.from(str).map((ch) => {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65)); // A-Z
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97)); // a-z
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + (code - 48)); // 0-9
        return ch;
    }).join('');
}

export function toUnicodeItalic(str: string): string {
    return Array.from(str).map((ch) => {
        const code = ch.codePointAt(0)!;
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D434 + (code - 65)); // A-Z
        if (code >= 97 && code <= 122) {
            if (ch === 'h') return String.fromCodePoint(0x210E); // special case
            return String.fromCodePoint(0x1D44E + (code - 97)); // a-z
        }
        return ch;
    }).join('');
}
