import { productService } from '../services/productService.js';
import { renderSpecialBadge } from '../utils/badge.js';

async function initProducts() {
    const app = document.getElementById('app');
    let products = [];
    let currentCategory = 'all';
    let searchQuery = '';

    // Render Skeleton / Loading
    app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div class="h-64 bg-gray-200 rounded"></div>
                <div class="h-64 bg-gray-200 rounded"></div>
                <div class="h-64 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
  `;

    try {
        products = await productService.getAllProducts();
    } catch (error) {
        app.innerHTML = `<div class="text-center text-red-600 py-12">Failed to load products. Please try again later.</div>`;
        return;
    }

    const render = () => {
        // Filter logic
        const filtered = products.filter(p => {
            const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        app.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Menu</h1>
                
                <!-- Search -->
                <div class="mt-4 md:mt-0 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" id="search-input" class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2" placeholder="Search menu..." value="${searchQuery}">
                </div>
            </div>

            <!-- Categories -->
            <div class="flex flex-wrap gap-2 mb-8">
                ${['all', 'coffee', 'tea', 'food', 'merchandise'].map(cat => `
                    <button class="category-btn capitalize px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${currentCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}" data-category="${cat}">
                        ${cat}
                    </button>
                `).join('')}
            </div>

            <!-- Products Grid -->
            ${filtered.length > 0 ? `
                <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    ${filtered.map(product => `
                        <div class="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
                            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative">
                                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity duration-300">
                                ${renderSpecialBadge(product)}
                                <div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-gray-900 shadow-sm uppercase tracking-wider">
                                    ${product.category}
                                </div>
                            </div>
                            <div class="flex-1 p-5 flex flex-col justify-between">
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900">
                                        <a href="/product-detail.html?id=${product.id}">
                                        <span aria-hidden="true" class="absolute inset-0"></span>
                                        ${product.name}
                                        </a>
                                    </h3>
                                    <p class="mt-1 text-sm text-gray-500 line-clamp-2">${product.description}</p>
                                </div>
                                <div class="mt-4 flex items-end justify-between">
                                    <div>
                                        <p class="text-sm text-gray-500">From</p>
                                        <p class="text-xl font-bold text-primary">¥${product.price.short}</p>
                                    </div>
                                    <div class="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-20">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p class="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
                </div>
            `}
        </div>
      `;

        attachEvents();
    };

    const attachEvents = () => {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cat = e.currentTarget.dataset.category;
                if (currentCategory !== cat) {
                    currentCategory = cat;
                    render();
                }
            });
        });

        // Search input
        const input = document.getElementById('search-input');
        if (input) {
            input.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                render();
            });
            // Restore focus? Re-rendering kills focus.
            // Better: only re-render grid? Or primitive VDOM.
            // For vanilla, let's just re-render and re-focus using logic.
            input.focus();
            // Caveat: cursor position lost. 
            // Improvement: Separate render of grid from inputs.
        }
    };

    // Improvement for search focus loss:
    // Split render into `bindEvents` and `updateGrid`.
    // Refactoring render to be smarter.

    const setupBaseLayout = () => {
        app.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Menu</h1>
                <div class="mt-4 md:mt-0 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input type="text" id="search-input" class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2" placeholder="Search menu...">
                </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-8" id="category-container">
                <!-- Injected via JS -->
            </div>

            <div id="products-grid" class="min-h-[400px]">
                <!-- Injected via JS -->
            </div>
        </div>
      `;

        document.getElementById('search-input').addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateGrid();
        });
    };

    const updateCategoryButtons = () => {
        const container = document.getElementById('category-container');
        container.innerHTML = ['all', 'coffee', 'tea', 'food', 'merchandise'].map(cat => `
            <button class="category-btn capitalize px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${currentCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCategory = btn.dataset.category;
                updateCategoryButtons();
                updateGrid();
            });
        });
    };

    const updateGrid = () => {
        const container = document.getElementById('products-grid');
        const filtered = products.filter(p => {
            const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length > 0) {
            container.innerHTML = `
            <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                ${filtered.map(product => `
                    <div class="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
                        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative">
                            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity duration-300">
                            ${renderSpecialBadge(product)}
                             <div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-gray-900 shadow-sm uppercase tracking-wider">
                                ${product.category}
                            </div>
                        </div>
                        <div class="flex-1 p-5 flex flex-col justify-between">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900">
                                    <a href="/product-detail.html?id=${product.id}">
                                    <span aria-hidden="true" class="absolute inset-0"></span>
                                    ${product.name}
                                    </a>
                                </h3>
                                <p class="mt-1 text-sm text-gray-500 line-clamp-2">${product.description}</p>
                            </div>
                            <div class="mt-4 flex items-end justify-between">
                                <div>
                                    <p class="text-sm text-gray-500">From</p>
                                    <p class="text-xl font-bold text-primary">¥${product.price.short}</p>
                                </div>
                                <div class="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
           `;
        } else {
            container.innerHTML = `
            <div class="text-center py-20">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p class="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
            </div>
           `;
        }
    };

    // Initial render flow
    setupBaseLayout();
    // Fetch data
    try {
        products = await productService.getAllProducts();
        updateCategoryButtons();
        updateGrid();
    } catch (e) {
        console.error(e);
        document.getElementById('products-grid').innerHTML = `<p class="text-center text-red-500">Failed to load products</p>`;
    }
}

initProducts();
