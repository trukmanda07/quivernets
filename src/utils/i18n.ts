import type { Language } from '../i18n';
import { defaultLanguage, supportedLanguages, getTranslations } from '../i18n';

// Re-export for convenience
export { supportedLanguages, defaultLanguage };

/**
 * Extracts language from URL path
 * @param pathname - The URL pathname (e.g., '/en/blog/post')
 * @returns The language code or default language
 */
export function getLangFromUrl(pathname: string): Language {
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	if (firstSegment && supportedLanguages.includes(firstSegment as Language)) {
		return firstSegment as Language;
	}

	return defaultLanguage;
}

/**
 * Removes language prefix from a path
 * @param pathname - The URL pathname (e.g., '/en/blog/post')
 * @returns Path without language prefix (e.g., '/blog/post')
 */
export function removeLanguagePrefix(pathname: string): string {
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	if (firstSegment && supportedLanguages.includes(firstSegment as Language)) {
		return '/' + segments.slice(1).join('/');
	}

	return pathname;
}

/**
 * Adds language prefix to a path
 * @param path - The path without language prefix (e.g., '/blog/post')
 * @param lang - The language code
 * @returns Path with language prefix (e.g., '/en/blog/post')
 */
export function addLanguagePrefix(path: string, lang: Language): string {
	// Remove leading slash if present
	const cleanPath = path.startsWith('/') ? path.slice(1) : path;
	return `/${lang}/${cleanPath}`;
}

/**
 * Switches the language in a URL path
 * @param pathname - Current path (e.g., '/en/blog/post')
 * @param newLang - Target language
 * @returns Path with new language (e.g., '/id/blog/post')
 */
export function switchLanguage(pathname: string, newLang: Language): string {
	const pathWithoutLang = removeLanguagePrefix(pathname);
	return addLanguagePrefix(pathWithoutLang, newLang);
}

/**
 * Gets translation strings for a specific language
 * @param lang - The language code
 * @returns Translation object
 */
export function useTranslations(lang: Language) {
	return getTranslations(lang);
}

/**
 * Detects browser language preference
 * @param acceptLanguage - The Accept-Language header value
 * @returns Detected language or default
 */
export function detectBrowserLanguage(acceptLanguage?: string): Language {
	if (!acceptLanguage) {
		return defaultLanguage;
	}

	// Parse Accept-Language header (e.g., 'en-US,en;q=0.9,id;q=0.8')
	const languages = acceptLanguage.split(',').map(lang => {
		const [code] = lang.split(';');
		return code.trim().split('-')[0]; // Get language code without region
	});

	// Find first supported language
	for (const lang of languages) {
		if (supportedLanguages.includes(lang as Language)) {
			return lang as Language;
		}
	}

	return defaultLanguage;
}

/**
 * Gets the collection name for a specific language
 * @param lang - The language code
 * @returns Collection name (e.g., 'blog-en' or 'blog-id')
 */
export function getCollectionName(lang: Language): 'blog-en' | 'blog-id' {
	return `blog-${lang}` as 'blog-en' | 'blog-id';
}

/**
 * Formats a date according to locale
 * @param date - Date to format
 * @param lang - Language for formatting
 * @returns Formatted date string
 */
export function formatDate(date: Date, lang: Language): string {
	const locale = lang === 'id' ? 'id-ID' : 'en-US';
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
}
