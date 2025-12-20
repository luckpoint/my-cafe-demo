import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { createStripeClient, stripeService } from '../services/stripeService'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/success', async (c) => {
    const sessionId = c.req.query('session_id')
    const session = await c.var.auth0Client?.getSession(c)
    const user = session?.user

    let orderDetails = null

    if (sessionId) {
        try {
            const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
            const checkoutSession = await stripeService.getSession(stripe, sessionId)
            orderDetails = {
                amount: checkoutSession.amount_total,
                email: checkoutSession.customer_details?.email,
                paymentStatus: checkoutSession.payment_status
            }

            setCookie(c, 'cart', '', { path: '/', maxAge: 0 })
        } catch (error) {
            console.error('Failed to retrieve session:', error)
        }
    }

    return c.html(
        <Layout title="Order Confirmed">
            <Header user={user} cartCount={0} currentPath="/checkout" />

            <div class="bg-gray-50 min-h-screen py-16">
                <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="bg-white shadow sm:rounded-lg p-8 text-center">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 class="text-3xl font-extrabold text-gray-900 mb-4">
                            Thank you for your order!
                        </h1>

                        <p class="text-lg text-gray-600 mb-8">
                            Your payment has been processed successfully.
                        </p>

                        {orderDetails && (
                            <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                                <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                                <dl class="space-y-2">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Total Amount</dt>
                                        <dd class="font-medium text-gray-900">
                                            {'\u00a5'}{orderDetails.amount?.toLocaleString()}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Confirmation Email</dt>
                                        <dd class="font-medium text-gray-900">
                                            {orderDetails.email}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Payment Status</dt>
                                        <dd class="font-medium text-green-600 capitalize">
                                            {orderDetails.paymentStatus}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/products" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90">
                                Continue Shopping
                            </a>
                            <a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    )
})

app.get('/cancel', async (c) => {
    const session = await c.var.auth0Client?.getSession(c)
    const user = session?.user

    return c.html(
        <Layout title="Checkout Cancelled">
            <Header user={user} cartCount={0} currentPath="/checkout" />

            <div class="bg-gray-50 min-h-screen py-16">
                <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="bg-white shadow sm:rounded-lg p-8 text-center">
                        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                            <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 class="text-3xl font-extrabold text-gray-900 mb-4">
                            Checkout Cancelled
                        </h1>

                        <p class="text-lg text-gray-600 mb-8">
                            Your order has not been placed. Your cart items are still saved.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/cart" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90">
                                Return to Cart
                            </a>
                            <a href="/products" class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    )
})

export default app
