/**
 * Mobile menu toggle functionality
 */

/**
 * Initialize mobile menu toggle
 */
export function initializeMobileMenu(): void {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }
}
