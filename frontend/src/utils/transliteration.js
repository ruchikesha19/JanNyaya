// ==========================================
// JanNyaya — Transliteration & Keypad Utility
// ==========================================

export const KEYPAD_CHARACTERS = {
    Hindi: {
        vowels: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'],
        consonants: [
            'क', 'ख', 'ग', 'घ', 'ङ',
            'च', 'छ', 'ज', 'झ', 'ञ',
            'ट', 'ठ', 'ड', 'ढ', 'ण',
            'त', 'थ', 'द', 'ध', 'न',
            'प', 'फ', 'ब', 'भ', 'म',
            'य', 'र', 'ल', 'व', 'श',
            'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'
        ],
        matras: ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', '्', 'ः']
    },
    Tamil: {
        vowels: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'],
        consonants: [
            'க', 'ங', 'ச', 'ஞ', 'ட', 'ண',
            'த', 'ந', 'ப', 'ம', 'ய', 'ர',
            'ல', 'வ', 'ழ', 'ள', 'ற', 'ன',
            'ஜ', 'ஷ', 'ஸ', 'ஹ'
        ],
        matras: ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்']
    },
    Telugu: {
        vowels: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'],
        consonants: [
            'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
            'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
            'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
            'త', 'థ', 'ద', 'ధ', 'న',
            'ప', 'ఫ', 'బ', 'భ', 'మ',
            'య', 'ర', 'ల', 'వ', 'శ',
            'ష', 'స', 'హ', 'ళ', 'క్ష'
        ],
        matras: ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', '్', 'ః']
    }
};

// Simplified transliteration mappings for Hindi (Devanagari)
const HINDI_TRANSLIT_RULES = [
    // Longest matches first
    { en: 'chh', native: 'छ' },
    { en: 'gya', native: 'ज्ञ' },
    { en: 'ksh', native: 'क्ष' },
    { en: 'kh', native: 'ख' },
    { en: 'gh', native: 'घ' },
    { en: 'ch', native: 'च' },
    { en: 'jh', native: 'झ' },
    { en: 'th', native: 'थ' },
    { en: 'dh', native: 'ध' },
    { en: 'ph', native: 'फ' },
    { en: 'bh', native: 'भ' },
    { en: 'sh', native: 'श' },
    { en: 'shh', native: 'ष' },
    { en: 'gy', native: 'ज्ञ' },
    { en: 'tr', native: 'त्र' },
    { en: 'aa', native: 'आ' },
    { en: 'ee', native: 'ई' },
    { en: 'oo', native: 'ऊ' },
    { en: 'ai', native: 'ऐ' },
    { en: 'au', native: 'औ' },
    { en: 'am', native: 'अं' },
    { en: 'ah', native: 'अः' },
    { en: 'k', native: 'क' },
    { en: 'g', native: 'ग' },
    { en: 'j', native: 'ज' },
    { en: 't', native: 'त' },
    { en: 'd', native: 'द' },
    { en: 'n', native: 'न' },
    { en: 'p', native: 'प' },
    { en: 'b', native: 'ब' },
    { en: 'm', native: 'म' },
    { en: 'y', native: 'य' },
    { en: 'r', native: 'र' },
    { en: 'l', native: 'ल' },
    { en: 'v', native: 'व' },
    { en: 'w', native: 'व' },
    { en: 's', native: 'स' },
    { en: 'h', native: 'ह' },
    { en: 'a', native: 'अ' },
    { en: 'i', native: 'इ' },
    { en: 'u', native: 'उ' },
    { en: 'e', native: 'ए' },
    { en: 'o', native: 'ओ' },
    { en: 'f', native: 'फ़' },
    { en: 'z', native: 'ज़' }
];

// Tamil transliteration rules
const TAMIL_TRANSLIT_RULES = [
    { en: 'nj', native: 'ஞ' },
    { en: 'ng', native: 'ங' },
    { en: 'zh', native: 'ழ' },
    { en: 'sh', native: 'ஷ' },
    { en: 'aa', native: 'ஆ' },
    { en: 'ee', native: 'ஈ' },
    { en: 'oo', native: 'ஊ' },
    { en: 'ai', native: 'ஐ' },
    { en: 'au', native: 'ஔ' },
    { en: 'nn', native: 'ண' },
    { en: 'nh', native: 'ன' },
    { en: 'rr', native: 'ற' },
    { en: 'll', native: 'ள' },
    { en: 'k', native: 'க' },
    { en: 'c', native: 'ச' },
    { en: 't', native: 'ட' },
    { en: 'N', native: 'ண' },
    { en: 'n', native: 'ந' },
    { en: 'p', native: 'ப' },
    { en: 'm', native: 'ம' },
    { en: 'y', native: 'ய' },
    { en: 'r', native: 'ர' },
    { en: 'l', native: 'ல' },
    { en: 'v', native: 'வ' },
    { en: 'L', native: 'ள' },
    { en: 'R', native: 'ற' },
    { en: 'h', native: 'ஹ' },
    { en: 's', native: 'ஸ' },
    { en: 'j', native: 'ஜ' },
    { en: 'a', native: 'அ' },
    { en: 'i', native: 'இ' },
    { en: 'u', native: 'உ' },
    { en: 'e', native: 'எ' },
    { en: 'o', native: 'ஒ' }
];

// Telugu transliteration rules
const TELUGU_TRANSLIT_RULES = [
    { en: 'ksh', native: 'క్ష' },
    { en: 'kh', native: 'ఖ' },
    { en: 'gh', native: 'ఘ' },
    { en: 'ch', native: 'చ' },
    { en: 'chh', native: 'ఛ' },
    { en: 'jh', native: 'ఝ' },
    { en: 'th', native: 'థ' },
    { en: 'dh', native: 'ధ' },
    { en: 'ph', native: 'ఫ' },
    { en: 'bh', native: 'భ' },
    { en: 'sh', native: 'శ' },
    { en: 'aa', native: 'ఆ' },
    { en: 'ee', native: 'ఈ' },
    { en: 'oo', native: 'ఊ' },
    { en: 'ai', native: 'ఐ' },
    { en: 'au', native: 'ఔ' },
    { en: 'am', native: 'అం' },
    { en: 'ah', native: 'అః' },
    { en: 'k', native: 'క' },
    { en: 'g', native: 'గ' },
    { en: 'j', native: 'జ' },
    { en: 't', native: 'త' },
    { en: 'd', native: 'ద' },
    { en: 'n', native: 'న' },
    { en: 'p', native: 'ప' },
    { en: 'b', native: 'బ' },
    { en: 'm', native: 'మ' },
    { en: 'y', native: 'య' },
    { en: 'r', native: 'ర' },
    { en: 'l', native: 'ల' },
    { en: 'v', native: 'వ' },
    { en: 'w', native: 'వ' },
    { en: 's', native: 'స' },
    { en: 'h', native: 'హ' },
    { en: 'a', native: 'అ' },
    { en: 'i', native: 'ఇ' },
    { en: 'u', native: 'ఉ' },
    { en: 'e', native: 'ఎ' },
    { en: 'o', native: 'ఒ' }
];

// Simple vowel matra application helpers
const HINDI_MATRAS = {
    'अ': '', 'आ': 'ा', 'इ': 'ि', 'ई': 'ी', 'उ': 'ु', 'ऊ': 'ू',
    'ए': 'े', 'ऐ': 'ै', 'ओ': 'ो', 'औ': 'ौ', 'अं': 'ं', 'अः': 'ः'
};

const TAMIL_MATRAS = {
    'அ': '', 'ஆ': 'ா', 'இ': 'ி', 'ஈ': 'ீ', 'உ': 'ு', 'ஊ': 'ூ',
    'எ': 'ெ', 'ஏ': 'ே', 'ஐ': 'ை', 'ஒ': 'ொ', 'ஓ': 'ோ', 'ஔ': 'ௌ'
};

const TELUGU_MATRAS = {
    'అ': '', 'ఆ': 'ా', 'ఇ': 'ి', 'ఈ': 'ీ', 'ఉ': 'ు', 'ఊ': 'ూ',
    'ఎ': 'ె', 'ఏ': 'ే', 'ఐ': 'ై', 'ఒ': 'ొ', 'ఓ': 'ో', 'ఔ': 'ౌ', 'అం': 'ం', 'అః': 'ః'
};

/**
 * Phonetic transliteration engine (English syllables -> Indic Script)
 * Implements a simple greedy parsing algorithm with orthographic heuristics.
 */
export function transliterate(text, language) {
    if (!text || !language) return text;
    
    let rules = HINDI_TRANSLIT_RULES;
    let matraMap = HINDI_MATRAS;
    let halant = '्';

    if (language === 'Tamil') {
        rules = TAMIL_TRANSLIT_RULES;
        matraMap = TAMIL_MATRAS;
        halant = '்';
    } else if (language === 'Telugu') {
        rules = TELUGU_TRANSLIT_RULES;
        matraMap = TELUGU_MATRAS;
        halant = '్';
    } else if (language !== 'Hindi') {
        return text; // Default fallback for unsupported languages
    }

    let result = '';
    let i = 0;
    
    // Track if the last character parsed was a consonant, for vowel-matra bonding
    let lastConsonant = '';

    while (i < text.length) {
        // Skip non-alphabetic characters
        if (!/[a-zA-Z]/.test(text[i])) {
            if (lastConsonant) {
                // For Tamil/Telugu, seal terminal consonants with a halant
                if (language === 'Tamil' || language === 'Telugu') {
                    result += halant;
                }
                lastConsonant = '';
            }
            result += text[i];
            i++;
            continue;
        }

        // Find the longest matching rule prefix
        let match = null;
        for (const rule of rules) {
            const prefix = text.substring(i, i + rule.en.length).toLowerCase();
            if (prefix === rule.en) {
                match = rule;
                break;
            }
        }

        if (match) {
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(match.en[0]);

            if (isVowel) {
                if (lastConsonant) {
                    let matra = matraMap[match.native] !== undefined ? matraMap[match.native] : match.native;
                    
                    // HEURISTIC: In Hindi, if 'a' is at the end of the word (either end of string or followed by non-alpha),
                    // map it to the 'aa' matra (ा) because terminal 'a' in Hinglish is almost always the long 'aa' sound.
                    if (language === 'Hindi' && match.en === 'a') {
                        const isTerminal = (i + match.en.length >= text.length) || !/[a-zA-Z]/.test(text[i + match.en.length]);
                        if (isTerminal) {
                            matra = 'ा';
                        }
                    }
                    
                    result += matra;
                    lastConsonant = '';
                } else {
                    result += match.native;
                }
            } else {
                if (lastConsonant) {
                    result += halant;
                }
                result += match.native;
                lastConsonant = match.native;
            }
            i += match.en.length;
        } else {
            if (lastConsonant) {
                if (language === 'Tamil' || language === 'Telugu') {
                    result += halant;
                }
                lastConsonant = '';
            }
            result += text[i];
            i++;
        }
    }

    // Seal trailing consonant at the end of the entire string
    if (lastConsonant) {
        if (language === 'Tamil' || language === 'Telugu') {
            result += halant;
        }
    }

    return result;
}
