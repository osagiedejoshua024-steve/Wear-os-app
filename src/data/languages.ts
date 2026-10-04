export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  isPopular?: boolean;
}

export const ALL_LANGUAGES: LanguageOption[] = [
  // Major Nigerian Languages
  { code: 'en-NG', name: 'English (Nigeria)', nativeName: 'English (NG)', region: 'Nigeria', flag: '🇳🇬', isPopular: true },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', region: 'Nigeria / West Africa', flag: '🇳🇬', isPopular: true },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', region: 'Nigeria / West Africa', flag: '🇳🇬', isPopular: true },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', region: 'Nigeria', flag: '🇳🇬', isPopular: true },
  { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Naija Pidgin', region: 'Nigeria', flag: '🇳🇬', isPopular: true },
  { code: 'edo', name: 'Edo / Bini', nativeName: 'Ẹ̀dó', region: 'Nigeria (Edo State)', flag: '🇳🇬', isPopular: true },
  { code: 'efi', name: 'Efik / Ibibio', nativeName: 'Ikọ Efik', region: 'Nigeria', flag: '🇳🇬' },
  { code: 'tiv', name: 'Tiv', nativeName: 'Zwa Tiv', region: 'Nigeria (Benue)', flag: '🇳🇬' },
  { code: 'ful', name: 'Fulfulde / Fula', nativeName: 'Fulfulde', region: 'West & Central Africa', flag: '🇳🇬' },
  { code: 'urh', name: 'Urhobo', nativeName: 'Urhobo', region: 'Nigeria (Delta)', flag: '🇳🇬' },
  { code: 'kan', name: 'Kanuri', nativeName: 'Kanuri', region: 'Nigeria (Borno)', flag: '🇳🇬' },
  { code: 'ijw', name: 'Ijaw', nativeName: 'Ịjọ', region: 'Nigeria (Niger Delta)', flag: '🇳🇬' },
  
  // African Regional Languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'East Africa', flag: '🇰🇪', isPopular: true },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Ethiopia', flag: '🇪🇹' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'South Africa', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'South Africa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'South Africa', flag: '🇿🇦' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'North Africa & Middle East', flag: '🇪🇬', isPopular: true },
  { code: 'fr-AF', name: 'French (African)', nativeName: 'Français Africain', region: 'Francophone Africa', flag: '🇨🇮', isPopular: true },
  { code: 'pt-AO', name: 'Portuguese (Angola/Mozambique)', nativeName: 'Português', region: 'Lusophone Africa', flag: '🇦🇴' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'Rwanda', flag: '🇷🇼' },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', region: 'Uganda', flag: '🇺🇬' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', region: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'so', name: 'Somali', nativeName: 'Af-Soomaali', region: 'Somalia & Horn of Africa', flag: '🇸🇴' },

  // Global Major Languages
  { code: 'en-US', name: 'English (United States)', nativeName: 'English (US)', region: 'North America', flag: '🇺🇸', isPopular: true },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (UK)', region: 'Europe', flag: '🇬🇧', isPopular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Spain & Latin America', flag: '🇪🇸', isPopular: true },
  { code: 'fr', name: 'French (Standard)', nativeName: 'Français', region: 'France & Europe', flag: '🇫🇷', isPopular: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Germany & Europe', flag: '🇩🇪' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', region: 'South America', flag: '🇧🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', region: 'China', flag: '🇨🇳', isPopular: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', region: 'Taiwan / HK', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Japan', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'South Korea', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'India', flag: '🇮🇳', isPopular: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Bangladesh / India', flag: '🇧🇩' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Eastern Europe / Central Asia', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Turkey', flag: '🇹🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Netherlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Poland', flag: '🇵🇱' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Thailand', flag: '🇹🇭' },
  { code: 'fa', name: 'Persian / Farsi', nativeName: 'فارسی', region: 'Iran', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Pakistan / South Asia', flag: '🇵🇰' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'Malaysia', flag: '🇲🇾' },
  { code: 'fil', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino', region: 'Philippines', flag: '🇵🇭' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', region: 'Israel', flag: '🇮🇱' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'Greece', flag: '🇬🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'Norway', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'Finland', flag: '🇫🇮' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', region: 'Denmark', flag: '🇩🇰' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'Czech Republic', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'Hungary', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'Romania', flag: '🇷🇴' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'Ukraine', flag: '🇺🇦' },
];
