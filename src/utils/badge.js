/**
 * Utility function to generate the "This week Special" badge HTML
 * @param {Object} product - The product object
 * @returns {string} HTML string for the badge, or empty string if product doesn't have the special flag
 */
export function renderSpecialBadge(product) {
    if (product.flag === 'This week Special') {
        return `
        <div class="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg uppercase tracking-wide flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>This week Special</span>
        </div>
        `;
    }
    return '';
}
