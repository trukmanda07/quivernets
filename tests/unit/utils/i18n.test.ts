import { describe, it, expect, vi } from 'vitest';
import {
	getLangFromUrl,
	removeLanguagePrefix,
	addLanguagePrefix,
	switchLanguage,
	useTranslations,
	detectBrowserLanguage,
	getCollectionName,
	formatDate,
	supportedLanguages,
	defaultLanguage,
} from '@/utils/i18n';

describe('i18n.ts', () => {
	describe('getLangFromUrl', () => {
		it('should extract English language from URL path', () => {
			expect(getLangFromUrl('/en/blog/post')).toBe('en');
			expect(getLangFromUrl('/en/')).toBe('en');
			expect(getLangFromUrl('/en')).toBe('en');
		});

		it('should extract Indonesian language from URL path', () => {
			expect(getLangFromUrl('/id/blog/post')).toBe('id');
			expect(getLangFromUrl('/id/')).toBe('id');
			expect(getLangFromUrl('/id')).toBe('id');
		});

		it('should return default language for paths without language prefix', () => {
			expect(getLangFromUrl('/blog/post')).toBe('en');
			expect(getLangFromUrl('/about')).toBe('en');
			expect(getLangFromUrl('/')).toBe('en');
			expect(getLangFromUrl('')).toBe('en');
		});

		it('should return default language for unsupported language codes', () => {
			expect(getLangFromUrl('/fr/blog/post')).toBe('en');
			expect(getLangFromUrl('/es/about')).toBe('en');
			expect(getLangFromUrl('/de/')).toBe('en');
		});

		it('should handle paths with trailing slashes', () => {
			expect(getLangFromUrl('/en/blog/post/')).toBe('en');
			expect(getLangFromUrl('/id/about/')).toBe('id');
		});
	});

	describe('removeLanguagePrefix', () => {
		it('should remove English prefix from path', () => {
			expect(removeLanguagePrefix('/en/blog/post')).toBe('/blog/post');
			expect(removeLanguagePrefix('/en/about')).toBe('/about');
			expect(removeLanguagePrefix('/en')).toBe('/');
		});

		it('should remove Indonesian prefix from path', () => {
			expect(removeLanguagePrefix('/id/blog/post')).toBe('/blog/post');
			expect(removeLanguagePrefix('/id/about')).toBe('/about');
			expect(removeLanguagePrefix('/id')).toBe('/');
		});

		it('should return original path if no language prefix', () => {
			expect(removeLanguagePrefix('/blog/post')).toBe('/blog/post');
			expect(removeLanguagePrefix('/about')).toBe('/about');
			expect(removeLanguagePrefix('/')).toBe('/');
		});

		it('should not remove unsupported language-like segments', () => {
			expect(removeLanguagePrefix('/fr/blog/post')).toBe('/fr/blog/post');
			expect(removeLanguagePrefix('/es/about')).toBe('/es/about');
		});

		it('should handle paths with trailing slashes', () => {
			expect(removeLanguagePrefix('/en/blog/post/')).toBe('/blog/post');
			expect(removeLanguagePrefix('/id/about/')).toBe('/about');
		});
	});

	describe('addLanguagePrefix', () => {
		it('should add English prefix to path', () => {
			expect(addLanguagePrefix('/blog/post', 'en')).toBe('/en/blog/post');
			expect(addLanguagePrefix('/about', 'en')).toBe('/en/about');
			expect(addLanguagePrefix('/', 'en')).toBe('/en/');
		});

		it('should add Indonesian prefix to path', () => {
			expect(addLanguagePrefix('/blog/post', 'id')).toBe('/id/blog/post');
			expect(addLanguagePrefix('/about', 'id')).toBe('/id/about');
		});

		it('should handle paths without leading slash', () => {
			expect(addLanguagePrefix('blog/post', 'en')).toBe('/en/blog/post');
			expect(addLanguagePrefix('about', 'id')).toBe('/id/about');
		});

		it('should handle empty paths', () => {
			expect(addLanguagePrefix('', 'en')).toBe('/en/');
			expect(addLanguagePrefix('', 'id')).toBe('/id/');
		});

		it('should handle paths with trailing slashes', () => {
			expect(addLanguagePrefix('/blog/post/', 'en')).toBe('/en/blog/post/');
			expect(addLanguagePrefix('about/', 'id')).toBe('/id/about/');
		});
	});

	describe('switchLanguage', () => {
		it('should switch from English to Indonesian', () => {
			expect(switchLanguage('/en/blog/post', 'id')).toBe('/id/blog/post');
			expect(switchLanguage('/en/about', 'id')).toBe('/id/about');
		});

		it('should switch from Indonesian to English', () => {
			expect(switchLanguage('/id/blog/post', 'en')).toBe('/en/blog/post');
			expect(switchLanguage('/id/about', 'en')).toBe('/en/about');
		});

		it('should add language prefix if none exists', () => {
			expect(switchLanguage('/blog/post', 'en')).toBe('/en/blog/post');
			expect(switchLanguage('/about', 'id')).toBe('/id/about');
		});

		it('should handle root paths', () => {
			expect(switchLanguage('/en/', 'id')).toBe('/id/');
			expect(switchLanguage('/id/', 'en')).toBe('/en/');
			expect(switchLanguage('/', 'en')).toBe('/en/');
		});
	});

	describe('useTranslations', () => {
		it('should return English translations', () => {
			const translations = useTranslations('en');

			expect(translations).toBeDefined();
			expect(typeof translations).toBe('object');
		});

		it('should return Indonesian translations', () => {
			const translations = useTranslations('id');

			expect(translations).toBeDefined();
			expect(typeof translations).toBe('object');
		});

		it('should return different translations for different languages', () => {
			const enTranslations = useTranslations('en');
			const idTranslations = useTranslations('id');

			expect(enTranslations).not.toBe(idTranslations);
		});
	});

	describe('detectBrowserLanguage', () => {
		it('should detect English from Accept-Language header', () => {
			expect(detectBrowserLanguage('en-US,en;q=0.9')).toBe('en');
			expect(detectBrowserLanguage('en')).toBe('en');
			expect(detectBrowserLanguage('en-GB,en;q=0.8')).toBe('en');
		});

		it('should detect Indonesian from Accept-Language header', () => {
			expect(detectBrowserLanguage('id-ID,id;q=0.9')).toBe('id');
			expect(detectBrowserLanguage('id')).toBe('id');
			expect(detectBrowserLanguage('id,en;q=0.8')).toBe('id');
		});

		it('should return default language for undefined header', () => {
			expect(detectBrowserLanguage(undefined)).toBe('en');
			expect(detectBrowserLanguage('')).toBe('en');
		});

		it('should return default language for unsupported languages', () => {
			expect(detectBrowserLanguage('fr-FR,fr;q=0.9')).toBe('en');
			expect(detectBrowserLanguage('es-ES,es;q=0.8')).toBe('en');
			expect(detectBrowserLanguage('de,en;q=0.5')).toBe('en');
		});

		it('should prioritize first supported language', () => {
			expect(detectBrowserLanguage('fr,en;q=0.9,id;q=0.8')).toBe('en');
			expect(detectBrowserLanguage('es,id;q=0.9,en;q=0.8')).toBe('id');
		});

		it('should handle complex Accept-Language headers', () => {
			expect(detectBrowserLanguage('en-US,en;q=0.9,id;q=0.8,fr;q=0.7')).toBe('en');
			expect(detectBrowserLanguage('fr-FR,id-ID;q=0.9,en;q=0.8')).toBe('id');
		});

		it('should strip region codes correctly', () => {
			expect(detectBrowserLanguage('en-US')).toBe('en');
			expect(detectBrowserLanguage('id-ID')).toBe('id');
			expect(detectBrowserLanguage('en-GB')).toBe('en');
		});
	});

	describe('getCollectionName', () => {
		it('should return correct collection name for English', () => {
			expect(getCollectionName('en')).toBe('blog-en');
		});

		it('should return correct collection name for Indonesian', () => {
			expect(getCollectionName('id')).toBe('blog-id');
		});
	});

	describe('formatDate', () => {
		const testDate = new Date('2024-01-15');

		it('should format date in English locale', () => {
			const formatted = formatDate(testDate, 'en');

			expect(formatted).toContain('January');
			expect(formatted).toContain('15');
			expect(formatted).toContain('2024');
		});

		it('should format date in Indonesian locale', () => {
			const formatted = formatDate(testDate, 'id');

			expect(formatted).toContain('Januari');
			expect(formatted).toContain('15');
			expect(formatted).toContain('2024');
		});

		it('should return different formats for different locales', () => {
			const enFormat = formatDate(testDate, 'en');
			const idFormat = formatDate(testDate, 'id');

			expect(enFormat).not.toBe(idFormat);
		});

		it('should handle various dates correctly', () => {
			const date1 = new Date('2024-12-31');
			const date2 = new Date('2023-06-15');

			expect(formatDate(date1, 'en')).toContain('December');
			expect(formatDate(date2, 'id')).toContain('Juni');
		});
	});

	describe('constants', () => {
		it('should export correct supported languages', () => {
			expect(supportedLanguages).toEqual(['en', 'id']);
			expect(supportedLanguages).toHaveLength(2);
		});

		it('should have English as default language', () => {
			expect(defaultLanguage).toBe('en');
		});
	});
});
