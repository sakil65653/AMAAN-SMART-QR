/**
 * AMAAN CSC CENTER - MULTILINGUAL TYPING TOOL ENGINE
 * Google Input Tools style Transliteration (Odia, Hindi, English)
 * 100% Client-Side Private Processing + Fast Server Proxy & Unicode Escaped Offline Engine
 */

const TypingToolState = {
    currentLang: 'odia', // 'odia', 'hindi', 'english'
    fontSize: 18,
    activeToken: '',
    tokenStart: 0,
    tokenEnd: 0,
    suggestions: [],
    selectedIndex: 0,
    history: [],
    historyIndex: -1,
    apiCache: {},
    debounceTimer: null
};

// ==========================================
// 1. UNICODE ESCAPED DICTIONARY & MAPPINGS
// ==========================================
const ODIA_COMMON_WORDS = {
    'namaskar': ['\u0B28\u0B2E\u0B38\u0B4D\u0B15\u0B3E\u0B30', '\u0B28\u0B2E\u0B38\u0B4D\u0B15\u0B3E\u0B30\u0B4D', '\u0B28\u0B2E\u0B38\u0B4D\u0B15\u0B3E\u0B30\u0B3E'],
    'namaste': ['\u0B28\u0B2E\u0B38\u0B4D\u0B24\u0B47', '\u0B28\u0B2E\u0B38\u0B4D\u0B24\u0B47!'],
    'dhanyabad': ['\u0B27\u0B28\u0B4D\u0B5F\u0B2C\u0B3E\u0B26', '\u0B27\u0B28\u0B4D\u0B5F\u0B2C\u0B3E\u0B26\u0B4D', '\u0B27\u0B28\u0B4D\u0B5F\u0B2C\u0B3E\u0B26\u0B3E'],
    'dhanyabada': ['\u0B27\u0B28\u0B4D\u0B5F\u0B2C\u0B3E\u0B26', '\u0B27\u0B28\u0B4D\u0B5F\u0B2C\u0B3E\u0B26\u0B3E'],
    'amaan': ['\u0B05\u0B2E\u0B3E\u0B28', '\u0B06\u0B2E\u0B3E\u0B28'],
    'aman': ['\u0B05\u0B2E\u0B28', '\u0B05\u0B2E\u0B3E\u0B28'],
    'csc': ['\u0B38\u0B3F\u0B0F\u0B38\u0B38\u0B3F', '\u0B38\u0B3F.\u0B0F\u0B38.\u0B38\u0B3F.'],
    'pipili': ['\u0B2A\u0B3F\u0B2A\u0B3F\u0B32\u0B3F', '\u0B2A\u0B3F\u0B2A\u0B3F\u0B32\u0B40'],
    'puri': ['\u0B2A\u0B41\u0B30\u0B40', '\u0B2A\u0B41\u0B30\u0B3F'],
    'odisha': ['\u0B13\u0B21\u0B3C\u0B3F\u0B36\u0B3E', '\u0B13\u0B21\u0B3F\u0B36\u0B3E', '\u0B13\u0B21\u0B3C\u0B3F\u0B36\u0B3E\u0B30'],
    'orissa': ['\u0B13\u0B21\u0B3C\u0B3F\u0B36\u0B3E', '\u0B13\u0B21\u0B3F\u0B36\u0B3E'],
    'odia': ['\u0B13\u0B21\u0B3C\u0B3F\u0B06', '\u0B13\u0B21\u0B3F\u0B06'],
    'bharat': ['\u0B2D\u0B3E\u0B30\u0B24', '\u0B2D\u0B3E\u0B30\u0B24\u0B30', '\u0B2D\u0B3E\u0B30\u0B24\u0B40\u0B5F'],
    'sarkar': ['\u0B38\u0B30\u0B15\u0B3E\u0B30', '\u0B38\u0B30\u0B15\u0B3E\u0B30\u0B40'],
    'seva': ['\u0B38\u0B47\u0B2C\u0B3E', '\u0B38\u0B47\u0B2C\u0B3E\u0B15\u0B47\u0B28\u0B4D\u0B26\u0B4D\u0B30'],
    'kendra': ['\u0B15\u0B47\u0B28\u0B4D\u0B26\u0B4D\u0B30', '\u0B15\u0B47\u0B28\u0B4D\u0B26\u0B4D\u0B30\u0B40\u0B5F'],
    'subhadra': ['\u0B38\u0B41\u0B2D\u0B26\u0B4D\u0B30\u0B3E', '\u0B38\u0B41\u0B2D\u0B26\u0B4D\u0B30\u0B3E \u0B2F\u0B4B\u0B1C\u0B28\u0B3E'],
    'yojana': ['\u0B2F\u0B4B\u0B1C\u0B28\u0B3E', '\u0B2F\u0B4B\u0B1C\u0B28\u0B3E\u0B30'],
    'aadhar': ['\u0B06\u0B27\u0B3E\u0B30', '\u0B06\u0B27\u0B3E\u0B30 \u0B15\u0B3E\u0B30\u0B4D\u0B21'],
    'aadhaar': ['\u0B06\u0B27\u0B3E\u0B30', '\u0B06\u0B27\u0B3E\u0B30 \u0B15\u0B3E\u0B30\u0B4D\u0B21'],
    'pan': ['\u0B2A\u0B3E\u0B28', '\u0B2A\u0B3E\u0B28\u0B4D \u0B15\u0B3E\u0B30\u0B4D\u0B21'],
    'ration': ['\u0B30\u0B3E\u0B38\u0B28', '\u0B30\u0B3E\u0B38\u0B28\u0B4D \u0B15\u0B3E\u0B30\u0B4D\u0B21'],
    'kisan': ['\u0B15\u0B3F\u0B37\u0B3E\u0B28', '\u0B15\u0B43\u0B37\u0B15'],
    'kalyan': ['\u0B15\u0B32\u0B4D\u0B5F\u0B3E\u0B23'],
    'sakil': ['\u0B38\u0B3E\u0B15\u0B3F\u0B32', '\u0B36\u0B3E\u0B15\u0B3F\u0B32'],
    'alam': ['\u0B06\u0B32\u0B2E', '\u0B06\u0B32\u0B3E\u0B2E']
};

const HINDI_COMMON_WORDS = {
    'namaskar': ['\u0928\u092E\u0938\u094D\u0915\u093E\u0930', '\u0928\u092E\u0938\u094D\u0915\u093E\u0930\u093E'],
    'namaste': ['\u0928\u092E\u0938\u094D\u0924\u0947', '\u0928\u092E\u0938\u094D\u0924\u0947!'],
    'dhanyawad': ['\u0927\u0928\u094D\u092F\u0935\u093E\u0926', '\u0927\u0928\u094D\u092F\u0935\u093E\u0926!'],
    'dhanyabad': ['\u0927\u0928\u094D\u092F\u0935\u093E\u0926', '\u0927\u0928\u094D\u092F\u092C\u093E\u0926'],
    'shukriya': ['\u0936\u0941\u0915\u094D\u0930\u093F\u092F\u093E', '\u0936\u0941\u0915\u094D\u0930\u093F\u092F\u093E!'],
    'amaan': ['\u0905\u092E\u093E\u0928', '\u0906\u092E\u093E\u0928'],
    'aman': ['\u0905\u092E\u0928', '\u0905\u092E\u093E\u0928'],
    'csc': ['\u0938\u0940\u090F\u0938\u0938\u0940', '\u0938\u0940.\u090F\u0938.\u0938\u0940.'],
    'pipili': ['\u092A\u093F\u092A\u093F\u0932\u0940', '\u092A\u093F\u092A\u093F\u0932\u093F'],
    'puri': ['\u092A\u0941\u0930\u0940', '\u092A\u0942\u0930\u0940'],
    'bharat': ['\u092D\u093E\u0930\u0924', '\u092D\u093E\u0930\u0924\u0940\u092F'],
    'sarkar': ['\u0938\u0930\u0915\u093E\u0930', '\u0938\u0930\u0915\u093E\u0930\u0940'],
    'seva': ['\u0938\u0947\u0935\u093E', '\u0938\u0947\u0935\u093E\u0915\u0947\u0902\u0926\u094D\u0930'],
    'kendra': ['\u0915\u0947\u0902\u0926\u094D\u0930', '\u0915\u0947\u0928\u094D\u0926\u094D\u0930'],
    'hindi': ['\u0939\u093F\u0928\u094D\u0926\u0940', '\u0939\u093F\u0902\u0926\u0940'],
    'yojana': ['\u092F\u094B\u091C\u0928\u093E', '\u092F\u094B\u091C\u0928\u093E\u090F\u0902'],
    'aadhar': ['\u0906\u0927\u093E\u0930', '\u0906\u0927\u093E\u0930 \u0915\u093E\u0930\u094D\u0921'],
    'aadhaar': ['\u0906\u0927\u093E\u0930', '\u0906\u0927\u093E\u0930 \u0915\u093E\u0930\u094D\u0921'],
    'pan': ['\u092A\u0948\u0928', '\u092A\u0948\u0928 \u0915\u093E\u0930\u094D\u0921'],
    'ration': ['\u0930\u093E\u0936\u0928', '\u0930\u093E\u0936\u0928 \u0915\u093E\u0930\u094D\u0921'],
    'kisan': ['\u0915\u093F\u0938\u093E\u0928', '\u0915\u093F\u0938\u093E\u0928\u094B\u0902'],
    'kalyan': ['\u0915\u0932\u094D\u092F\u093E\u0923'],
    'shanti': ['\u0936\u093E\u0902\u0924\u093F', '\u0936\u093E\u0928\u094D\u0924\u093F'],
    'sakil': ['\u0938\u093E\u0915\u093F\u0932', '\u0936\u093E\u0915\u093F\u0932'],
    'alam': ['\u0906\u0932\u092E', '\u0906\u0932\u093E\u092E']
};

// Odia Unicode Elements
const ODIA_VOWELS = {
    'a': '\u0B05', 'aa': '\u0B06', 'i': '\u0B07', 'ee': '\u0B08', 'ii': '\u0B08',
    'u': '\u0B09', 'oo': '\u0B0A', 'uu': '\u0B0A', 'e': '\u0B0F', 'ai': '\u0B10',
    'o': '\u0B13', 'au': '\u0B14', 'am': '\u0B05\u0B02', 'ah': '\u0B05\u0B03'
};

const ODIA_MATRAS = {
    'aa': '\u0B3E', 'a': '', 'i': '\u0B3F', 'ee': '\u0B40', 'ii': '\u0B40',
    'u': '\u0B41', 'oo': '\u0B42', 'uu': '\u0B42', 'e': '\u0B47', 'ai': '\u0B48',
    'o': '\u0B4B', 'au': '\u0B4C', 'am': '\u0B02', 'an': '\u0B02', 'ah': '\u0B03'
};

const ODIA_CONSONANTS = {
    'k': '\u0B15', 'kh': '\u0B16', 'g': '\u0B17', 'gh': '\u0B18', 'ng': '\u0B19',
    'ch': '\u0B1A', 'chh': '\u0B1B', 'j': '\u0B1C', 'jh': '\u0B1D', 'ny': '\u0B1E',
    't': '\u0B24', 'th': '\u0B25', 'd': '\u0B26', 'dh': '\u0B27', 'n': '\u0B28',
    'T': '\u0B1F', 'Th': '\u0B20', 'D': '\u0B21', 'Dh': '\u0B22', 'N': '\u0B23',
    'p': '\u0B2A', 'ph': '\u0B2B', 'f': '\u0B2B', 'b': '\u0B2C', 'bh': '\u0B2D', 'm': '\u0B2E',
    'y': '\u0B5F', 'r': '\u0B30', 'l': '\u0B32', 'v': '\u0B2D', 'w': '\u0B71',
    'sh': '\u0B36', 'shh': '\u0B37', 's': '\u0B38', 'h': '\u0B39',
    'ksh': '\u0B15\u0B4D\u0B37', 'tr': '\u0B24\u0B4D\u0B30', 'gy': '\u0B1C\u0B4D\u0B1E', 'jny': '\u0B1C\u0B4D\u0B1E'
};

// Hindi Unicode Elements
const HINDI_VOWELS = {
    'a': '\u0905', 'aa': '\u0906', 'i': '\u0907', 'ee': '\u0908', 'ii': '\u0908',
    'u': '\u0909', 'oo': '\u090A', 'uu': '\u090A', 'e': '\u090F', 'ai': '\u0910',
    'o': '\u0913', 'au': '\u0914', 'am': '\u0905\u0902', 'ah': '\u0905\u0903'
};

const HINDI_MATRAS = {
    'aa': '\u093E', 'a': '', 'i': '\u093F', 'ee': '\u0940', 'ii': '\u0940',
    'u': '\u0941', 'oo': '\u0942', 'uu': '\u0942', 'e': '\u0947', 'ai': '\u0948',
    'o': '\u094B', 'au': '\u094C', 'am': '\u0902', 'an': '\u0902', 'ah': '\u0903'
};

const HINDI_CONSONANTS = {
    'k': '\u0915', 'kh': '\u0916', 'g': '\u0917', 'gh': '\u0918', 'ng': '\u0919',
    'ch': '\u091A', 'chh': '\u091B', 'j': '\u091C', 'jh': '\u091D', 'ny': '\u091E',
    't': '\u0924', 'th': '\u0925', 'd': '\u0926', 'dh': '\u0927', 'n': '\u0928',
    'T': '\u091F', 'Th': '\u0920', 'D': '\u0921', 'Dh': '\u0922', 'N': '\u0923',
    'p': '\u092A', 'ph': '\u092B', 'f': '\u092B', 'b': '\u092C', 'bh': '\u092D', 'm': '\u092E',
    'y': '\u092F', 'r': '\u0930', 'l': '\u0932', 'v': '\u0935', 'w': '\u0935',
    'sh': '\u0936', 'shh': '\u0937', 's': '\u0938', 'h': '\u0939',
    'ksh': '\u0915\u094D\u0937', 'tr': '\u0924\u094D\u0930', 'gy': '\u091C\u094D\u091E', 'jny': '\u091C\u094D\u091E'
};

/**
 * Robust Client-Side Offline Transliteration Engine
 * Uses Unicode code point sequences guaranteeing 100% font fidelity without encoding loss.
 */
function transliterateOffline(word, lang) {
    if (!word) return [];
    const w = word.toLowerCase();

    // Check Common Dictionary
    if (lang === 'odia' && ODIA_COMMON_WORDS[w]) {
        return [...ODIA_COMMON_WORDS[w], w];
    }
    if (lang === 'hindi' && HINDI_COMMON_WORDS[w]) {
        return [...HINDI_COMMON_WORDS[w], w];
    }

    const consonants = lang === 'odia' ? ODIA_CONSONANTS : HINDI_CONSONANTS;
    const vowels = lang === 'odia' ? ODIA_VOWELS : HINDI_VOWELS;
    const matras = lang === 'odia' ? ODIA_MATRAS : HINDI_MATRAS;
    const virama = lang === 'odia' ? '\u0B4D' : '\u094D';

    let result = '';
    let i = 0;
    const len = w.length;

    while (i < len) {
        // 3-letter clusters (ksh, chh, jny)
        if (i + 3 <= len && consonants[w.substring(i, i + 3)]) {
            const c = consonants[w.substring(i, i + 3)];
            i += 3;
            if (i < len && matras[w.substring(i, i + 2)]) {
                result += c + matras[w.substring(i, i + 2)];
                i += 2;
            } else if (i < len && matras[w[i]]) {
                result += c + matras[w[i]];
                i++;
            } else if (i < len && consonants[w[i]]) {
                result += c + virama;
            } else {
                result += c;
            }
            continue;
        }

        // 2-letter consonants (kh, gh, ch, jh, th, dh, ph, bh, sh, tr, gy)
        if (i + 2 <= len && consonants[w.substring(i, i + 2)]) {
            const c = consonants[w.substring(i, i + 2)];
            i += 2;
            if (i < len && matras[w.substring(i, i + 2)]) {
                result += c + matras[w.substring(i, i + 2)];
                i += 2;
            } else if (i < len && matras[w[i]]) {
                result += c + matras[w[i]];
                i++;
            } else if (i < len && consonants[w[i]]) {
                result += c + virama;
            } else {
                result += c;
            }
            continue;
        }

        // 1-letter consonant
        if (consonants[w[i]]) {
            const c = consonants[w[i]];
            i++;
            if (i < len && matras[w.substring(i, i + 2)]) {
                result += c + matras[w.substring(i, i + 2)];
                i += 2;
            } else if (i < len && matras[w[i]]) {
                result += c + matras[w[i]];
                i++;
            } else if (i < len && consonants[w[i]]) {
                result += c + virama;
            } else {
                result += c;
            }
            continue;
        }

        // Vowels
        if (i + 2 <= len && vowels[w.substring(i, i + 2)]) {
            result += vowels[w.substring(i, i + 2)];
            i += 2;
            continue;
        }
        if (vowels[w[i]]) {
            result += vowels[w[i]];
            i++;
            continue;
        }

        // Other characters/numbers
        result += w[i];
        i++;
    }

    const suggestions = [];
    if (result) suggestions.push(result);
    if (result.endsWith(virama)) {
        suggestions.push(result.slice(0, -1));
    }
    suggestions.push(w);

    return Array.from(new Set(suggestions));
}

// ==========================================
// 2. SERVER PROXY & GOOGLE INPUT API CLIENT
// ==========================================
async function fetchTransliterationSuggestions(word, lang) {
    if (!word || lang === 'english') return [word];
    const cacheKey = `${lang}:${word.toLowerCase()}`;

    if (TypingToolState.apiCache[cacheKey]) {
        return TypingToolState.apiCache[cacheKey];
    }

    // 1. Try Local Server Proxy (Zero CORS issue)
    try {
        const ctrl = new AbortController();
        const tId = setTimeout(() => ctrl.abort(), 800);
        const res = await fetch(`http://localhost:5050/api/transliterate?text=${encodeURIComponent(word)}&lang=${lang}`, { signal: ctrl.signal });
        clearTimeout(tId);

        if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                const list = [...data.suggestions];
                if (!list.includes(word)) list.push(word);
                TypingToolState.apiCache[cacheKey] = list;
                return list;
            }
        }
    } catch (e) {
        // Fallback to offline engine
    }

    // 2. Offline Phonetic Fallback
    const offlineList = transliterateOffline(word, lang);
    TypingToolState.apiCache[cacheKey] = offlineList;
    return offlineList;
}

// ==========================================
// 3. TYPING TOOL STUDIO UI GENERATOR
// ==========================================
function getTypingToolStudioHtml() {
    return `
<div class="space-y-4 text-slate-800">
  <!-- Top Language Selector & Mode Info -->
  <div class="bg-blue-900 text-white p-4 rounded-2xl border border-blue-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs uppercase font-black tracking-wider text-amber-400">Google Input Tools Transliteration</span>
        <span class="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Instant Script Engine</span>
      </div>
      <p class="text-xs text-blue-100 max-w-2xl">
        Type phonetically in English (e.g., <code class="bg-blue-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">namaskar</code> or <code class="bg-blue-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">bharat</code>) to get instant transliteration. Press Space, Enter, or 1-5 to select suggestions.
      </p>
    </div>

    <!-- Script Selector (English UI Only) -->
    <div class="flex items-center gap-1.5 bg-blue-950 p-1.5 rounded-xl border border-blue-800 shrink-0">
      <span class="text-xs font-bold text-slate-300 px-2">Typing Script:</span>
      <button type="button" onclick="setTypingLanguage('odia')" id="btnLangOdia" class="typing-lang-btn px-3 py-1.5 rounded-lg text-xs font-black transition bg-amber-400 text-slate-950 shadow">
        Odia (\u0B13\u0B21\u0B3C\u0B3F\u0B06)
      </button>
      <button type="button" onclick="setTypingLanguage('hindi')" id="btnLangHindi" class="typing-lang-btn px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-200 hover:text-white hover:bg-blue-800">
        Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)
      </button>
      <button type="button" onclick="setTypingLanguage('english')" id="btnLangEnglish" class="typing-lang-btn px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-200 hover:text-white hover:bg-blue-800">
        English
      </button>
    </div>
  </div>

  <!-- Editing Toolbar -->
  <div class="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
    <!-- Action Group 1: Clipboard -->
    <div class="flex items-center gap-1 flex-wrap">
      <button type="button" onclick="typingToolCopy()" title="Copy text to clipboard (Ctrl+C)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Copy</span>
      </button>
      <button type="button" onclick="typingToolCut()" title="Cut selected text (Ctrl+X)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Cut</span>
      </button>
      <button type="button" onclick="typingToolPaste()" title="Paste from clipboard (Ctrl+V)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Paste</span>
      </button>
    </div>

    <!-- Action Group 2: History -->
    <div class="flex items-center gap-1">
      <button type="button" onclick="typingToolUndo()" title="Undo (Ctrl+Z)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Undo</span>
      </button>
      <button type="button" onclick="typingToolRedo()" title="Redo (Ctrl+Y)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Redo</span>
      </button>
    </div>

    <!-- Action Group 3: Selection & Clear -->
    <div class="flex items-center gap-1">
      <button type="button" onclick="typingToolSelectAll()" title="Select All (Ctrl+A)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold border border-slate-300 transition flex items-center gap-1">
        <span>Select All</span>
      </button>
      <button type="button" onclick="typingToolClear()" title="Clear All Text" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition flex items-center gap-1">
        <span>Clear All</span>
      </button>
    </div>

    <!-- Font Size Selector -->
    <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
      <span>Font Size:</span>
      <select id="typingFontSizeSelect" onchange="changeTypingFontSize(this.value)" class="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600">
        <option value="16">Normal (16px)</option>
        <option value="18" selected>Medium (18px)</option>
        <option value="22">Large (22px)</option>
        <option value="26">Extra Large (26px)</option>
      </select>
    </div>
  </div>

  <!-- Suggestion Bar Container -->
  <div id="typingSuggestionBar" class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-3 shadow-md flex items-center gap-3 overflow-x-auto min-h-[52px]">
    <div class="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 border-r border-amber-300 pr-3">
      <span>Suggestions:</span>
    </div>
    <div id="typingSuggestionsList" class="flex items-center gap-2 flex-wrap flex-grow">
      <span class="text-xs text-slate-500 italic">Start typing phonetic letters (e.g. namaskar, dhanyabad, bharat)... Suggestions will appear here numbered 1 to 5.</span>
    </div>
  </div>

  <!-- Main Multilingual Typing Textarea -->
  <div class="relative">
    <textarea id="typingMainTextarea"
      placeholder="Type here in phonetic English (e.g. namaskar, dhanyabad, bharat)... Suggestions will appear automatically. Press Space, Enter, or 1-5 to select."
      class="w-full min-h-[220px] p-4 border-2 border-blue-400 focus:border-blue-600 rounded-2xl shadow-inner focus:outline-none leading-relaxed text-slate-900 bg-white font-sans transition"
      style="font-size: 18px; font-family: 'Kalinga', 'Nirmala UI', 'Mangal', 'Segoe UI', sans-serif;"></textarea>
  </div>

  <!-- Live Metric Counters Bar -->
  <div class="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-bold text-slate-700 gap-2">
    <div class="flex items-center gap-4 flex-wrap">
      <span>Characters: <strong id="typingCharCount" class="text-blue-700 font-mono font-black">0</strong></span>
      <span>Words: <strong id="typingWordCount" class="text-blue-700 font-mono font-black">0</strong></span>
      <span>Lines: <strong id="typingLineCount" class="text-blue-700 font-mono font-black">0</strong></span>
      <span>Active Script: <strong id="typingCurrentScriptBadge" class="text-amber-800 font-black uppercase">Odia (\u0B13\u0B21\u0B3C\u0B3F\u0B06)</strong></span>
    </div>
    <div class="text-[11px] text-slate-500 flex items-center gap-1 font-normal flex-wrap">
      <span>Keyboard navigation:</span>
      <kbd class="bg-white px-1.5 py-0.5 rounded border shadow-sm font-mono text-[10px] font-bold">1-5</kbd>
      <span>Select Candidate</span>
      <kbd class="bg-white px-1.5 py-0.5 rounded border shadow-sm font-mono text-[10px] font-bold">Space / Enter</kbd>
      <span>Accept Top</span>
      <kbd class="bg-white px-1.5 py-0.5 rounded border shadow-sm font-mono text-[10px] font-bold">Up / Down</kbd>
      <span>Navigate</span>
    </div>
  </div>

  <!-- Live Document Preview Card -->
  <div class="space-y-2 pt-2">
    <div class="flex justify-between items-center">
      <span class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <span>Live Document Preview (Official Document Format)</span>
      </span>
      <span class="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
        Live Rendered Output
      </span>
    </div>
    
    <div id="typingLivePreviewCard" class="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm min-h-[160px] text-slate-900 leading-relaxed font-sans relative">
      <div class="border-b border-slate-200 pb-2 mb-3 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase">
        <span>AMAAN CSC CENTER PIPILI â€¢ OFFICIAL TYPING TRANSCRIPT</span>
        <span id="typingPreviewDate"></span>
      </div>
      <div id="typingPreviewContent" class="text-base text-slate-800 whitespace-pre-wrap min-h-[80px]" style="font-family: 'Kalinga', 'Nirmala UI', 'Mangal', 'Segoe UI', sans-serif;">
        <span class="text-slate-400 italic">Document text preview will render here in real-time...</span>
      </div>
      <div class="border-t border-slate-100 pt-2 mt-4 text-[10px] text-slate-400 text-right">
        <span>Main Road, In Front of Devigali, Pipili, Puri, Odisha (PIN: 752104) â€¢ +91 9078765653</span>
      </div>
    </div>
  </div>

  <!-- Direct Download Actions Box -->
  <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm space-y-3">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h4 class="text-sm font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Download & Export Options</span>
        </h4>
        <p class="text-xs text-emerald-800">Export your typed text in official downloadable file formats with 100% Unicode accuracy.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      <button type="button" onclick="downloadTypingTxt()" class="bg-white hover:bg-emerald-50 text-emerald-900 font-bold py-3 px-4 rounded-xl text-xs border border-emerald-300 shadow transition flex items-center justify-center gap-2">
        <span>Download as TXT (.txt)</span>
      </button>
      <button type="button" onclick="downloadTypingDocx()" class="bg-white hover:bg-blue-50 text-blue-900 font-bold py-3 px-4 rounded-xl text-xs border border-blue-300 shadow transition flex items-center justify-center gap-2">
        <span>Download as Word (.docx)</span>
      </button>
      <button type="button" onclick="downloadTypingPdf()" class="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2">
        <span>Download as PDF (.pdf)</span>
      </button>
    </div>
  </div>
</div>
    `;
}

// ==========================================
// 4. STUDIO INITIALIZATION & EVENT LISTENERS
// ==========================================
function initTypingToolStudio() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;

    TypingToolState.suggestions = [];
    TypingToolState.selectedIndex = 0;
    TypingToolState.activeToken = '';

    const dateEl = document.getElementById('typingPreviewDate');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    textarea.removeEventListener('input', handleTypingInput);
    textarea.removeEventListener('keydown', handleTypingKeydown);
    textarea.addEventListener('input', handleTypingInput);
    textarea.addEventListener('keydown', handleTypingKeydown);

    updateTypingMetrics();
    renderSuggestionBar();
    saveTypingHistory();
}

function setTypingLanguage(lang) {
    TypingToolState.currentLang = lang;
    ['odia', 'hindi', 'english'].forEach(l => {
        const btn = document.getElementById(`btnLang${l.charAt(0).toUpperCase() + l.slice(1)}`);
        if (!btn) return;
        if (l === lang) {
            btn.className = 'typing-lang-btn px-3 py-1.5 rounded-lg text-xs font-black transition bg-amber-400 text-slate-950 shadow';
        } else {
            btn.className = 'typing-lang-btn px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-200 hover:text-white hover:bg-blue-800';
        }
    });

    const badge = document.getElementById('typingCurrentScriptBadge');
    if (badge) {
        if (lang === 'odia') badge.innerText = 'Odia (\u0B13\u0B21\u0B3C\u0B3F\u0B06)';
        else if (lang === 'hindi') badge.innerText = 'Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)';
        else badge.innerText = 'English (Direct)';
    }

    if (TypingToolState.activeToken) {
        processTokenSuggestions(TypingToolState.activeToken);
    } else {
        renderSuggestionBar();
    }
}

function changeTypingFontSize(size) {
    TypingToolState.fontSize = parseInt(size, 10) || 18;
    const textarea = document.getElementById('typingMainTextarea');
    if (textarea) textarea.style.fontSize = `${TypingToolState.fontSize}px`;
    const preview = document.getElementById('typingPreviewContent');
    if (preview) preview.style.fontSize = `${TypingToolState.fontSize}px`;
}

// ==========================================
// 5. INPUT & SUGGESTION CONTROLLER
// ==========================================
function handleTypingInput(e) {
    updateTypingMetrics();
    saveTypingHistory();

    if (TypingToolState.currentLang === 'english') {
        TypingToolState.suggestions = [];
        TypingToolState.activeToken = '';
        renderSuggestionBar();
        return;
    }

    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;

    const text = textarea.value;
    const pos = textarea.selectionStart;

    let start = pos - 1;
    while (start >= 0 && /[a-zA-Z0-9]/.test(text[start])) {
        start--;
    }
    start++;

    const token = text.substring(start, pos);

    if (token && /[a-zA-Z]/.test(token)) {
        TypingToolState.activeToken = token;
        TypingToolState.tokenStart = start;
        TypingToolState.tokenEnd = pos;
        processTokenSuggestions(token);
    } else {
        TypingToolState.activeToken = '';
        TypingToolState.suggestions = [];
        renderSuggestionBar();
    }
}

function processTokenSuggestions(token) {
    // Immediate offline suggestions first
    const offlineSugg = transliterateOffline(token, TypingToolState.currentLang);
    TypingToolState.suggestions = offlineSugg;
    TypingToolState.selectedIndex = 0;
    renderSuggestionBar();

    // Query proxy with short debounce
    if (TypingToolState.debounceTimer) clearTimeout(TypingToolState.debounceTimer);
    TypingToolState.debounceTimer = setTimeout(async () => {
        try {
            const apiSugg = await fetchTransliterationSuggestions(token, TypingToolState.currentLang);
            if (apiSugg && apiSugg.length > 0 && TypingToolState.activeToken === token) {
                const merged = Array.from(new Set([...apiSugg, ...offlineSugg]));
                TypingToolState.suggestions = merged.slice(0, 5);
                renderSuggestionBar();
            }
        } catch (err) {
            // Keep offline
        }
    }, 120);
}

function renderSuggestionBar() {
    const list = document.getElementById('typingSuggestionsList');
    if (!list) return;

    if (!TypingToolState.activeToken || TypingToolState.suggestions.length === 0) {
        list.innerHTML = `<span class="text-xs text-slate-500 italic">Start typing phonetic letters (e.g. namaskar, dhanyabad, bharat)... Suggestions will appear here numbered 1 to 5.</span>`;
        return;
    }

    let html = '';
    TypingToolState.suggestions.forEach((sug, idx) => {
        const isSelected = idx === TypingToolState.selectedIndex;
        const selClass = isSelected
            ? 'bg-blue-700 text-white shadow-md border-blue-800 scale-105'
            : 'bg-white text-slate-900 border-amber-300 hover:bg-amber-100';

        html += `
        <button type="button" onclick="selectSuggestionIndex(${idx})" class="px-3 py-1.5 rounded-xl text-sm font-bold border transition flex items-center gap-1.5 cursor-pointer ${selClass}">
          <span class="w-4 h-4 rounded-full bg-slate-900/20 flex items-center justify-center text-[10px] font-mono font-black">${idx + 1}</span>
          <span>${sug}</span>
        </button>
        `;
    });

    list.innerHTML = html;
}

function handleTypingKeydown(e) {
    if (TypingToolState.suggestions.length === 0 || !TypingToolState.activeToken) {
        return;
    }

    // Number keys 1-5 selection
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < TypingToolState.suggestions.length) {
            e.preventDefault();
            selectSuggestionIndex(idx, ' ');
            return;
        }
    }

    // Space or Enter accepts active suggestion
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const trailing = e.key === 'Enter' ? '\n' : ' ';
        selectSuggestionIndex(TypingToolState.selectedIndex, trailing);
        return;
    }

    // Arrow keys
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        TypingToolState.selectedIndex = (TypingToolState.selectedIndex + 1) % TypingToolState.suggestions.length;
        renderSuggestionBar();
        return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        TypingToolState.selectedIndex = (TypingToolState.selectedIndex - 1 + TypingToolState.suggestions.length) % TypingToolState.suggestions.length;
        renderSuggestionBar();
        return;
    }

    // Escape closes suggestions
    if (e.key === 'Escape') {
        e.preventDefault();
        TypingToolState.suggestions = [];
        TypingToolState.activeToken = '';
        renderSuggestionBar();
        return;
    }
}

function selectSuggestionIndex(idx, trailingChar = ' ') {
    const selectedText = TypingToolState.suggestions[idx];
    if (!selectedText) return;

    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;

    const full = textarea.value;
    const before = full.substring(0, TypingToolState.tokenStart);
    const after = full.substring(TypingToolState.tokenEnd);

    textarea.value = before + selectedText + trailingChar + after;

    const newPos = TypingToolState.tokenStart + selectedText.length + trailingChar.length;
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;

    TypingToolState.activeToken = '';
    TypingToolState.suggestions = [];
    renderSuggestionBar();
    updateTypingMetrics();
    saveTypingHistory();

    textarea.focus();
}

function updateTypingMetrics() {
    const textarea = document.getElementById('typingMainTextarea');
    const text = textarea ? textarea.value : '';

    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;

    const cEl = document.getElementById('typingCharCount');
    const wEl = document.getElementById('typingWordCount');
    const lEl = document.getElementById('typingLineCount');

    if (cEl) cEl.innerText = charCount;
    if (wEl) wEl.innerText = wordCount;
    if (lEl) lEl.innerText = lineCount;

    const previewEl = document.getElementById('typingPreviewContent');
    if (previewEl) {
        if (text.trim()) {
            previewEl.innerText = text;
            previewEl.classList.remove('text-slate-400', 'italic');
            previewEl.classList.add('text-slate-800');
        } else {
            previewEl.innerHTML = `<span class="text-slate-400 italic">Document text preview will render here in real-time...</span>`;
        }
    }
}

// ==========================================
// 6. EDITING TOOLBAR ACTIONS
// ==========================================
function typingToolCopy() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;
    const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) || textarea.value;
    if (!selected) {
        alert('No text to copy. Please write something first.');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(selected).then(() => {
            showTypingToast('Text copied to clipboard successfully!');
        }).catch(() => {
            fallbackCopy(selected);
        });
    } else {
        fallbackCopy(selected);
    }
}

function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showTypingToast('Text copied to clipboard!');
}

function typingToolCut() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
        alert('Please select the text you want to cut.');
        return;
    }
    const val = textarea.value;
    const cutText = val.substring(start, end);
    typingToolCopy();
    textarea.value = val.substring(0, start) + val.substring(end);
    textarea.selectionStart = start;
    textarea.selectionEnd = start;
    updateTypingMetrics();
    saveTypingHistory();
}

async function typingToolPaste() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const pasteText = await navigator.clipboard.readText();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            textarea.value = val.substring(0, start) + pasteText + val.substring(end);
            textarea.selectionStart = start + pasteText.length;
            textarea.selectionEnd = start + pasteText.length;
            updateTypingMetrics();
            saveTypingHistory();
            textarea.focus();
        } else {
            alert('Please use Ctrl+V on your keyboard to paste text.');
        }
    } catch (e) {
        alert('Clipboard access denied. Use Ctrl+V on your keyboard.');
    }
}

function saveTypingHistory() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea) return;
    const text = textarea.value;
    if (TypingToolState.history.length === 0 || TypingToolState.history[TypingToolState.historyIndex] !== text) {
        TypingToolState.history = TypingToolState.history.slice(0, TypingToolState.historyIndex + 1);
        TypingToolState.history.push(text);
        if (TypingToolState.history.length > 50) TypingToolState.history.shift();
        TypingToolState.historyIndex = TypingToolState.history.length - 1;
    }
}

function typingToolUndo() {
    if (TypingToolState.historyIndex > 0) {
        TypingToolState.historyIndex--;
        const textarea = document.getElementById('typingMainTextarea');
        if (textarea) {
            textarea.value = TypingToolState.history[TypingToolState.historyIndex];
            updateTypingMetrics();
        }
    }
}

function typingToolRedo() {
    if (TypingToolState.historyIndex < TypingToolState.history.length - 1) {
        TypingToolState.historyIndex++;
        const textarea = document.getElementById('typingMainTextarea');
        if (textarea) {
            textarea.value = TypingToolState.history[TypingToolState.historyIndex];
            updateTypingMetrics();
        }
    }
}

function typingToolSelectAll() {
    const textarea = document.getElementById('typingMainTextarea');
    if (textarea) {
        textarea.focus();
        textarea.select();
    }
}

function typingToolClear() {
    const textarea = document.getElementById('typingMainTextarea');
    if (!textarea || !textarea.value.trim()) return;
    if (confirm('Are you sure you want to clear all text? You can undo with Ctrl+Z.')) {
        textarea.value = '';
        TypingToolState.suggestions = [];
        TypingToolState.activeToken = '';
        renderSuggestionBar();
        updateTypingMetrics();
        saveTypingHistory();
    }
}

function showTypingToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-blue-500 z-50 flex items-center gap-2';
    toast.innerHTML = `<span>[OK]</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

// ==========================================
// 7. DOWNLOAD & EXPORT CONTROLLERS
// ==========================================
function downloadTypingTxt() {
    const textarea = document.getElementById('typingMainTextarea');
    const text = textarea ? textarea.value : '';
    if (!text.trim()) {
        alert('Please write something before downloading.');
        return;
    }

    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const filename = `amaan-typing-${TypingToolState.currentLang}-${Date.now()}.txt`;
    triggerBlobDownload(blob, filename);
}

function downloadTypingDocx() {
    const textarea = document.getElementById('typingMainTextarea');
    const text = textarea ? textarea.value : '';
    if (!text.trim()) {
        alert('Please write something before downloading.');
        return;
    }

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>AMAAN CSC CENTER PIPILI - Official Transcript</title>
        <style>
            body { font-family: 'Kalinga', 'Nirmala UI', 'Mangal', 'Arial', sans-serif; font-size: 13pt; line-height: 1.6; color: #111827; }
            .header { border-bottom: 2pt solid #1E3A8A; padding-bottom: 8pt; margin-bottom: 15pt; }
            .header-title { font-size: 16pt; font-weight: bold; color: #1E3A8A; }
            .header-meta { font-size: 9pt; color: #6B7280; margin-top: 4pt; }
            .content { white-space: pre-wrap; font-size: 13pt; line-height: 1.8; margin-top: 15pt; margin-bottom: 25pt; }
            .footer { border-top: 1pt solid #E5E7EB; padding-top: 6pt; font-size: 9pt; color: #6B7280; text-align: right; margin-top: 30pt; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-title">AMAAN CSC CENTER - PIPILI, PURI</div>
            <div class="header-meta">Mo Seva Kendra & Common Service Center â€¢ Proprietor: SAKIL ALAM â€¢ Helpdesk: +91 9078765653</div>
            <div class="header-meta">Official Transliteration Transcript [Script: ${TypingToolState.currentLang.toUpperCase()}] â€¢ Date: ${new Date().toLocaleString('en-GB')}</div>
        </div>
        <div class="content">
            ${escaped}
        </div>
        <div class="footer">
            Generated via AMAAN CSC Tools Portal â€¢ Main Road, In Front of Devigali, Pipili, Puri, Odisha (752104)
        </div>
    </body>
    </html>
    `;

    const blob = new Blob(['\uFEFF' + docHtml], { type: 'application/msword;charset=utf-8' });
    const filename = `amaan-typing-${TypingToolState.currentLang}-${Date.now()}.doc`;
    triggerBlobDownload(blob, filename);
}

async function downloadTypingPdf() {
    const textarea = document.getElementById('typingMainTextarea');
    const text = textarea ? textarea.value : '';
    if (!text.trim()) {
        alert('Please write something before downloading.');
        return;
    }

    try {
        const pdfBlob = await generateTypingPdfBlob(text, TypingToolState.currentLang);
        const filename = `amaan-typing-${TypingToolState.currentLang}-${Date.now()}.pdf`;
        triggerBlobDownload(pdfBlob, filename);
    } catch (err) {
        console.error('PDF generation error:', err);
        alert(`PDF generation failed: ${err.message}. You can download as Word (.doc) or TXT.`);
    }
}

async function generateTypingPdfBlob(text, lang) {
    const A4_WIDTH = 1240;
    const A4_HEIGHT = 1754;

    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(50, 50, A4_WIDTH - 100, 100);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText('AMAAN CSC CENTER', 80, 95);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Authorized Mo Seva Kendra & Common Service Center â€¢ Pipili, Puri, Odisha (752104)', 80, 125);

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(50, 160, A4_WIDTH - 100, 40);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(`OFFICIAL TYPING TRANSCRIPT [SCRIPT: ${lang.toUpperCase()}]`, 80, 185);

    const dateStr = new Date().toLocaleString('en-GB');
    ctx.textAlign = 'right';
    ctx.fillText(`Generated: ${dateStr}`, A4_WIDTH - 80, 185);
    ctx.textAlign = 'left';

    const fontFamily = lang === 'odia'
        ? '"Kalinga", "Nirmala UI", "Segoe UI", sans-serif'
        : (lang === 'hindi' ? '"Mangal", "Nirmala UI", "Segoe UI", sans-serif' : '"Segoe UI", sans-serif');

    ctx.fillStyle = '#0F172A';
    ctx.font = `24px ${fontFamily}`;

    const marginX = 80;
    let currentY = 240;
    const maxLineWidth = A4_WIDTH - 160;
    const lineHeight = 42;

    const rawLines = text.split('\n');
    for (const rawLine of rawLines) {
        if (!rawLine.trim()) {
            currentY += lineHeight * 0.75;
            continue;
        }

        const words = rawLine.split(' ');
        let curLineText = '';

        for (const word of words) {
            const testLine = curLineText ? `${curLineText} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxLineWidth) {
                ctx.fillText(curLineText, marginX, currentY);
                currentY += lineHeight;
                curLineText = word;
            } else {
                curLineText = testLine;
            }

            if (currentY > A4_HEIGHT - 120) {
                break;
            }
        }

        if (curLineText && currentY <= A4_HEIGHT - 120) {
            ctx.fillText(curLineText, marginX, currentY);
            currentY += lineHeight;
        }
    }

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, A4_HEIGHT - 90);
    ctx.lineTo(A4_WIDTH - 50, A4_HEIGHT - 90);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Main Road, In Front of Devigali, Pipili, Puri District, Odisha (752104) â€¢ Phone: +91 9078765653 â€¢ Email: pipilionlinesewa@gmail.com', 80, A4_HEIGHT - 60);

    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 595.28, 841.89);
        return pdf.output('blob');
    } else if (typeof PDFLib !== 'undefined') {
        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);
        const imgBytes = await fetch(canvas.toDataURL('image/jpeg', 0.95)).then(r => r.arrayBuffer());
        const embeddedImg = await pdfDoc.embedJpg(imgBytes);
        page.drawImage(embeddedImg, { x: 0, y: 0, width: 595.28, height: 841.89 });
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } else {
        throw new Error('No PDF generation library found');
    }
}

async function processTypingTool() {
    const textarea = document.getElementById('typingMainTextarea');
    const text = textarea ? textarea.value : '';
    if (!text.trim()) throw new Error('Please type some text before processing.');

    const pdfBlob = await generateTypingPdfBlob(text, TypingToolState.currentLang);
    const filename = `amaan-typing-${TypingToolState.currentLang}-${Date.now()}.pdf`;

    return {
        type: 'pdf',
        previewType: 'pdf',
        blob: pdfBlob,
        filename: filename,
        size: pdfBlob.size,
        pageCount: 1,
        text: text,
        availableFormats: ['txt', 'docx', 'pdf']
    };
}