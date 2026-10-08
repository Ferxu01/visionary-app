export const availableLangs = ['es', 'en'] as const;
export const defaultLang: LangCode = 'es';

export const AVAILABLE_LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
] as const;

export type LangCode = (typeof AVAILABLE_LANGUAGES)[number]['id'];
export type Language = (typeof AVAILABLE_LANGUAGES)[number];
