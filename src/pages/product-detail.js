import { productService } from '../services/productService.js';
import { cart } from '../utils/cart.js';
import { renderSpecialBadge } from '../utils/badge.js';

async function initProductDetail() {
    const app = document.getElementById('app');
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    let selectedSize = 'tall';
    const sizes = ['short', 'tall', 'grande', 'venti'];

    if (!productId) {
        window.location.href = '/products.html';
        return;
    }

    // Skeleton
    app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="animate-pulse flex flex-col md:flex-row gap-8">
            <div class="w-full md:w-1/2 h-96 bg-gray-200 rounded-lg"></div>
            <div class="w-full md:w-1/2 space-y-4">
                 <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                 <div class="h-4 bg-gray-200 rounded w-full"></div>
                 <div class="h-4 bg-gray-200 rounded w-full"></div>
            </div>
        </div>
    </div>
  `;

    try {
        const product = await productService.getProductById(productId);
        render(product);
    } catch (e) {
        app.innerHTML = `<div class="text-center py-12 text-red-600">Product not found</div>`;
    }

    function render(product) {
        app.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div class="md:flex">
                    <!-- Image Section -->
                    <div class="md:flex-shrink-0 md:w-1/2 bg-gray-100 relative">
                        <img class="h-64 w-full object-cover md:h-full" src="${product.image}" alt="${product.name}">
                        ${renderSpecialBadge(product)}
                    </div>
                    
                    <!-- Content Section -->
                    <div class="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                        <div class="uppercase tracking-wide text-sm text-primary font-semibold">${product.category}</div>
                        <h1 class="block mt-1 text-3xl leading-tight font-extrabold text-gray-900 sm:text-4xl">${product.name}</h1>
                        <p class="mt-4 text-gray-500 text-lg leading-relaxed">${product.description}</p>
                        
                        <!-- Size Selection -->
                        <div class="mt-8">
                            <h3 class="text-sm font-medium text-gray-900">Size</h3>
                            <div class="mt-4 grid grid-cols-4 gap-4">
                                ${sizes.map(size => {
            if (!product.price[size]) return ''; // Skip if not available
            return `
                                    <button class="size-btn group relative border rounded-lg py-3 px-4 flex items-center justify-center text-sm font-medium uppercase sm:flex-1 focus:outline-none transition-all duration-200 ${size === selectedSize ? 'border-primary ring-2 ring-primary text-primary bg-green-50' : 'border-gray-200 text-gray-900 hover:bg-gray-50'}" data-size="${size}">
                                        <span>${size.charAt(0)}</span>
                                        <span class="sr-only">${size}</span>
                                    </button>
                                    `;
        }).join('')}
                            </div>
                            <p class="mt-2 text-sm text-gray-500">
                                ${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}: ${getVolume(selectedSize)}
                            </p>
                        </div>
                        
                        <!-- Price and Action -->
                        <div class="mt-10 flex items-center justify-between border-t border-gray-100 pt-8">
                            <div>
                                <p class="text-sm text-gray-500">Total</p>
                                <p class="text-3xl font-extrabold text-gray-900" id="price-display">¥${product.price[selectedSize]}</p>
                            </div>
                            <button id="add-to-cart-btn" class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-primary hover:bg-opacity-90 shadow-lg transform active:scale-95 transition-all">
                                Add to Order
                            </button>
                        </div>
                        
                        ${product.customizations ? `
                        <div class="mt-6">
                            <h3 class="text-sm font-medium text-gray-900 mb-2">Customizations</h3>
                            <div class="flex flex-wrap gap-2">
                                ${product.customizations.map(c => `
                                    <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        ${c}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
             </div>
             
             <div class="mt-8 text-center">
                <a href="/products.html" class="font-medium text-primary hover:text-green-800 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Menu
                </a>
             </div>
        </div>
        
        <!-- Toast Notification (Hidden by default) -->
        <div id="toast" class="fixed bottom-5 right-5 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl transform translate-y-24 transition-transform duration-300 flex items-center gap-3 z-50">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <div>
                <h4 class="font-bold text-sm">Added to order</h4>
                <p class="text-xs text-gray-300" id="toast-message"></p>
            </div>
        </div>
      `;

        attachEvents(product);
    }

    function getVolume(size) {
        const volumes = { short: '240ml', tall: '350ml', grande: '470ml', venti: '590ml' };
        return volumes[size] || '';
    }

    function attachEvents(product) {
        // Size change
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedSize = btn.dataset.size;
                // Update styles
                document.querySelectorAll('.size-btn').forEach(b => {
                    if (b.dataset.size === selectedSize) {
                        b.classList.add('border-primary', 'ring-2', 'ring-primary', 'text-primary', 'bg-green-50');
                        b.classList.remove('border-gray-200', 'text-gray-900', 'hover:bg-gray-50');
                    } else {
                        b.classList.remove('border-primary', 'ring-2', 'ring-primary', 'text-primary', 'bg-green-50');
                        b.classList.add('border-gray-200', 'text-gray-900', 'hover:bg-gray-50');
                    }
                });
                // Update price
                const priceDisplay = document.getElementById('price-display');
                if (priceDisplay && product.price[selectedSize]) {
                    priceDisplay.textContent = `¥${product.price[selectedSize]}`;
                }
                // Update description
                const desc = btn.parentElement.nextElementSibling;
                if (desc) desc.textContent = `${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}: ${getVolume(selectedSize)}`;
            });
        });

        // Add to Cart
        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            cart.addToCart(product, selectedSize, product.price[selectedSize]);
            showToast(`${product.name} (${selectedSize})`);
        });
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        const msg = document.getElementById('toast-message');
        msg.textContent = message;
        toast.classList.remove('translate-y-24');

        setTimeout(() => {
            toast.classList.add('translate-y-24');
        }, 3000);
    }
}

initProductDetail();
