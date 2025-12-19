import { productService } from '../services/productService.js';
import { renderSpecialBadge } from '../utils/badge.js';

async function initHome() {
    const app = document.getElementById('app');

    // Static Hero Section
    const heroHTML = `
    <div class="relative bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg class="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">Coffee that makes</span>
                <span class="block text-primary xl:inline">your day better</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Experience the rich aroma and smooth taste of our premium coffee beans, ethically sourced from around the world to bring you joy in every cup.
              </p>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <a href="/products.html" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 md:py-4 md:text-lg md:px-10 transition-colors duration-200">
                    Order Now
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" alt="Coffee beans">
      </div>
    </div>
  `;

    // Fetch Featured Products (Simple: take first 3)
    let featuredProducts = [];
    try {
        const allProducts = await productService.getAllProducts();
        // Mock "featured" logic or just take 3
        featuredProducts = allProducts.slice(0, 3);
    } catch (e) {
        console.error('Failed to fetch products', e);
        // Fallback UI or empty
    }

    const productsHTML = `
    <div class="bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h2 class="text-base text-primary font-semibold tracking-wide uppercase">Favorites</h2>
            <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Our Popular Menu
            </p>
        </div>
        <div class="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            ${featuredProducts.map(product => `
            <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div class="w-full h-64 bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-90 transition-opacity relative">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-center object-cover">
                    ${renderSpecialBadge(product)}
                </div>
                <div class="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">
                            <a href="/product-detail.html?id=${product.id}">
                                <span aria-hidden="true" class="absolute inset-0"></span>
                                ${product.name}
                            </a>
                        </h3>
                        <p class="mt-2 text-sm text-gray-500 line-clamp-2">${product.description}</p>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                         <p class="text-xl font-bold text-primary">¥${product.price.tall}</p>
                         <span class="text-sm text-gray-400">Tall</span>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        
        <div class="mt-12 text-center">
          <a href="/products.html" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 shadow-sm border-gray-200">
            View All Products
          </a>
        </div>
      </div>
    </div>
  `;

    // Feature Steps Section (Bonus)
    const stepsHTML = `
     <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
                <div class="p-6">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-primary mb-4">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900">1. Choose your coffee</h3>
                    <p class="mt-2 text-base text-gray-500">Select from our wide variety of premium beans and blends.</p>
                </div>
                <div class="p-6">
                     <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-primary mb-4">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                    <h3 class="text-lg font-medium text-gray-900">2. Customize it</h3>
                    <p class="mt-2 text-base text-gray-500">Add shots, flavor, or change milk to make it yours.</p>
                </div>
                <div class="p-6">
                     <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-primary mb-4">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                     </div>
                    <h3 class="text-lg font-medium text-gray-900">3. Pick up & Enjoy</h3>
                    <p class="mt-2 text-base text-gray-500">We will have your order ready for pickup at the counter.</p>
                </div>
             </div>
        </div>
     </div>
  `;

    app.innerHTML = heroHTML + productsHTML + stepsHTML;
}

initHome();
