import en from './en.json';
import id from './id.json';

export type Language = 'en' | 'id';

export const languages = {
	en,
	id,
};

export const defaultLanguage: Language = 'en';
export const supportedLanguages: Language[] = ['en', 'id'];

export function getTranslations(lang: Language) {
	return languages[lang] || languages[defaultLanguage];
}
