/**
 * Share functionality for presentations
 * Handles URL generation, social sharing, and notifications
 *
 * @module presentation-header/scripts/share-handlers
 * @since Week 3 Refactoring
 */

/**
 * Share data structure for social platforms
 *
 * @interface ShareData
 * @property {string} title - Title of the presentation/slide
 * @property {string} text - Descriptive text for sharing
 * @property {string} url - Full URL including slide hash
 */
export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Get the current slide's shareable URL with hash navigation
 *
 * @returns {string} Full URL with slide hash (e.g., "https://example.com/presentation#/3")
 * @example
 * ```typescript
 * const url = getCurrentShareUrl();
 * // => "https://quiverlearn.com/en/presentations/example#/2"
 * ```
 */
export function getCurrentShareUrl(): string {
  const deck = (window as any).Reveal;
  if (deck) {
    const indices = deck.getIndices();
    return window.location.origin + window.location.pathname + `#/${indices.h}`;
  }
  return window.location.href;
}

/**
 * Get current slide title and shareable text
 *
 * @returns {ShareData} Object containing title, text, and URL for sharing
 * @example
 * ```typescript
 * const shareData = getCurrentShareText();
 * // => { title: "Introduction - Slide 2", text: "Check out this slide: Introduction", url: "..." }
 * ```
 */
export function getCurrentShareText(): ShareData {
  const deck = (window as any).Reveal;
  let slideTitle = 'Presentation';

  if (deck) {
    const currentSlide = deck.getCurrentSlide();
    const h2 = currentSlide?.querySelector('h2');
    if (h2) {
      slideTitle = h2.textContent || 'Presentation';
    }
    const indices = deck.getIndices();
    return {
      title: `${slideTitle} - Slide ${indices.h + 1}`,
      text: `Check out this slide: ${slideTitle}`,
      url: getCurrentShareUrl()
    };
  }

  return {
    title: slideTitle,
    text: 'Check out this presentation',
    url: getCurrentShareUrl()
  };
}

/**
 * Show a temporary notification message at the top-right corner
 * Automatically fades out after 2 seconds
 *
 * @param {string} message - Message to display in the notification
 * @example
 * ```typescript
 * showNotification('✅ Link copied!');
 * showNotification('❌ Error occurred');
 * ```
 */
export function showNotification(message: string): void {
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

/**
 * Copy current slide URL to clipboard
 * Shows success or error notification
 *
 * @returns {Promise<void>} Resolves when clipboard operation completes
 * @throws Will show error notification if clipboard access fails
 * @example
 * ```typescript
 * await shareToClipboard();
 * // Shows: "✅ Link copied to clipboard!"
 * ```
 */
export async function shareToClipboard(): Promise<void> {
  const url = getCurrentShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    showNotification('✅ Link copied to clipboard!');
  } catch (error) {
    showNotification('❌ Failed to copy link');
  }
}

/**
 * Open Twitter/X share dialog in new window
 * Includes current slide title and URL
 *
 * @example
 * ```typescript
 * shareToTwitter();
 * // Opens: https://twitter.com/intent/tweet?text=...&url=...
 * ```
 */
export function shareToTwitter(): void {
  const share = getCurrentShareText();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(share.text)}&url=${encodeURIComponent(share.url)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Open Facebook share dialog in new window
 * Shares current slide URL
 *
 * @example
 * ```typescript
 * shareToFacebook();
 * // Opens: https://www.facebook.com/sharer/sharer.php?u=...
 * ```
 */
export function shareToFacebook(): void {
  const url = getCurrentShareUrl();
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

/**
 * Open LinkedIn share dialog in new window
 * Shares current slide URL
 *
 * @example
 * ```typescript
 * shareToLinkedIn();
 * // Opens: https://www.linkedin.com/sharing/share-offsite/?url=...
 * ```
 */
export function shareToLinkedIn(): void {
  const url = getCurrentShareUrl();
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
}

/**
 * Open WhatsApp share dialog
 * Includes slide title and URL in message
 *
 * @example
 * ```typescript
 * shareToWhatsApp();
 * // Opens: https://wa.me/?text=Check%20out%20this%20slide...
 * ```
 */
export function shareToWhatsApp(): void {
  const share = getCurrentShareText();
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(share.text + ' ' + share.url)}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Initialize CSS animations for notification fade-in/fade-out
 * Injects keyframe animations into document head
 * Should be called once on page load
 *
 * @example
 * ```typescript
 * initializeShareAnimations();
 * // Adds fadeIn and fadeOut keyframes to document
 * ```
 */
export function initializeShareAnimations(): void {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(20px); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-fade-out { animation: fadeOut 0.3s ease-in; }
  `;
  document.head.appendChild(style);
}
