import { cart } from '../utils/cart.js';
import { auth } from '../utils/auth.js';

function initCart() {
    const app = document.getElementById('app');

    if (!auth.isAuthenticated()) {
        app.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 class="mt-4 text-3xl font-extrabold text-gray-900">Sign in to view your order</h2>
            <p class="mt-2 text-lg text-gray-500">Please log in to manage your cart and checkout.</p>
            <div class="mt-8">
                <button id="cart-login-btn" class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 md:py-4 md:text-lg md:px-10">
                    Sign In
                </button>
            </div>
        </div>
      `;
        document.getElementById('cart-login-btn').addEventListener('click', auth.login);
        return;
    }

    const render = () => {
        const items = cart.getCart();
        const total = cart.getCartTotal();

        if (items.length === 0) {
            app.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 class="mt-4 text-3xl font-extrabold text-gray-900">Your cart is empty</h2>
                <p class="mt-2 text-lg text-gray-500">Looks like you haven't added anything to your order yet.</p>
                <div class="mt-8">
                    <a href="/products.html" class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 border-gray-200 shadow-sm md:py-4 md:text-lg md:px-10">
                        Start Ordering
                    </a>
                </div>
            </div>
          `;
            return;
        }

        app.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Your Order</h1>
            <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <section class="lg:col-span-7 space-y-4">
                    ${items.map(item => `
                        <div class="flex items-center p-4 bg-white rounded-lg shadow-sm">
                            <img src="${item.image}" alt="${item.name}" class="h-24 w-24 flex-shrink-0 rounded-md object-cover">
                            <div class="ml-6 flex-1 py-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-medium text-gray-900">
                                        <a href="/product-detail.html?id=${item.id}">${item.name}</a>
                                    </h3>
                                    <p class="text-lg font-bold text-gray-900">¥${item.price * item.quantity}</p>
                                </div>
                                <p class="mt-1 text-sm text-gray-500 capitalize">Size: ${item.size}</p>
                                <div class="mt-4 flex items-center justify-between">
                                    <div class="flex items-center border border-gray-300 rounded-md md:w-32">
                                        <button class="qty-btn px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md" data-action="decrease" data-id="${item.id}" data-size="${item.size}">-</button>
                                        <input type="text" class="w-full text-center border-none p-0 text-sm focus:ring-0" value="${item.quantity}" readonly>
                                        <button class="qty-btn px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md" data-action="increase" data-id="${item.id}" data-size="${item.size}">+</button>
                                    </div>
                                    <button class="remove-btn text-sm font-medium text-red-600 hover:text-red-500" data-id="${item.id}" data-size="${item.size}">Remove</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    <div class="mt-4 text-right">
                       <button id="clear-cart-btn" class="text-sm text-gray-500 hover:text-gray-900 underline">Clear Cart</button>
                    </div>
                </section>

                <section class="mt-16 bg-white rounded-lg shadow-sm px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                    <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>
                    <dl class="mt-6 space-y-4">
                        <div class="flex items-center justify-between">
                            <dt class="text-sm text-gray-600">Subtotal</dt>
                            <dd class="text-sm font-medium text-gray-900">¥${total}</dd>
                        </div>
                        <div class="flex items-center justify-between border-t border-gray-200 pt-4">
                            <dt class="text-base font-bold text-gray-900">Order Total</dt>
                            <dd class="text-2xl font-bold text-primary">¥${total}</dd>
                        </div>
                    </dl>

                    <div class="mt-6">
                        <button id="checkout-btn" class="w-full bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Checkout
                        </button>
                    </div>
                     <div class="mt-4 flex justify-center text-sm text-center text-gray-500">
                        <p>
                          or <a href="/products.html" class="text-primary font-medium hover:text-green-800">Continue Ordering<span aria-hidden="true"> &rarr;</span></a>
                        </p>
                      </div>
                </section>
            </div>
        </div>
      `;

        attachEvents();
    };

    const attachEvents = () => {
        // Quantity Buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { id, size, action } = e.target.dataset;
                const item = cart.getCart().find(i => i.id === id && i.size === size);
                if (item) {
                    const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
                    cart.updateQuantity(id, size, newQty);
                    render();
                }
            });
        });

        // Remove Buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { id, size } = e.target.dataset;
                if (confirm('Remove this item?')) {
                    cart.removeFromCart(id, size);
                    render();
                }
            });
        });

        // Clear Cart
        const clearBtn = document.getElementById('clear-cart-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear entire cart?')) {
                    cart.clearCart();
                    render();
                }
            });
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert('Order placed successfully! Thank you for your order.');
                cart.clearCart();
                window.location.href = '/';
            });
        }
    };

    render();
}

initCart();
