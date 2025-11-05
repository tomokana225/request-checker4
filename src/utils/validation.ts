
const NG_WORDS = [
  // Japanese profanity and insults
  '死ね', '殺す', 'しね', 'ころす',
  'キチガイ', '基地外', '気違い', 'きちがい',
  'ガイジ', 'がいじ',
  'ばか', 'バカ', '馬鹿',
  'アホ', 'あほ',
  'くそ', 'クソ', '糞',
  'カス', 'かす',
  'ごみ', 'ゴミ',
  '雑魚', 'ざこ',
  'ブス', 'ぶす',
  'デブ', 'でぶ',
  'ちんこ', 'まんこ', 'うんこ', 'セックス', 'sex',
  'レイプ', '売春', '援交',

  // Common English profanity
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'dick',
];

// Normalize text for checking: lowercase, half-width, remove spaces
const normalizeForValidation = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // full-width to half-width
        .replace(/[\s\u3000]/g, ''); // remove spaces and full-width space
};

export const containsNGWord = (text: string): boolean => {
    if (!text) return false;
    const normalizedText = normalizeForValidation(text);
    return NG_WORDS.some(ngWord => normalizedText.includes(ngWord));
};
