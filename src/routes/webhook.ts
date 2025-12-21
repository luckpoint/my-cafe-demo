import { Hono } from 'hono'
import { createStripeClient, stripeService } from '../services/stripeService'
import { orderService } from '../services/orderService'
import type { Bindings, Variables } from '../types'
import type { CreateOrderItemParams } from '../services/orderService'

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

            try {
                const exists = await orderService.orderExists(c.env.DB, session.id)
                if (exists) {
                    console.log('Order already exists, skipping:', session.id)
                    break
                }

                const userId = session.metadata?.user_id
                const userEmail = session.customer_details?.email

                if (!userId || !userEmail) {
                    console.error('Missing user_id or email in session:', session.id)
                    break
                }

                const fullSession = await stripeService.getSession(stripe, session.id)

                await orderService.createOrder(c.env.DB, {
                    id: session.id,
                    userId,
                    userEmail,
                    stripePaymentIntentId: typeof fullSession.payment_intent === 'string'
                        ? fullSession.payment_intent
                        : fullSession.payment_intent?.id,
                    totalAmount: session.amount_total || 0,
                    currency: session.currency || 'jpy',
                    status: 'completed'
                })

                const lineItems = fullSession.line_items?.data || []
                const orderItems: CreateOrderItemParams[] = lineItems.map(item => {
                    const productData = item.price?.product
                    const metadata = typeof productData === 'object' && productData !== null
                        ? (productData as any).metadata || {}
                        : {}

                    return {
                        orderId: session.id,
                        productId: metadata.product_id || 'unknown',
                        productName: item.description || 'Unknown Product',
                        size: (metadata.size || 'tall') as 'short' | 'tall' | 'grande' | 'venti',
                        unitPrice: item.price?.unit_amount || 0,
                        quantity: item.quantity || 1
                    }
                })

                if (orderItems.length > 0) {
                    await orderService.createOrderItems(c.env.DB, orderItems)
                }

                console.log('Order saved successfully:', session.id)
            } catch (err) {
                console.error('Failed to save order:', err)
            }
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
