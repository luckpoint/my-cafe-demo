import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createStripeClient, stripeService, CheckoutLineItem } from '../services/stripeService'
import type { Bindings, Variables, CartItem } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.post('/create-session', async (c) => {
    const cartCookie = getCookie(c, 'cart')
    let cartItems: CartItem[] = []

    try {
        if (cartCookie) {
            cartItems = JSON.parse(cartCookie)
        }
    } catch (e) {
        return c.json({ error: 'Invalid cart data' }, 400)
    }

    if (cartItems.length === 0) {
        return c.json({ error: 'Cart is empty' }, 400)
    }

    const session = await c.var.auth0Client?.getSession(c)
    const customerEmail = session?.user?.email

    const baseUrl = new URL(c.req.url).origin

    try {
        const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)

        const lineItems: CheckoutLineItem[] = cartItems.map(item => {
            const sizeKey = item.size || 'tall'
            const price = typeof item.price === 'object' ? item.price[sizeKey] : item.price
            return {
                productId: item.id,
                name: item.name,
                price: price,
                quantity: item.quantity,
                size: sizeKey,
                image: item.image?.startsWith('http')
                    ? item.image
                    : `${baseUrl}${item.image}`
            }
        })

        const checkoutSession = await stripeService.createCheckoutSession(
            stripe,
            lineItems,
            `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            `${baseUrl}/checkout/cancel`,
            customerEmail,
            session?.user?.sub
        )

        if (c.req.header('Accept')?.includes('text/html')) {
            return c.redirect(checkoutSession.url!)
        }

        return c.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return c.json({
            error: 'Failed to create checkout session',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

export default app
