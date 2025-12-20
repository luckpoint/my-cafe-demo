import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ProductCard } from '../components/ProductCard'
import { productService } from '../services/productService'

import { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Product List
app.get('/', async (c) => {
    const products = await productService.getAllProducts()

    // Filter logic (simple query param)
    const category = c.req.query('category')
    const filteredProducts = category
        ? products.filter(p => p.category === category)
        : products

    const session = await c.var.auth0Client?.getSession(c)
    if (session) {
        console.log('--- Auth Check Debug (Products List) ---')
        console.log('User IS authenticated')
        console.log('Session User:', JSON.stringify(session.user, null, 2))
        console.log('------------------------------------')
    } else {
        console.log('--- Auth Check Debug (Products List) ---')
        console.log('User is NOT authenticated')
        console.log('------------------------------------')
    }
    const user = session?.user

    return c.html(
        <Layout title="Menu">
            <Header user={user} cartCount={0} currentPath="/products" />

            <div class="bg-gray-50 py-12 min-h-screen">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center">
                        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Menu</h1>
                        <p class="mt-4 text-xl text-gray-500">Explore our delicious selection of coffee, teas, and food.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div class="mt-8 flex justify-center space-x-4">
                        <a href="/products" class={`px-4 py-2 rounded-full text-sm font-medium ${!category ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>All</a>
                        <a href="/products?category=coffee" class={`px-4 py-2 rounded-full text-sm font-medium ${category === 'coffee' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Coffee</a>
                        <a href="/products?category=tea" class={`px-4 py-2 rounded-full text-sm font-medium ${category === 'tea' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Teas</a>
                        <a href="/products?category=food" class={`px-4 py-2 rounded-full text-sm font-medium ${category === 'food' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>Food</a>
                    </div>

                    <div class="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                        {filteredProducts.map(product => (
                            <ProductCard product={product} />
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    )
})

// Product Detail
app.get('/:id', async (c) => {
    const id = c.req.param('id')
    const product = await productService.getProductById(id)

    if (!product) {
        return c.text('Product not found', 404)
    }

    const session = await c.var.auth0Client?.getSession(c)
    if (session) {
        console.log('--- Auth Check Debug (Product Detail) ---')
        console.log('User IS authenticated')
        console.log('Session User:', JSON.stringify(session.user, null, 2))
        console.log('--------------------------------------')
    } else {
        console.log('--- Auth Check Debug (Product Detail) ---')
        console.log('User is NOT authenticated')
        console.log('--------------------------------------')
    }
    const user = session?.user

    return c.html(
        <Layout title={product.name}>
            <Header user={user} cartCount={0} currentPath="/products" />

            <div class="bg-white">
                <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                        {/* Image */}
                        <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
                            <img src={product.image} alt={product.name} class="w-full h-full object-center object-cover" />
                        </div>

                        {/* Info */}
                        <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                            <div class="mt-3">
                                <p class="text-3xl text-primary">¥{product.price.tall}</p>
                                <p class="text-sm text-gray-500 mt-1">Tall Size</p>
                            </div>

                            <div class="mt-6">
                                <h3 class="sr-only">Description</h3>
                                <div class="text-base text-gray-700 space-y-6">
                                    <p>{product.description}</p>
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div class="mt-8">
                                <h3 class="text-sm font-medium text-gray-900">Size</h3>
                                <div class="mt-4 grid grid-cols-4 gap-4">
                                    {(['short', 'tall', 'grande', 'venti'] as const).map(size => (
                                        <label class="relative flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input type="radio" name="size" value={size} checked={size === 'tall'} class="sr-only peer" form="add-to-cart-form" />
                                            <span class="text-sm font-medium capitalize peer-checked:text-primary">{size}</span>
                                            <span class="text-xs text-gray-500">¥{product.price[size]}</span>
                                            <span class="absolute inset-0 rounded-lg border-2 border-transparent peer-checked:border-primary pointer-events-none"></span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Customizations */}
                            {product.customizations && (
                                <div class="mt-8 border-t border-gray-200 pt-8">
                                    <h3 class="text-sm font-medium text-gray-900">Customization Options Available</h3>
                                    <ul class="mt-4 list-disc pl-5 space-y-2">
                                        {product.customizations.map(custom => (
                                            <li class="text-sm text-gray-600">{custom}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Add to Cart Form */}
                            <form id="add-to-cart-form" method="POST" action="/api/cart/add" class="mt-10">
                                <input type="hidden" name="productId" value={product.id} />
                                <div class="flex items-center space-x-4">
                                    <div class="flex items-center border rounded-md">
                                        <label for="quantity" class="sr-only">Quantity</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value="1"
                                            min="1"
                                            max="10"
                                            class="w-16 text-center border-0 py-2 focus:ring-0"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        class="flex-1 bg-primary border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-primary"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    )
})

export default app
