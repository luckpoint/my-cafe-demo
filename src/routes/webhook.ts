import { Hono } from 'hono'
import { createStripeClient, stripeService } from '../services/stripeService'
import type { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.post('/', async (c) => {
    const signature = c.req.header('stripe-signature')

    if (!signature) {
        console.error('Webhook: Missing stripe-signature header')
        return c.json({ error: 'Missing signature' }, 400)
    }

    const rawBody = await c.req.text()
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)

    let event

    try {
        event = await stripeService.constructWebhookEvent(
            stripe,
            rawBody,
            signature,
            c.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return c.json({
            error: 'Webhook signature verification failed'
        }, 400)
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            console.log('Payment successful for session:', session.id)
            console.log('Customer email:', session.customer_details?.email)
            console.log('Amount total:', session.amount_total)
            console.log('Payment status:', session.payment_status)
            break
        }

        case 'checkout.session.expired': {
            const session = event.data.object
            console.log('Checkout session expired:', session.id)
            break
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object
            console.log('Payment failed:', paymentIntent.id)
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return c.json({ received: true })
})

export default app
