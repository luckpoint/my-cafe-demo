import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { getCookie } from 'hono/cookie'

import { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.get('/', async (c) => {
    const session = await c.var.auth0Client?.getSession(c)
    if (session) {
        console.log('--- Auth Check Debug (Cart) ---')
        console.log('User IS authenticated')
        console.log('Session User:', JSON.stringify(session.user, null, 2))
        console.log('---------------------------')
    } else {
        console.log('--- Auth Check Debug (Cart) ---')
        console.log('User is NOT authenticated')
        console.log('---------------------------')
    }
    const user = session?.user

    // TODO: Implement proper cart decoding from cookie or JWT
    // For now assuming empty cart or simple JSON
    const cartCookie = getCookie(c, 'cart')
    let cartItems = []
    try {
        if (cartCookie) {
            cartItems = JSON.parse(cartCookie)
        }
    } catch (e) {
        console.error('Failed to parse cart cookie')
    }

    const subtotal = cartItems.reduce((sum: number, item: any) => {
        const sizePrice = item.price[item.size] || item.price.tall
        return sum + (sizePrice * item.quantity)
    }, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    return c.html(
        <Layout title="Your Cart">
            <Header user={user} cartCount={cartItems.length} currentPath="/cart" />

            <div class="bg-gray-50 min-h-screen py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

                    {cartItems.length === 0 ? (
                        <div class="bg-white shadow sm:rounded-lg p-10 text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">No items</h3>
                            <p class="mt-1 text-sm text-gray-500">Get started by adding some delicious coffee to your cart.</p>
                            <div class="mt-6">
                                <a href="/products" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90">
                                    Browse Menu
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                            <div class="lg:col-span-7">
                                <ul class="border-t border-b border-gray-200 divide-y divide-gray-200 bg-white shadow sm:rounded-lg">
                                    {cartItems.map((item: any) => {
                                        const sizePrice = item.price[item.size] || item.price.tall
                                        return (
                                            <li class="flex py-6 px-4 sm:px-6">
                                                <div class="flex-shrink-0">
                                                    <img src={item.image} alt={item.name} class="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32" />
                                                </div>
                                                <div class="ml-4 flex-1 flex flex-col sm:ml-6">
                                                    <div>
                                                        <div class="flex justify-between">
                                                            <h4 class="text-sm font-medium text-gray-700">{item.name}</h4>
                                                            <p class="ml-4 text-sm font-medium text-gray-900">¥{sizePrice}</p>
                                                        </div>
                                                        <p class="mt-1 text-sm text-gray-500 capitalize">{item.size || 'tall'}</p>
                                                    </div>
                                                    <div class="mt-4 flex-1 flex items-end justify-between">
                                                        {/* Quantity Controls */}
                                                        <div class="flex items-center space-x-2">
                                                            <form method="POST" action="/api/cart/update" class="inline">
                                                                <input type="hidden" name="productId" value={item.id} />
                                                                <input type="hidden" name="size" value={item.size} />
                                                                <input type="hidden" name="quantity" value={String(item.quantity - 1)} />
                                                                <button type="submit" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                                                                    -
                                                                </button>
                                                            </form>
                                                            <span class="text-sm text-gray-700 w-8 text-center">{item.quantity}</span>
                                                            <form method="POST" action="/api/cart/update" class="inline">
                                                                <input type="hidden" name="productId" value={item.id} />
                                                                <input type="hidden" name="size" value={item.size} />
                                                                <input type="hidden" name="quantity" value={String(item.quantity + 1)} />
                                                                <button type="submit" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                                                                    +
                                                                </button>
                                                            </form>
                                                        </div>
                                                        {/* Remove Button */}
                                                        <form method="POST" action="/api/cart/remove">
                                                            <input type="hidden" name="productId" value={item.id} />
                                                            <input type="hidden" name="size" value={item.size} />
                                                            <button type="submit" class="text-sm font-medium text-primary hover:text-opacity-80">
                                                                Remove
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>

                            {/* Summary */}
                            <div class="lg:col-span-5 mt-16 lg:mt-0 bg-white shadow sm:rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                                <h2 class="text-lg font-medium text-gray-900">Order summary</h2>
                                <dl class="mt-6 space-y-4">
                                    <div class="flex items-center justify-between">
                                        <dt class="text-sm text-gray-600">Subtotal</dt>
                                        <dd class="text-sm font-medium text-gray-900">¥{subtotal}</dd>
                                    </div>
                                    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <dt class="text-base font-medium text-gray-900">Order total</dt>
                                        <dd class="text-base font-medium text-gray-900">¥{total}</dd>
                                    </div>
                                </dl>
                                <div class="mt-6">
                                    <form action="/api/checkout/create-session" method="POST">
                                        <button type="submit" class="w-full bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-primary">
                                            Proceed to Checkout
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </Layout>
    )
})

export default app
