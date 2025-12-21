import Stripe from 'stripe'

export interface CheckoutLineItem {
    productId: string
    name: string
    price: number
    quantity: number
    size: 'short' | 'tall' | 'grande' | 'venti'
    image?: string
}

export function createStripeClient(secretKey: string): Stripe {
    return new Stripe(secretKey, {
        apiVersion: '2025-12-15.clover',
        httpClient: Stripe.createFetchHttpClient()
    })
}

export const stripeService = {
    async createCheckoutSession(
        stripe: Stripe,
        items: CheckoutLineItem[],
        successUrl: string,
        cancelUrl: string,
        customerEmail?: string,
        userId?: string
    ): Promise<Stripe.Checkout.Session> {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
            price_data: {
                currency: 'jpy',
                product_data: {
                    name: `${item.name} (${item.size})`,
                    images: item.image ? [item.image] : undefined,
                    metadata: {
                        product_id: item.productId,
                        size: item.size,
                    },
                },
                unit_amount: item.price,
            },
            quantity: item.quantity,
        }))

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            locale: 'ja',
            ...(customerEmail && { customer_email: customerEmail }),
            ...(userId && { metadata: { user_id: userId } }),
        }

        return stripe.checkout.sessions.create(sessionParams)
    },

    async constructWebhookEvent(
        stripe: Stripe,
        payload: string,
        signature: string,
        webhookSecret: string
    ): Promise<Stripe.Event> {
        return await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret)
    },

    async getSession(stripe: Stripe, sessionId: string): Promise<Stripe.Checkout.Session> {
        return stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent']
        })
    }
}
