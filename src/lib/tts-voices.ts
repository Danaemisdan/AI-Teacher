/**
 * Edge TTS Voice Registry
 * Full list of Microsoft Edge Neural voices across all available languages.
 * Source: https://learn.microsoft.com/azure/cognitive-services/speech-service/language-support
 *
 * Each entry: { code, label, voice, gender }
 */

export interface EdgeVoice {
  code: string;       // BCP-47 language code
  label: string;      // Human-readable language + region
  voice: string;      // Edge TTS voice name
  gender: 'Female' | 'Male';
  style?: string;     // e.g. 'cheerful', 'newscast'
}

export const EDGE_VOICES: EdgeVoice[] = [
  // ── English ──────────────────────────────────────────────────────────────
  { code: 'en-US', label: 'English (US)',       voice: 'en-US-AriaNeural',    gender: 'Female' },
  { code: 'en-US', label: 'English (US)',       voice: 'en-US-JennyNeural',   gender: 'Female' },
  { code: 'en-US', label: 'English (US)',       voice: 'en-US-GuyNeural',     gender: 'Male'   },
  { code: 'en-US', label: 'English (US)',       voice: 'en-US-DavisNeural',   gender: 'Male'   },
  { code: 'en-GB', label: 'English (UK)',       voice: 'en-GB-SoniaNeural',   gender: 'Female' },
  { code: 'en-GB', label: 'English (UK)',       voice: 'en-GB-RyanNeural',    gender: 'Male'   },
  { code: 'en-AU', label: 'English (Australia)',voice: 'en-AU-NatashaNeural', gender: 'Female' },
  { code: 'en-AU', label: 'English (Australia)',voice: 'en-AU-WilliamNeural', gender: 'Male'   },
  { code: 'en-IN', label: 'English (India)',    voice: 'en-IN-NeerjaNeural',  gender: 'Female' },
  { code: 'en-IN', label: 'English (India)',    voice: 'en-IN-PrabhatNeural', gender: 'Male'   },
  { code: 'en-CA', label: 'English (Canada)',   voice: 'en-CA-ClaraNeural',   gender: 'Female' },

  // ── Hindi ─────────────────────────────────────────────────────────────────
  { code: 'hi-IN', label: 'Hindi (India)',      voice: 'hi-IN-SwaraNeural',   gender: 'Female' },
  { code: 'hi-IN', label: 'Hindi (India)',      voice: 'hi-IN-MadhurNeural',  gender: 'Male'   },

  // ── Spanish ───────────────────────────────────────────────────────────────
  { code: 'es-ES', label: 'Spanish (Spain)',    voice: 'es-ES-ElviraNeural',  gender: 'Female' },
  { code: 'es-ES', label: 'Spanish (Spain)',    voice: 'es-ES-AlvaroNeural',  gender: 'Male'   },
  { code: 'es-MX', label: 'Spanish (Mexico)',   voice: 'es-MX-DaliaNeural',   gender: 'Female' },
  { code: 'es-MX', label: 'Spanish (Mexico)',   voice: 'es-MX-JorgeNeural',   gender: 'Male'   },
  { code: 'es-AR', label: 'Spanish (Argentina)',voice: 'es-AR-ElenaNeural',   gender: 'Female' },

  // ── French ────────────────────────────────────────────────────────────────
  { code: 'fr-FR', label: 'French (France)',    voice: 'fr-FR-DeniseNeural',  gender: 'Female' },
  { code: 'fr-FR', label: 'French (France)',    voice: 'fr-FR-HenriNeural',   gender: 'Male'   },
  { code: 'fr-CA', label: 'French (Canada)',    voice: 'fr-CA-SylvieNeural',  gender: 'Female' },

  // ── German ────────────────────────────────────────────────────────────────
  { code: 'de-DE', label: 'German (Germany)',   voice: 'de-DE-KatjaNeural',   gender: 'Female' },
  { code: 'de-DE', label: 'German (Germany)',   voice: 'de-DE-ConradNeural',  gender: 'Male'   },
  { code: 'de-AT', label: 'German (Austria)',   voice: 'de-AT-IngridNeural',  gender: 'Female' },

  // ── Portuguese ───────────────────────────────────────────────────────────
  { code: 'pt-BR', label: 'Portuguese (Brazil)',voice: 'pt-BR-FranciscaNeural',gender:'Female' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)',voice: 'pt-BR-AntonioNeural', gender: 'Male'   },
  { code: 'pt-PT', label: 'Portuguese (Portugal)',voice:'pt-PT-RaquelNeural', gender: 'Female' },

  // ── Italian ───────────────────────────────────────────────────────────────
  { code: 'it-IT', label: 'Italian (Italy)',    voice: 'it-IT-ElsaNeural',    gender: 'Female' },
  { code: 'it-IT', label: 'Italian (Italy)',    voice: 'it-IT-DiegoNeural',   gender: 'Male'   },

  // ── Dutch ─────────────────────────────────────────────────────────────────
  { code: 'nl-NL', label: 'Dutch (Netherlands)',voice: 'nl-NL-ColetteNeural', gender: 'Female' },
  { code: 'nl-NL', label: 'Dutch (Netherlands)',voice: 'nl-NL-MaartenNeural', gender: 'Male'   },

  // ── Russian ───────────────────────────────────────────────────────────────
  { code: 'ru-RU', label: 'Russian (Russia)',   voice: 'ru-RU-SvetlanaNeural',gender: 'Female' },
  { code: 'ru-RU', label: 'Russian (Russia)',   voice: 'ru-RU-DmitryNeural',  gender: 'Male'   },

  // ── Chinese ───────────────────────────────────────────────────────────────
  { code: 'zh-CN', label: 'Chinese (Mandarin)', voice: 'zh-CN-XiaoxiaoNeural',gender:'Female' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)', voice: 'zh-CN-YunxiNeural',   gender: 'Male'   },
  { code: 'zh-TW', label: 'Chinese (Traditional)',voice:'zh-TW-HsiaoChenNeural',gender:'Female'},
  { code: 'zh-HK', label: 'Chinese (Cantonese)',voice: 'zh-HK-HiuGaaiNeural', gender: 'Female' },

  // ── Japanese ─────────────────────────────────────────────────────────────
  { code: 'ja-JP', label: 'Japanese (Japan)',   voice: 'ja-JP-NanamiNeural',  gender: 'Female' },
  { code: 'ja-JP', label: 'Japanese (Japan)',   voice: 'ja-JP-KeitaNeural',   gender: 'Male'   },

  // ── Korean ───────────────────────────────────────────────────────────────
  { code: 'ko-KR', label: 'Korean (Korea)',     voice: 'ko-KR-SunHiNeural',   gender: 'Female' },
  { code: 'ko-KR', label: 'Korean (Korea)',     voice: 'ko-KR-InJoonNeural',  gender: 'Male'   },

  // ── Arabic ───────────────────────────────────────────────────────────────
  { code: 'ar-SA', label: 'Arabic (Saudi)',     voice: 'ar-SA-ZariyahNeural', gender: 'Female' },
  { code: 'ar-SA', label: 'Arabic (Saudi)',     voice: 'ar-SA-HamedNeural',   gender: 'Male'   },
  { code: 'ar-EG', label: 'Arabic (Egypt)',     voice: 'ar-EG-SalmaNeural',   gender: 'Female' },

  // ── Turkish ──────────────────────────────────────────────────────────────
  { code: 'tr-TR', label: 'Turkish (Turkey)',   voice: 'tr-TR-EmelNeural',    gender: 'Female' },
  { code: 'tr-TR', label: 'Turkish (Turkey)',   voice: 'tr-TR-AhmetNeural',   gender: 'Male'   },

  // ── Polish ───────────────────────────────────────────────────────────────
  { code: 'pl-PL', label: 'Polish (Poland)',    voice: 'pl-PL-ZofiaNeural',   gender: 'Female' },
  { code: 'pl-PL', label: 'Polish (Poland)',    voice: 'pl-PL-MarekNeural',   gender: 'Male'   },

  // ── Swedish ──────────────────────────────────────────────────────────────
  { code: 'sv-SE', label: 'Swedish (Sweden)',   voice: 'sv-SE-SofieNeural',   gender: 'Female' },
  { code: 'sv-SE', label: 'Swedish (Sweden)',   voice: 'sv-SE-MattiasNeural', gender: 'Male'   },

  // ── Norwegian ────────────────────────────────────────────────────────────
  { code: 'nb-NO', label: 'Norwegian (Bokmål)', voice: 'nb-NO-PernilleNeural',gender: 'Female' },
  { code: 'nb-NO', label: 'Norwegian (Bokmål)', voice: 'nb-NO-FinnNeural',    gender: 'Male'   },

  // ── Danish ───────────────────────────────────────────────────────────────
  { code: 'da-DK', label: 'Danish (Denmark)',   voice: 'da-DK-ChristelNeural',gender: 'Female' },
  { code: 'da-DK', label: 'Danish (Denmark)',   voice: 'da-DK-JeppeNeural',   gender: 'Male'   },

  // ── Finnish ──────────────────────────────────────────────────────────────
  { code: 'fi-FI', label: 'Finnish (Finland)',  voice: 'fi-FI-NooraNeural',   gender: 'Female' },
  { code: 'fi-FI', label: 'Finnish (Finland)',  voice: 'fi-FI-HarriNeural',   gender: 'Male'   },

  // ── Greek ────────────────────────────────────────────────────────────────
  { code: 'el-GR', label: 'Greek (Greece)',     voice: 'el-GR-AthinaNeural',  gender: 'Female' },
  { code: 'el-GR', label: 'Greek (Greece)',     voice: 'el-GR-NestorasNeural',gender: 'Male'   },

  // ── Hebrew ───────────────────────────────────────────────────────────────
  { code: 'he-IL', label: 'Hebrew (Israel)',    voice: 'he-IL-HilaNeural',    gender: 'Female' },
  { code: 'he-IL', label: 'Hebrew (Israel)',    voice: 'he-IL-AvriNeural',    gender: 'Male'   },

  // ── Indonesian ───────────────────────────────────────────────────────────
  { code: 'id-ID', label: 'Indonesian',         voice: 'id-ID-GadisNeural',   gender: 'Female' },
  { code: 'id-ID', label: 'Indonesian',         voice: 'id-ID-ArdiNeural',    gender: 'Male'   },

  // ── Malay ────────────────────────────────────────────────────────────────
  { code: 'ms-MY', label: 'Malay (Malaysia)',   voice: 'ms-MY-YasminNeural',  gender: 'Female' },
  { code: 'ms-MY', label: 'Malay (Malaysia)',   voice: 'ms-MY-OsmanNeural',   gender: 'Male'   },

  // ── Thai ─────────────────────────────────────────────────────────────────
  { code: 'th-TH', label: 'Thai (Thailand)',    voice: 'th-TH-PremwadeeNeural',gender:'Female' },
  { code: 'th-TH', label: 'Thai (Thailand)',    voice: 'th-TH-NiwatNeural',   gender: 'Male'   },

  // ── Vietnamese ───────────────────────────────────────────────────────────
  { code: 'vi-VN', label: 'Vietnamese (Vietnam)',voice:'vi-VN-HoaiMyNeural',  gender: 'Female' },
  { code: 'vi-VN', label: 'Vietnamese (Vietnam)',voice:'vi-VN-NamMinhNeural', gender: 'Male'   },

  // ── Bengali ──────────────────────────────────────────────────────────────
  { code: 'bn-IN', label: 'Bengali (India)',    voice: 'bn-IN-TanishaaNeural',gender: 'Female' },
  { code: 'bn-IN', label: 'Bengali (India)',    voice: 'bn-IN-BashkarNeural', gender: 'Male'   },

  // ── Tamil ────────────────────────────────────────────────────────────────
  { code: 'ta-IN', label: 'Tamil (India)',      voice: 'ta-IN-PallaviNeural', gender: 'Female' },
  { code: 'ta-IN', label: 'Tamil (India)',      voice: 'ta-IN-ValluvarNeural',gender: 'Male'   },

  // ── Telugu ───────────────────────────────────────────────────────────────
  { code: 'te-IN', label: 'Telugu (India)',     voice: 'te-IN-ShrutiNeural',  gender: 'Female' },
  { code: 'te-IN', label: 'Telugu (India)',     voice: 'te-IN-MohanNeural',   gender: 'Male'   },

  // ── Marathi ──────────────────────────────────────────────────────────────
  { code: 'mr-IN', label: 'Marathi (India)',    voice: 'mr-IN-AarohiNeural',  gender: 'Female' },
  { code: 'mr-IN', label: 'Marathi (India)',    voice: 'mr-IN-ManoharNeural', gender: 'Male'   },

  // ── Gujarati ─────────────────────────────────────────────────────────────
  { code: 'gu-IN', label: 'Gujarati (India)',   voice: 'gu-IN-DhwaniNeural',  gender: 'Female' },
  { code: 'gu-IN', label: 'Gujarati (India)',   voice: 'gu-IN-NiranjanNeural',gender: 'Male'   },

  // ── Punjabi ──────────────────────────────────────────────────────────────
  { code: 'pa-IN', label: 'Punjabi (India)',    voice: 'pa-IN-OjasNeural',    gender: 'Male'   },

  // ── Urdu ─────────────────────────────────────────────────────────────────
  { code: 'ur-PK', label: 'Urdu (Pakistan)',    voice: 'ur-PK-UzmaNeural',    gender: 'Female' },
  { code: 'ur-PK', label: 'Urdu (Pakistan)',    voice: 'ur-PK-AsadNeural',    gender: 'Male'   },

  // ── Swahili ──────────────────────────────────────────────────────────────
  { code: 'sw-KE', label: 'Swahili (Kenya)',    voice: 'sw-KE-ZuriNeural',    gender: 'Female' },
  { code: 'sw-KE', label: 'Swahili (Kenya)',    voice: 'sw-KE-RafikiNeural',  gender: 'Male'   },

  // ── Romanian ─────────────────────────────────────────────────────────────
  { code: 'ro-RO', label: 'Romanian (Romania)', voice: 'ro-RO-AlinaNeural',   gender: 'Female' },
  { code: 'ro-RO', label: 'Romanian (Romania)', voice: 'ro-RO-EmilNeural',    gender: 'Male'   },

  // ── Hungarian ────────────────────────────────────────────────────────────
  { code: 'hu-HU', label: 'Hungarian (Hungary)',voice: 'hu-HU-NoemiNeural',   gender: 'Female' },
  { code: 'hu-HU', label: 'Hungarian (Hungary)',voice: 'hu-HU-TamasNeural',   gender: 'Male'   },

  // ── Czech ────────────────────────────────────────────────────────────────
  { code: 'cs-CZ', label: 'Czech (Czech Republic)',voice:'cs-CZ-VlastaNeural',gender: 'Female' },
  { code: 'cs-CZ', label: 'Czech (Czech Republic)',voice:'cs-CZ-AntoninNeural',gender:'Male'   },

  // ── Slovak ───────────────────────────────────────────────────────────────
  { code: 'sk-SK', label: 'Slovak (Slovakia)',  voice: 'sk-SK-ViktoriaNeural',gender: 'Female' },
  { code: 'sk-SK', label: 'Slovak (Slovakia)',  voice: 'sk-SK-LukasNeural',   gender: 'Male'   },

  // ── Ukrainian ────────────────────────────────────────────────────────────
  { code: 'uk-UA', label: 'Ukrainian (Ukraine)',voice: 'uk-UA-PolinaNeural',  gender: 'Female' },
  { code: 'uk-UA', label: 'Ukrainian (Ukraine)',voice: 'uk-UA-OstapNeural',   gender: 'Male'   },

  // ── Bulgarian ────────────────────────────────────────────────────────────
  { code: 'bg-BG', label: 'Bulgarian (Bulgaria)',voice:'bg-BG-KalinaNeural',  gender: 'Female' },
  { code: 'bg-BG', label: 'Bulgarian (Bulgaria)',voice:'bg-BG-BorislavNeural',gender: 'Male'   },

  // ── Croatian ─────────────────────────────────────────────────────────────
  { code: 'hr-HR', label: 'Croatian (Croatia)', voice: 'hr-HR-GabrijelaNeural',gender:'Female' },
  { code: 'hr-HR', label: 'Croatian (Croatia)', voice: 'hr-HR-SreckoNeural',  gender: 'Male'   },

  // ── Serbian ──────────────────────────────────────────────────────────────
  { code: 'sr-RS', label: 'Serbian (Serbia)',   voice: 'sr-RS-SophieNeural',  gender: 'Female' },
  { code: 'sr-RS', label: 'Serbian (Serbia)',   voice: 'sr-RS-NicholasNeural',gender: 'Male'   },

  // ── Catalan ──────────────────────────────────────────────────────────────
  { code: 'ca-ES', label: 'Catalan (Spain)',    voice: 'ca-ES-JoanaNeural',   gender: 'Female' },
  { code: 'ca-ES', label: 'Catalan (Spain)',    voice: 'ca-ES-EnricNeural',   gender: 'Male'   },

  // ── Galician ─────────────────────────────────────────────────────────────
  { code: 'gl-ES', label: 'Galician (Spain)',   voice: 'gl-ES-SabelaNeural',  gender: 'Female' },

  // ── Basque ───────────────────────────────────────────────────────────────
  { code: 'eu-ES', label: 'Basque (Spain)',     voice: 'eu-ES-AinhoaNeural',  gender: 'Female' },

  // ── Persian / Farsi ──────────────────────────────────────────────────────
  { code: 'fa-IR', label: 'Persian (Iran)',     voice: 'fa-IR-DilaraNeural',  gender: 'Female' },
  { code: 'fa-IR', label: 'Persian (Iran)',     voice: 'fa-IR-FaridNeural',   gender: 'Male'   },

  // ── Azerbaijani ──────────────────────────────────────────────────────────
  { code: 'az-AZ', label: 'Azerbaijani (Azerbaijan)',voice:'az-AZ-BanuNeural',gender:'Female'  },
  { code: 'az-AZ', label: 'Azerbaijani (Azerbaijan)',voice:'az-AZ-BabekNeural',gender:'Male'   },

  // ── Kazakh ───────────────────────────────────────────────────────────────
  { code: 'kk-KZ', label: 'Kazakh (Kazakhstan)',voice: 'kk-KZ-AigulNeural',  gender: 'Female' },
  { code: 'kk-KZ', label: 'Kazakh (Kazakhstan)',voice: 'kk-KZ-DauletNeural', gender: 'Male'   },

  // ── Georgian ─────────────────────────────────────────────────────────────
  { code: 'ka-GE', label: 'Georgian (Georgia)', voice: 'ka-GE-EkaNeural',     gender: 'Female' },
  { code: 'ka-GE', label: 'Georgian (Georgia)', voice: 'ka-GE-GiorgiNeural',  gender: 'Male'   },

  // ── Mongolian ────────────────────────────────────────────────────────────
  { code: 'mn-MN', label: 'Mongolian (Mongolia)',voice:'mn-MN-YesuiNeural',   gender: 'Female' },
  { code: 'mn-MN', label: 'Mongolian (Mongolia)',voice:'mn-MN-BataaNeural',   gender: 'Male'   },

  // ── Lao ──────────────────────────────────────────────────────────────────
  { code: 'lo-LA', label: 'Lao (Laos)',         voice: 'lo-LA-KeomanyNeural', gender: 'Female' },
  { code: 'lo-LA', label: 'Lao (Laos)',         voice: 'lo-LA-ChanthavongNeural',gender:'Male' },

  // ── Khmer ────────────────────────────────────────────────────────────────
  { code: 'km-KH', label: 'Khmer (Cambodia)',   voice: 'km-KH-SreymomNeural', gender: 'Female' },
  { code: 'km-KH', label: 'Khmer (Cambodia)',   voice: 'km-KH-PisethNeural',  gender: 'Male'   },

  // ── Myanmar / Burmese ────────────────────────────────────────────────────
  { code: 'my-MM', label: 'Burmese (Myanmar)',  voice: 'my-MM-NilarNeural',   gender: 'Female' },
  { code: 'my-MM', label: 'Burmese (Myanmar)',  voice: 'my-MM-ThihaNeural',   gender: 'Male'   },

  // ── Filipino / Tagalog ───────────────────────────────────────────────────
  { code: 'fil-PH', label: 'Filipino (Philippines)',voice:'fil-PH-BlessicaNeural',gender:'Female'},
  { code: 'fil-PH', label: 'Filipino (Philippines)',voice:'fil-PH-AngeloNeural',   gender:'Male'},

  // ── Amharic ──────────────────────────────────────────────────────────────
  { code: 'am-ET', label: 'Amharic (Ethiopia)', voice: 'am-ET-MekdesNeural',  gender: 'Female' },
  { code: 'am-ET', label: 'Amharic (Ethiopia)', voice: 'am-ET-AmehaNeural',   gender: 'Male'   },

  // ── Zulu ─────────────────────────────────────────────────────────────────
  { code: 'zu-ZA', label: 'Zulu (South Africa)',voice: 'zu-ZA-ThandoNeural',  gender: 'Female' },
  { code: 'zu-ZA', label: 'Zulu (South Africa)',voice: 'zu-ZA-ThembaNeural',  gender: 'Male'   },

  // ── Afrikaans ────────────────────────────────────────────────────────────
  { code: 'af-ZA', label: 'Afrikaans (South Africa)',voice:'af-ZA-AdriNeural',gender: 'Female' },
  { code: 'af-ZA', label: 'Afrikaans (South Africa)',voice:'af-ZA-WillemNeural',gender:'Male'  },

  // ── Welsh ────────────────────────────────────────────────────────────────
  { code: 'cy-GB', label: 'Welsh (Wales)',       voice: 'cy-GB-NiaNeural',    gender: 'Female' },
  { code: 'cy-GB', label: 'Welsh (Wales)',       voice: 'cy-GB-AledNeural',   gender: 'Male'   },

  // ── Irish ────────────────────────────────────────────────────────────────
  { code: 'ga-IE', label: 'Irish (Ireland)',     voice: 'ga-IE-OrlaNeural',   gender: 'Female' },
  { code: 'ga-IE', label: 'Irish (Ireland)',     voice: 'ga-IE-ColmNeural',   gender: 'Male'   },

  // ── Maltese ──────────────────────────────────────────────────────────────
  { code: 'mt-MT', label: 'Maltese (Malta)',     voice: 'mt-MT-GraceNeural',  gender: 'Female' },
  { code: 'mt-MT', label: 'Maltese (Malta)',     voice: 'mt-MT-JosephNeural', gender: 'Male'   },

  // ── Icelandic ────────────────────────────────────────────────────────────
  { code: 'is-IS', label: 'Icelandic (Iceland)', voice: 'is-IS-GudrunNeural', gender: 'Female' },
  { code: 'is-IS', label: 'Icelandic (Iceland)', voice: 'is-IS-GunnarNeural', gender: 'Male'   },

  // ── Slovenian ────────────────────────────────────────────────────────────
  { code: 'sl-SI', label: 'Slovenian (Slovenia)',voice: 'sl-SI-PetraNeural',  gender: 'Female' },
  { code: 'sl-SI', label: 'Slovenian (Slovenia)',voice: 'sl-SI-RokNeural',    gender: 'Male'   },

  // ── Lithuanian ───────────────────────────────────────────────────────────
  { code: 'lt-LT', label: 'Lithuanian (Lithuania)',voice:'lt-LT-OnaNeural',   gender: 'Female' },
  { code: 'lt-LT', label: 'Lithuanian (Lithuania)',voice:'lt-LT-LeonasNeural',gender: 'Male'   },

  // ── Latvian ──────────────────────────────────────────────────────────────
  { code: 'lv-LV', label: 'Latvian (Latvia)',   voice: 'lv-LV-EveritaNeural', gender: 'Female' },
  { code: 'lv-LV', label: 'Latvian (Latvia)',   voice: 'lv-LV-NilsNeural',    gender: 'Male'   },

  // ── Estonian ─────────────────────────────────────────────────────────────
  { code: 'et-EE', label: 'Estonian (Estonia)', voice: 'et-EE-AnuNeural',     gender: 'Female' },
  { code: 'et-EE', label: 'Estonian (Estonia)', voice: 'et-EE-KertNeural',    gender: 'Male'   },
];

/** Get default voice for a language code (first Female voice) */
export function getDefaultVoice(langCode: string): EdgeVoice | undefined {
  return EDGE_VOICES.find(v => v.code === langCode && v.gender === 'Female')
    ?? EDGE_VOICES.find(v => v.code === langCode);
}

/** Get all voices grouped by language */
export function getVoicesByLanguage(): Map<string, EdgeVoice[]> {
  const map = new Map<string, EdgeVoice[]>();
  for (const voice of EDGE_VOICES) {
    const existing = map.get(voice.code) ?? [];
    map.set(voice.code, [...existing, voice]);
  }
  return map;
}

/** Default teaching voice */
export const DEFAULT_VOICE = 'en-US-AriaNeural';
